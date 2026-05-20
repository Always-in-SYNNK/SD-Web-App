import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getMatchingOpportunities } from '../../services/matchingService';
import { OpportunityCard } from './OpportunityCard';

function getOpportunityKey(opportunity) {
    return String(opportunity?.id ?? opportunity?.opportunityId ?? '');
}

export function MatchingOpportunities({ appliedOpportunityIds: sharedAppliedOpportunityIds = null }) {
    const { token } = useAuth();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const appliedOpportunityIds = sharedAppliedOpportunityIds ?? new Set();

    useEffect(() => {
        const loadMatchingOpportunities = async () => {
            if (!token) {
                setError('Unable to load matches without authentication.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getMatchingOpportunities(token);
                setOpportunities(response.data || []);
            } catch (err) {
                console.error('Error loading matches:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadMatchingOpportunities();
    }, [token]);

    if (loading) {
        return (
            <section className="flex justify-center items-center py-12" role="status" aria-live="polite">
                <figure className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-hidden="true" />
            </section>
        );
    }
    if (error) {
        return (
            <aside className="bg-red-50 text-red-600 p-4 rounded-lg" role="alert">
                Error: {error}
            </aside>
        );
    }
    if (opportunities.length === 0) {
        return (
            <section className="text-center py-12" aria-live="polite">
                <p className="text-gray-500">No matching opportunities found yet.</p>
                <p className="text-sm text-gray-400 mt-2">Update your skills and profile to see better matches.</p>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <header className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Matched Opportunities</h2>
                <p className="text-sm text-gray-500">{opportunities.length} matches found</p>
            </header>

            <ul className="space-y-4">
                {opportunities.map((opportunity) => (
                    <li key={opportunity.id} className="relative list-none">
                        <OpportunityCard
                            {...opportunity}
                            isApplied={Boolean(opportunity.isApplied) || appliedOpportunityIds.has(getOpportunityKey(opportunity))}
                        />

                        <aside className="absolute right-4 md:right-36 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm font-semibold" aria-hidden="true">
                            Match Score: <strong className="text-blue-900 font-bold">{Math.round(opportunity.score * 100)}%</strong>
                        </aside>
                    </li>
                ))}
            </ul>
        </section>
    );
}