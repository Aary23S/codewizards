import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserById, createMentorshipRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProfileView = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);
    const [reqError, setReqError] = useState("");

    const handleRequest = async () => {
        if (!message.trim()) return setReqError("Please write a message");
        try {
            await createMentorshipRequest({ mentorId: profile._id, message });
            setSent(true);
        } catch (err) {
            setReqError(err.response?.data?.message || "Failed to send request");
        }
    };

    useEffect(() => {
        getUserById(id)
            .then((res) => setProfile(res.data.data))
            .catch(() => navigate("/"))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return <div className="text-center text-gray-500 py-32">Loading...</div>;
    if (!profile) return null;

    const isOwnProfile = currentUser?._id === id;

    const platformLinks = [
        { label: "GitHub", url: profile.github },
        { label: "LinkedIn", url: profile.linkedin },
        { label: "LeetCode", url: profile.leetcode },
        { label: "Codeforces", url: profile.codeforces },
        { label: "Portfolio", url: profile.portfolio },
    ].filter((l) => l.url);

    return (
        <div className="max-w-3xl mx-auto px-4 py-20">

            {/* Header */}
            <div className="border border-gray-800 rounded-xl p-8 bg-gray-900 mb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-2xl">
                            {profile.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                            <p className="text-gray-500 text-sm capitalize mt-0.5">
                                {profile.role} {profile.batch ? `· Batch ${profile.batch}` : ""}
                            </p>
                            {profile.isMentor && (
                                <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                                    Open to Mentor
                                </span>
                            )}
                        </div>
                    </div>

                    {isOwnProfile && (
                        <Link to={`/profile/${id}/edit`}
                            className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-4 py-2 rounded-lg transition-colors">
                            Edit Profile
                        </Link>
                    )}
                </div>

                {profile.bio && (
                    <p className="text-gray-400 text-sm leading-relaxed mt-6">{profile.bio}</p>
                )}
            </div>

            {/* Domains */}
            {profile.domain?.length > 0 && (
                <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 mb-6">
                    <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Domains</h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.domain.map((d) => (
                            <span key={d} className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-lg">{d}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Platform Links */}
            {platformLinks.length > 0 && (
                <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 mb-6">
                    <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Links</h2>
                    <div className="flex flex-wrap gap-3">
                        {platformLinks.map((l) => (
                            <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                                className="text-sm border border-gray-700 text-gray-300 hover:border-white hover:text-white px-4 py-2 rounded-lg transition-colors">
                                {l.label} →
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Mentorship button — only show to other logged-in users */}
            {!isOwnProfile && profile.isMentor && currentUser && (
                <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
                    <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Request Mentorship</h2>
                    {sent ? (
                        <p className="text-white text-sm">Request sent! {profile.name.split(" ")[0]} will respond soon.</p>
                    ) : (
                        <>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                                placeholder="Introduce yourself and what you'd like guidance on..."
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none mb-3" />
                            {reqError && <p className="text-red-400 text-xs mb-2">{reqError}</p>}
                            <button onClick={handleRequest}
                                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                                Send Request
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileView;