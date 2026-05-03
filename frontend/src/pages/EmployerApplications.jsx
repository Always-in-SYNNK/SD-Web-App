import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationsForOpportunity, updateApplicationStatus } from '../services/employerApplicationService';
import EmployerApplicationCard from '../components/employer/EmployerApplicationCard';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const statusTabs = ['all', 'received', 'shortlisted', 'accepted', 'rejected'];

const EmployerApplications = () => {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const providerUser = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Check if logged in and token exists
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/prov-login");
        }
    }, [navigate]);

    const fetchApplications = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please login again");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getApplicationsForOpportunity(opportunityId);
            if (response.success) {
                setApplications(response.data);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [opportunityId]);

    useEffect(() => {
        if (opportunityId) {
            fetchApplications();
        } else {
            setError("No opportunity selected");
            setLoading(false);
        }
    }, [fetchApplications, opportunityId]);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredApps(applications);
        } else {
            setFilteredApps(applications.filter(app => app.status === statusFilter));
        }
    }, [statusFilter, applications]);

    const stats = {
        total: applications.length,
        received: applications.filter(a => a.status === 'received').length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    const handleShortlist = async (appId) => {
        setProcessingId(appId);
        try {
            const response = await updateApplicationStatus(appId, 'shortlisted');
            if (response.success) {
                await fetchApplications();
                setSuccessMessage(response.message);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAccept = async (appId) => {
        setProcessingId(appId);
        try {
            const response = await updateApplicationStatus(appId, 'offered'); //applicants will accept on their side
            if (response.success) {
                await fetchApplications();
                setSuccessMessage(response.message);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (appId) => {
        setProcessingId(appId);
        try {
            const response = await updateApplicationStatus(appId, 'rejected');
            if (response.success) {
                await fetchApplications();
                setSuccessMessage(response.message);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setProcessingId(null);
        }
    };

    if (!opportunityId) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Sidebar />
                <Topbar providerUser={providerUser} />
                <section className="ml-72 p-8">
                    <p className="text-red-500">No opportunity selected. Please go back to pipeline.</p>
                    <button onClick={() => navigate('/pipeline')} className="mt-4 text-blue-600">← Back to Pipeline</button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#faf9f8]">
            <Sidebar />
            <Topbar providerUser={providerUser} />

            <section className="ml-72 p-8">
                <header className="mb-8">
                    <button
                        onClick={() => navigate('/pipeline')}
                        className="text-[#035b9d] hover:text-[#3174b7] flex items-center gap-1 text-sm mb-4"
                    >
                        ← Back to Pipeline
                    </button>
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-[#1b1c1c] mb-2">
                        Applications
                    </h1>
                    <p className="text-[#404850]">Review and manage candidates for this opportunity</p>
                </header>

                {successMessage && (
                    <section className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-5 py-3.5 text-sm font-medium mb-6">
                        ✓ {successMessage}
                    </section>
                )}

                {error && (
                    <section className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-3.5 text-sm font-medium mb-6">
                        ⚠ {error}
                    </section>
                )}

                {/* Stats Cards */}
                <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
                        <p className="text-xs uppercase text-[#707881]">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </article>
                    <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
                        <p className="text-xs uppercase text-[#707881]">Received</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.received}</p>
                    </article>
                    <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
                        <p className="text-xs uppercase text-[#707881]">Shortlisted</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.shortlisted}</p>
                    </article>
                    <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                        <p className="text-xs uppercase text-[#707881]">Accepted</p>
                        <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                    </article>
                    <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
                        <p className="text-xs uppercase text-[#707881]">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </article>
                </section>

                {/* Filter Tabs */}
                <nav className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
                    {statusTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                                statusFilter === tab 
                                    ? 'bg-[#035b9d] text-white shadow-md' 
                                    : 'text-[#404850] hover:bg-gray-100'
                            }`}
                        >
                            {tab} ({stats[tab === 'all' ? 'total' : tab]})
                        </button>
                    ))}
                </nav>

                {loading ? (
                    <section className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin" />
                    </section>
                ) : filteredApps.length === 0 ? (
                    <section className="text-center py-16 bg-white rounded-xl">
                        <p className="text-[#707881]">No applications found</p>
                        <p className="text-sm text-[#707881] mt-1">
                            {statusFilter !== 'all' 
                                ? `No ${statusFilter} applications for this opportunity` 
                                : 'No one has applied to this opportunity yet'}
                        </p>
                    </section>
                ) : (
                    <section className="space-y-4">
                        {filteredApps.map(app => (
                            <EmployerApplicationCard
                                key={app.applicationId}
                                application={app}
                                onShortlist={handleShortlist}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                isProcessing={processingId === app.applicationId}
                                token={token}
                            />
                        ))}
                    </section>
                )}
            </section>
        </main>
    );
};

export default EmployerApplications;