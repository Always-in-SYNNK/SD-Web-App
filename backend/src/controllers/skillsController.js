import {
    getSkillsByField,
    getApplicantSkills,
    getOpportunitySkills,
    setApplicantSkills,
    setOpportunitySkills
} from "../services/skillsService.js";
import { supabase } from "../config/supabaseClient.js";

export async function getSkills(req, res, next) {
    try {
        // Fix: Extract fieldName from params correctly
        const fieldName = req.params.fieldName;
        
        if (!fieldName) {
            return res.status(400).json({ 
                success: false, 
                error: "Field name is required" 
            });
        }

        const data = await getSkillsByField(fieldName);
        res.json({ success: true, count: data?.length || 0, data });
    } catch (error) {
        console.error("getSkills failed: ", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function getApplicant(req, res, next) {
    try {
        // Fix: Extract applicantId from params correctly, not the whole params object
        const { applicantId } = req.params;
        
        if (!applicantId) {
            return res.status(400).json({ 
                success: false, 
                error: "Applicant ID is required" 
            });
        }
        
        const data = await getApplicantSkills(applicantId);
        res.json({ success: true, applicantSkills: data });
    } catch (error) {
        console.error("getApplicant failed: ", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function getOppSkills(req, res, next) {
    try {
        // Fix: Extract opportunityId from params correctly
        const { opportunityId } = req.params;
        
        if (!opportunityId) {
            return res.status(400).json({ 
                success: false, 
                error: "Opportunity ID is required" 
            });
        }
        
        // Fix: Pass opportunityId, not undefined variable 'opportunitySkills'
        const data = await getOpportunitySkills(opportunityId);
        res.json({ success: true, opportunitySkills: data });
    } catch (error) {
        console.error("getOppSkills failed: ", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function setAppSkills(req, res, next) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required" 
            });
        }
        
        // Fix: Get skillIds from req.body, not req.params
        const { skillIds } = req.body;
        
        if (!skillIds || !Array.isArray(skillIds)) {
            return res.status(400).json({ 
                success: false, 
                error: "skillIds must be provided as an array" 
            });
        }
        
        // First, get the applicant profile ID from the user ID
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", userId)
            .single();
        
        if (profileError || !profile) {
            return res.status(404).json({ 
                success: false, 
                error: "Profile not found" 
            });
        }
        
        const { data: applicant, error: applicantError } = await supabase
            .from("applicant_profiles")
            .select("id")
            .eq("profile_id", profile.id)
            .single();
        
        if (applicantError || !applicant) {
            return res.status(404).json({ 
                success: false, 
                error: "Applicant profile not found" 
            });
        }
        
        // Fix: Await the async function and pass the correct parameters
        const result = await setApplicantSkills(applicant.id, skillIds);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("setAppSkills failed: ", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function setOppSkills(req, res, next) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required" 
            });
        }
        
        // Fix: Get opportunityId from params and skillIds from body
        const { opportunityId } = req.params;
        const { skillIds } = req.body;
        
        if (!opportunityId) {
            return res.status(400).json({ 
                success: false, 
                error: "Opportunity ID is required" 
            });
        }
        
        if (!skillIds || !Array.isArray(skillIds)) {
            return res.status(400).json({ 
                success: false, 
                error: "skillIds must be provided as an array" 
            });
        }
        
        // Optional: Verify the user owns this opportunity
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", userId)
            .single();
        
        if (profileError || !profile) {
            return res.status(404).json({ 
                success: false, 
                error: "Profile not found" 
            });
        }
        
        const { data: opportunity, error: opportunityError } = await supabase
            .from("opportunities")
            .select("created_by")
            .eq("id", opportunityId)
            .single();
        
        if (opportunityError || !opportunity) {
            return res.status(404).json({ 
                success: false, 
                error: "Opportunity not found" 
            });
        }
        
        // Check if user owns the opportunity
        if (opportunity.created_by !== profile.id) {
            return res.status(403).json({ 
                success: false, 
                error: "Not authorized to modify this opportunity's skills" 
            });
        }
        
        // Fix: Await the async function
        const result = await setOpportunitySkills(opportunityId, skillIds);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("setOppSkills failed: ", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}