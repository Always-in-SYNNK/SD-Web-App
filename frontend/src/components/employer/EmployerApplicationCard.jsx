import { useState, useEffect } from 'react';
import {
    getApplicationDetails,
    getApplicationCvSignedUrl,
} from '../../services/employerApplicationService';

const STATUS_CONFIG = {
    received: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending Review' },
    shortlisted: { color: 'bg-blue-100 text-blue-800', icon: '⭐', label: 'Shortlisted' },
    offered: { color: 'bg-green-100 text-green-800', icon: '📩', label: 'Offer Sent' },
    accepted: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Rejected' }
};

const SectionBlock = ({ title, children }) => (
    <section className="bg-gray-50 rounded-xl p-4 relative overflow-hidden"> 
        <h4 className="text-sm font-bold text-gray-700 mb-3 ml-2">{title}</h4>
        <div className="ml-2">{children}</div>
    </section>
);

const EmployerApplicationCard = ({ application, onShortlist, onOffer, onReject, isProcessing = false, token }) => {

    const [isExpanded, setIsExpanded] = useState(false); 
    const [skills, setSkills]               = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsFetched, setDetailsFetched] = useState(false); // fetch once only
    const [cvUrl, setCvUrl] = useState(null);

    const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.received;
    const { applicant, status, appliedAt, matchScore } = application;

    // Normalize match score to a 0-100 integer percentage for display.
    const matchPercent = (() => {
        if (matchScore === undefined || matchScore === null) return null;
        const n = Number(matchScore);
        if (Number.isNaN(n)) return null;
        return n <= 1 ? Math.round(n * 100) : Math.round(n);
    })();

    const formatDate = (date) => new Date(date).toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // Fetch skills + qualifications the first time the card is expanded
    useEffect(() => {
        if (!isExpanded || detailsFetched || !applicant.applicantProfileId) return;

        const fetchDetails = async () => {
            setDetailsLoading(true);
            try {
                const detailsData = await getApplicationDetails(application.applicationId, token);

                if (detailsData.success) {
                    setSkills(detailsData.applicantSkills || detailsData.data || detailsData.skills || []);
                }

                const qualificationsData =
                    detailsData.qualifications ||
                    detailsData.profile?.qualifications ||
                    detailsData.profile?.data?.qualifications ||
                    [];

                setQualifications(qualificationsData);

            } catch (err) {
                console.error('Failed to fetch applicant details:', err);
            } finally {
                setDetailsLoading(false);
                setDetailsFetched(true);
            }
        };

        fetchDetails();
    }, [isExpanded, detailsFetched, applicant.applicantProfileId, application.applicationId, token]);

    useEffect(() => {
        const fetchSignedCvUrl = async () => {
            if (!application.applicationId) return;

            try {
                const data = await getApplicationCvSignedUrl(application.applicationId, token);

                if (data.signed_url) {
                    setCvUrl(data.signed_url);
                }
            } catch (err) {
                console.error("Failed to fetch signed CV URL:", err);
            }
        };

        if (isExpanded) {
            fetchSignedCvUrl();
        }
    }, [application.applicationId, isExpanded, token]);

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
                        <section className="flex flex-wrap items-center gap-3">
                            <section>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {applicant.name}{applicant.surname ? ` ${applicant.surname}` : ''}
                                </h3>
                                <p className="text-sm text-gray-500">{applicant.email}</p>
                            </section>
                            {matchPercent !== null && (
                                <aside aria-label="match-score" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm font-semibold">
                                    {`Match: ${matchPercent}%`}
                                </aside>
                            )}
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
                        <SectionBlock title="About">
                            <p className="text-sm text-gray-600 leading-relaxed">{applicant.bio}</p>
                        </SectionBlock>
                    )}

                    {/* Loading state for fetched details */}
                    {detailsLoading && (
                        <p className="text-xs text-gray-400 animate-pulse">Loading profile details…</p>
                    )}

                    {/* Skills */}
                    {!detailsLoading && (
                        <SectionBlock title="Skills">
                            {skills.length === 0 ? (
                                <p className="text-sm text-gray-400">No skills listed.</p>
                            ) : (
                                <ul className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <li
                                            key={skill.id ?? skill.skills_id}
                                            className="px-3 py-1 bg-blue-50 text-[#035b9d] font-semibold rounded-full text-xs list-none"
                                        >
                                            {skill.title ?? skill.skill_title ?? skill.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SectionBlock>
                    )}

                    {/* Qualifications */}
                    {!detailsLoading && (
                        <SectionBlock title="Qualifications">
                            {qualifications.length === 0 ? (
                                <p className="text-sm text-gray-400">No qualifications listed.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {qualifications.map((q) => (
                                        <li
                                            key={q.id}
                                            className="flex items-start gap-3 bg-white border border-gray-100 p-3 rounded-xl"
                                        >
                                            <figure className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base shrink-0">
                                                🎓
                                            </figure>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {q.title ?? q.qualification_name}
                                                </p>
                                                {q.field && (
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {q.field}{q.subfield ? ` · ${q.subfield}` : ''}
                                                    </p>
                                                )}
                                                {q.originator && (
                                                    <p className="text-xs text-gray-400">{q.originator}</p>
                                                )}
                                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                                    {q.nqf_level && (
                                                        <span className="text-xs bg-blue-50 text-[#035b9d] px-2 py-0.5 rounded-full font-semibold">
                                                            NQF {q.nqf_level}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                        q.status === 'completed'
                                                            ? 'bg-green-50 text-green-600'
                                                            : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {q.status === 'completed' ? 'Completed' : 'In Progress'}
                                                    </span>
                                                    {q.date_obtained && (
                                                        <span className="text-xs text-gray-300">{q.date_obtained}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SectionBlock>
                    )}

                    <SectionBlock title="Uploads">
                        {cvUrl ? (
                            <a
                                href={cvUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                📄 CV / Resume
                            </a>
                        ) : (
                            <p className="text-gray-400 text-sm">No CV uploaded yet.</p>
                        )}
                    </SectionBlock>



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
                                onClick={(e) => { e.stopPropagation(); onOffer(application.applicationId); }}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                📩 Send Offer
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

                    {status === 'offered' && (
                        <section className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">📩 Offer has been sent. Waiting for the applicant's response.</p>
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