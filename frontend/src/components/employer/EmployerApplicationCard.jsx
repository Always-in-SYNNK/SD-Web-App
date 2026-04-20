import { useState } from 'react';

const STATUS_CONFIG = {
    received: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending Review' },
    shortlisted: { color: 'bg-blue-100 text-blue-800', icon: '⭐', label: 'Shortlisted' },
    accepted: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Rejected' }
};

const EmployerApplicationCard = ({ application, onShortlist, onAccept, onReject, isProcessing = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.received;
    const { applicant, status, appliedAt } = application;

    const formatDate = (date) => new Date(date).toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
        <article className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <header 
                className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <section className="flex items-center justify-between">
                    <section className="flex items-center gap-4">
                        <figure className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg">
                            {applicant.name?.charAt(0) || 'A'}
                        </figure>
                        <section>
                            <h3 className="font-bold text-lg text-gray-900">{applicant.name}</h3>
                            <p className="text-sm text-gray-500">{applicant.email}</p>
                        </section>
                    </section>
                    <section className="text-right">
                        <p className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${config.color}`}>
                            {config.icon} {config.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Applied {formatDate(appliedAt)}</p>
                    </section>
                </section>
            </header>

            {isExpanded && (
                <section className="px-6 pb-6 pt-4 space-y-4">
                    {/* Applicant Details */}
                    <section className="grid grid-cols-2 gap-4">
                        {applicant.location && (
                            <article className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium text-gray-800">📍 {applicant.location}</p>
                            </article>
                        )}
                        {applicant.nqfLevel && (
                            <article className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">NQF Level</p>
                                <p className="font-medium text-gray-800">🎓 NQF {applicant.nqfLevel}</p>
                            </article>
                        )}
                    </section>

                    {applicant.bio && (
                        <section>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{applicant.bio}</p>
                        </section>
                    )}

                    {applicant.cvUrl && (
                        <section>
                            <a href={applicant.cvUrl} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}>
                                📄 Download CV / Resume
                            </a>
                        </section>
                    )}

                    {/* Action Buttons based on status */}
                    {status === 'received' && (
                        <nav className="flex gap-3 pt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onShortlist(application.applicationId); }}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                ⭐ Shortlist
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onReject(application.applicationId); }}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                ❌ Reject
                            </button>
                        </nav>
                    )}

                    {status === 'shortlisted' && (
                        <nav className="flex gap-3 pt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onAccept(application.applicationId); }}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                ✅ Accept Offer
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onReject(application.applicationId); }}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                ❌ Reject
                            </button>
                        </nav>
                    )}

                    {/* Status Messages */}
                    {status === 'shortlisted' && (
                        <section className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700">⭐ Candidate has been shortlisted. You can now accept or reject.</p>
                        </section>
                    )}

                    {status === 'accepted' && (
                        <section className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">✅ Candidate has accepted the offer!</p>
                        </section>
                    )}

                    {status === 'rejected' && (
                        <section className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-700">❌ This application has been rejected.</p>
                        </section>
                    )}
                </section>
            )}
        </article>
    );
};

export default EmployerApplicationCard;