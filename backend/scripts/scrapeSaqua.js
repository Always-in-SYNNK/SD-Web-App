// backend/scripts/scrapeSaqua.js – Optimised for coverage
import { supabase } from '../src/config/supabaseClient.js';

const SAQA_SEARCH_URL = 'https://allqs.saqa.org.za/search.php';
const REQUEST_DELAY = 1000;          // ms between requests
const MAX_PAGES_PER_FIELD = 5;       // how many pages (20 results each) per combination
const TARGET_NQF_LEVELS = [4,5,6,7,8]; // only keep these levels

const FIELDS = [
    { id: '01', name: 'Agriculture and Nature Conservation' },
    { id: '02', name: 'Culture and Arts' },
    { id: '03', name: 'Business, Commerce and Management Studies' },
    { id: '04', name: 'Communication Studies and Language' },
    { id: '05', name: 'Education, Training and Development' },
    { id: '06', name: 'Manufacturing, Engineering and Technology' },
    { id: '07', name: 'Human and Social Studies' },
    { id: '08', name: 'Law, Military Science and Security' },
    { id: '09', name: 'Health Sciences and Social Services' },
    { id: '10', name: 'Physical, Mathematical, Computer and Life Sciences' },
    { id: '11', name: 'Services' },
    { id: '12', name: 'Physical Planning and Construction' },
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Attempt ${i+1} failed:`, error.message);
            if (i === retries-1) throw error;
            await delay(REQUEST_DELAY * 2);
        }
    }
}

async function searchUnitStandards({ fieldId, nqfLevel, start = 0 }) {
    const formData = new URLSearchParams();
    formData.append('UNIT_STD_TITLE', '');
    formData.append('UNIT_STANDARD_ID', '');
    formData.append('NQF_LEVEL_ID', nqfLevel);          // pre-2009 NQF level filter
    formData.append('NQF_LEVEL_G2_ID', '');
    formData.append('ABET_BAND_ID', '');
    formData.append('SUBFIELD_ID', '');                // no subfield – get everything
    formData.append('ORIGINATOR_ID', '');
    formData.append('FIELD_ID', fieldId);
    formData.append('ACCRED_PROVIDER_ID', '');
    formData.append('SEARCH_TEXT', '');
    formData.append('GO', 'Go');
    formData.append('cat', 'unit');
    formData.append('searchResultsATfirst', start.toString());

    const html = await fetchWithRetry(SAQA_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    });
    return html;
}

function extractUnitStandardsList(html) {
    const results = [];
    const rowRegex = /<tr>\s*<td valign=top><a href="showUnitStandard\.php\?id=(\d+)">\d+<\/a><\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>([^<]+)<\/td>\s*<td valign=top>(\d*)<\/td>\s*<td valign=top>(.*?)<\/td>/gs;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        const nqfMatch = match[3].match(/Level\s*(\d+)/i);
        const nqfLevel = nqfMatch ? parseInt(nqfMatch[1]) : null;
        const credits = match[9] && match[9].trim() ? parseInt(match[9]) : null;
        results.push({
            saqa_us_id: match[1],
            title: match[2].trim(),
            pre_2009_nqf_level: match[3].trim(),
            nqf_level: nqfLevel,
            learning_subfield: match[6].trim(),
            originator: match[7].trim(),
            field: match[8].trim(),
            credits,
            status: match[10].replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').trim(),
        });
    }
    return results;
}

function extractPaginationInfo(html) {
    const match = html.match(/Result:\s*(\d+)-(\d+)\s+of\s+(\d+)/i);
    if (match) {
        return { start: parseInt(match[1]), end: parseInt(match[2]), total: parseInt(match[3]) };
    }
    return null;
}

async function saveToDatabase(unitStandard) {
    const { error } = await supabase
        .from('unit_standards')
        .upsert({
            saqa_us_id: unitStandard.saqa_us_id,
            title: unitStandard.title,
            originator: unitStandard.originator,
            field: unitStandard.field,
            subfield: unitStandard.learning_subfield,
            nqf_level: unitStandard.nqf_level,
            registration_status: unitStandard.status,
        }, { onConflict: 'saqa_us_id' });
    if (error) {
        console.error(`Error saving ${unitStandard.saqa_us_id}:`, error.message);
        return false;
    }
    console.log(`Saved: ${unitStandard.saqa_us_id} - ${unitStandard.title.substring(0,50)}`);
    return true;
}

async function scrapeField(fieldId, fieldName, nqfLevel = null) {
    console.log(`\n📂 ${fieldName} (${fieldId}) | NQF = ${nqfLevel || 'ALL'}`);
    let page = 0;
    let start = 0;
    let saved = 0;

    while (page < MAX_PAGES_PER_FIELD) {
        const html = await searchUnitStandards({ fieldId, nqfLevel: nqfLevel?.toString() || '', start });
        const items = extractUnitStandardsList(html);
        if (items.length === 0) break;

        for (const us of items) {
            // Apply NQF filter (only keep levels 4-8 if not already filtered)
            if (!nqfLevel && (us.nqf_level < 4 || us.nqf_level > 8)) continue;
            const ok = await saveToDatabase(us);
            if (ok) saved++;
            await delay(REQUEST_DELAY);
        }

        const pag = extractPaginationInfo(html);
        if (!pag || pag.end >= pag.total) break;
        start = pag.end;   // next page
        page++;
        await delay(REQUEST_DELAY);
    }
    console.log(`   ✅ Saved ${saved} records for ${fieldName} (NQF ${nqfLevel || 'ALL'})`);
    return saved;
}

async function scrapeAll() {
    let grandTotal = 0;
    for (const field of FIELDS) {
        // First, get everything (no NQF filter) – this will include many records
        const total = await scrapeField(field.id, field.name, null);
        grandTotal += total;

        // Optionally, also fetch each NQF level individually to ensure we get enough from each level
        // (the unrestricted search already covers them, but this may add extra if pagination was limited)
        for (const nqf of TARGET_NQF_LEVELS) {
            const extra = await scrapeField(field.id, field.name, nqf);
            grandTotal += extra;
        }
        await delay(REQUEST_DELAY * 2);
    }
    console.log(`\n🎉 TOTAL UNIT STANDARDS SAVED: ${grandTotal}`);
}

scrapeAll().catch(console.error);