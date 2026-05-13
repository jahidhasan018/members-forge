import apiFetch from "@wordpress/api-fetch";
import { Spinner } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const Members = () => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = () => {
        setLoading(true);
        apiFetch({ path: '/members-forge/v1/memberships' })
            .then( (response) => {
                setMembers(response.data || []);
                setLoading(false);
            })
            .catch( (error) => {
                console.error('Failed to fetch members:', error);
                setLoading(false);
            });
    }

    // Show loading spinner and text on loading
    if( loading ){
        return (
            <div className="mf-loading">
                <Spinner />
                <span>{ __('Loading...', 'members-forge') }</span>
            </div>
        );
    }

    // Empty state if no members found
    if( members.length === 0 ){
        return(
            <div className="mf-empty">
                <p>{ __('No members found.', 'members-forge') }</p>
            </div>
        );
    }
    
    /**
     * Status change করা হচ্ছে
     * PUT /members-forge/v1/memberships/{id}/status
     */
    const handleStatusChange = (member, newStatus) => {
        // Dropdown বন্ধ করো
        setOpenDropdown(null);

        // Optimistic update — API call এর আগেই UI তে দেখাও
        // এতে UI fast feel হয়
        setMembers((prev) =>
            prev.map((m) => m.id === member.id ? { ...m, status: newStatus } : m)
        );

        apiFetch({
            path: `/members-forge/v1/memberships/${member.id}/status`,
            method: 'PUT',
            data: { status: newStatus },
        }).catch((error) => {
            console.error('Failed to update status:', error);
            // API fail হলে পুরনো status ফিরিয়ে দাও
            setMembers((prev) =>
                prev.map((m) => m.id === member.id ? { ...m, status: member.status } : m)
            );
        });
    };

    /**
     * Membership delete করা হচ্ছে
     * DELETE /members-forge/v1/memberships/{id}
     */
    const handleDelete = (member) => {
        if (!window.confirm(
            __('Are you sure you want to delete', 'members-forge') + ` "${member.display_name}"'s membership?`
        )) return;

        apiFetch({
            path: `/members-forge/v1/memberships/${member.id}`,
            method: 'DELETE',
        }).then(() => {
            // Delete হলে local state থেকে সরিয়ে দাও — refetch দরকার নেই
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
        }).catch((error) => {
            console.error('Failed to delete membership:', error);
            alert(__('Error deleting membership. Please try again.', 'members-forge'));
        });
    };

    /**
     * Status এর জন্য color class — Levels এর status badge এর মতোই pattern
     */
    const getStatusClass = (status) => {
        const map = {
            active:    'bg-emerald-100 text-emerald-700',
            expired:   'bg-red-100 text-red-600',
            cancelled: 'bg-slate-100 text-slate-500',
            pending:   'bg-amber-100 text-amber-700',
            paused:    'bg-blue-100 text-blue-600',
        };
        return map[status] || 'bg-slate-100 text-slate-500';
    };

    // Render Members List
    return(
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {__('Members', 'members-forge')}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {__('Manage all active memberships and subscription statuses.', 'members-forge')}
                    </p>
                </div>
                {/* Total count badge */}
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                    {members.length} {__('total', 'members-forge')}
                </span>
            </div>

            {/* Empty State */}
            {members.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="text-5xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {__('No members found', 'members-forge')}
                    </h3>
                    <p className="text-slate-500">
                        {__('Members will appear here once they sign up for a membership.', 'members-forge')}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {members.map((member, index) => (
                        <div 
                            key={member.id} 
                            className={`flex items-center justify-between  px-6 py-4 hover:bg-slate-50 transition-colors duration-150 ${
                                index !== members.length - 1 ? 'border-b border-slate-100' : ''
                            }`}
                        >
                            {/* Left: Avatar + Info */}
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Avatar — initials থেকে generate করা হচ্ছে */}
                                <div className="w-10 h-10 rounded-full bg-brand-600 text-brand-50 flex items-center justify-center text-sm font-bold shrink-0">
                                    {member.display_name?.charAt(0).toUpperCase() || '?'}
                                </div>

                                {/* Name + Email */}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {member.display_name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {member.user_email}
                                    </p>
                                </div>
                            </div>

                            {/* Middle: Level + Status badges */}
                            <div className="hidden md:flex items-center gap-3 mx-6">
                                {/* Level Badge */}
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                    {member.level_name}
                                </span>

                                {/* Status badge */}
                                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md ${getStatusClass(member.status)}`}>
                                    {member.status}
                                </span>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">

                                {/* Status Change Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id )}
                                        className="flex items-center px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
                                        >
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {__('Status', 'members-forge')}
                                    </button>
                                        
                                    {/* Dropdown Menu */}
                                    {openDropdown === member.id && (
                                        <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                            {['active', 'paused', 'cancelled', 'expired'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(member, status)}
                                                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors ${
                                                        member.status === status ? 'text-brand-600 bg-brand-50' : 'text-slate-700'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(member)}
                                    className="flex items-center px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default Members;