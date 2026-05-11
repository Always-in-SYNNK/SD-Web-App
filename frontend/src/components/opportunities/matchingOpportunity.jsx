import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getMatchingOpportunities } from '../../services/matchingService';
import { OpportunityCard } from './OpportunityCard';

export function MatchingOpportunities() {
    const { token } = useAuth();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMatchingOpportunities();
    }, [token]);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error: {error}
            </div>
        );
    }
    if (opportunities.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No matching opportunities found yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                    Update your skills and profile to see better matches.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Matched Opportunities</h2>
                <div className="text-sm text-gray-500">
                    {opportunities.length} matches found
                </div>
            </div>
            <div className="space-y-4">
                {opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="relative">
                        <OpportunityCard {...opportunity} />
                        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Match Score: {Math.round(opportunity.score * 100)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}