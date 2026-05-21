import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getMatchingOpportunities } from '../../services/matchingService';
import { OpportunityCard } from './OpportunityCard';

function getOpportunityKey(opportunity) {
    return String(opportunity?.id ?? opportunity?.opportunityId ?? '');
}

const ScoreRing = ({ score }) => {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score);

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <circle
        cx="22" cy="22" r={r}
        fill="none" stroke="#e5e7eb" strokeWidth="4"
      />
      <circle
        cx="22" cy="22" r={r}
        fill="none" stroke="#185FA5" strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
    </svg>
  );
};

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
                    <li key={opportunity.id} className="flex items-stretch gap-2.5 list-none">
                    <section className="flex-1 min-w-0">
                        <OpportunityCard
                            {...opportunity}
                            isApplied={Boolean(opportunity.isApplied) || appliedOpportunityIds.has(getOpportunityKey(opportunity))}
                        />
                    </section>

                    <aside
                        className="flex flex-col items-center justify-center gap-1 px-5 bg-white border border-gray-100 rounded-xl shrink-0 min-w-[96px]"
                        aria-label={`Match score: ${Math.round(opportunity.score * 100)}%`}
                    >
                        <ScoreRing score={opportunity.score} />
                        <strong className="text-xl font-semibold text-[#185FA5] leading-none">
                            {Math.round(opportunity.score * 100)}%
                        </strong>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                            match
                        </p>
                    </aside>
                    </li>
                ))}
            </ul>
        </section>
    );
}