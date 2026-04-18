import { supabase } from "../config/supabaseClient.js";

export async function applyToOpportunity({ userId, opportunityId }) {
  const { error } = await supabase.rpc("apply_to_opportunity", {
    p_user_id: userId,
    p_opportunity_id: opportunityId,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}