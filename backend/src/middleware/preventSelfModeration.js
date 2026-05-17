import { supabase } from "../config/supabaseClient.js";

export const preventSelfModeration = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get opportunity provider
    const { data: opportunity, error: oppError } = await supabase
      .from("opportunities")
      .select("provider_id")
      .eq("id", id)
      .single();

    if (oppError || !opportunity) {
      return res.status(404).json({
        success: false,
        error: "Opportunity not found",
      });
    }

    // Get linked provider profile
    const { data: providerProfile, error: providerError } = await supabase
      .from("provider_profiles")
      .select("profile_id")
      .eq("id", opportunity.provider_id)
      .single();

    if (providerError || !providerProfile) {
      return res.status(404).json({
        success: false,
        error: "Provider profile not found",
      });
    }

    // Prevent self moderation
    if (providerProfile.profile_id === req.user.profileId) {
      return res.status(403).json({
        success: false,
        error: "You cannot moderate your own opportunity",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};