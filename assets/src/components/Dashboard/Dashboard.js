import { useState, useEffect } from '@wordpress/element';
import { Spinner, SnackbarList } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import MainLayout from '../Layout/MainLayout';
import Card from '../UI/Card';

/**
 * StatCard - Individual stat display card
 */
const StatCard = ({ label, value, change, changeType = 'positive', prefix = '', suffix = '' }) => {
    const isPositive = changeType === 'positive';

    return (
        <Card className="relative">
            <div className="flex flex-col">
                <span className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {label}

                    {change && (
                        <span className={`
                            text-xs font-medium px-2 py-0.5 rounded-full
                            ${isPositive
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-rose-700 bg-rose-50'
                            }
                        `}>
                            {isPositive ? '+' : ''}{change}
                        </span>
                    )}
                </span>
                <div className="gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </span>
                </div>
            </div>
        </Card>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        apiFetch({ path: '/members-forge/v1/stats' })
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message || 'Failed to load stats');
                setLoading(false);
            });
    }, []);

    const removeNotice = (id) => {
        setNotices(notices.filter((notice) => notice.id !== id));
    };

    // Loading State
    if (loading) {
        return (
            <MainLayout
                title={__('Dashboard', 'members-forge')}
                subtitle={__('Manage your membership ecosystem', 'members-forge')}
            >
                <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl border border-slate-200">
                    <Spinner />
                    <p className="mt-4 text-slate-500 text-sm">{__('Loading dashboard...', 'members-forge')}</p>
                </div>
            </MainLayout>
        );
    }

    // Error State
    if (error || !stats) {
        return (
            <MainLayout
                title={__('Dashboard', 'members-forge')}
                subtitle={__('Manage your membership ecosystem', 'members-forge')}
            >
                <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-700 font-medium">{__('Error loading data', 'members-forge')}</p>
                    <p className="text-slate-500 text-sm mt-1">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-900 transition-colors"
                    >
                        {__('Try Again', 'members-forge')}
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout
            title={__('Dashboard', 'members-forge')}
            subtitle={__('Manage your membership ecosystem', 'members-forge')}
        >
            {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard
                    label={__('Monthly Recurring Revenue', 'members-forge')}
                    value={stats.total_revenue}
                    prefix="$"
                    change="+12.5%"
                    changeType="positive"
                />
                <StatCard
                    label={__('Active Members', 'members-forge')}
                    value={stats.active_members}
                    change="+3.2%"
                    changeType="positive"
                />
                <StatCard
                    label={__('Churn Rate', 'members-forge')}
                    value={stats.churn_rate}
                    suffix="%"
                    change="-0.5%"
                    changeType="negative"
                />
                <StatCard
                    label={__('Avg. LTV', 'members-forge')}
                    value={stats.avg_ltv}
                    prefix="$"
                    change="+8.1%"
                    changeType="positive"
                />
            </div>

            {/* Charts Section - Responsive: stack on mobile, side-by-side on desktop */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {/* Revenue Over Time - Takes 2/3 width on desktop */}
                <div className="xl:col-span-2">
                    <Card title={__('Revenue Over Time', 'members-forge')}>
                        <div className="flex items-end justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-brand-600"></span>
                                <span className="text-xs text-slate-500">{__('Revenue', 'members-forge')}</span>
                            </div>
                            <select className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-600">
                                <option>{__('Last 6 Months', 'members-forge')}</option>
                                <option>{__('Last 12 Months', 'members-forge')}</option>
                                <option>{__('This Year', 'members-forge')}</option>
                            </select>
                        </div>
                        <div className="h-48 sm:h-64 flex items-center justify-center bg-linear-to-b from-brand-50 to-white rounded-lg border border-dashed border-slate-200">
                            <div className="text-center">
                                <svg className="w-10 h-10 text-brand-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                <span className="text-sm text-slate-400">{__('Chart Coming Soon', 'members-forge')}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Member Growth - Takes 1/3 width on desktop */}
                <div>
                    <Card title={__('Member Growth', 'members-forge')}>
                        <div className="h-48 sm:h-64 flex items-center justify-center bg-linear-to-b from-amber-50 to-white rounded-lg border border-dashed border-slate-200">
                            <div className="text-center">
                                <svg className="w-10 h-10 text-amber-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-sm text-slate-400">{__('Chart Coming Soon', 'members-forge')}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* AI Promo Banner */}
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">
                            {__('Scale your membership faster with AI', 'members-forge')}
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {__('Generate conversion-focused email sequences and pricing tables instantly.', 'members-forge')}
                        </p>
                    </div>
                    <button className="shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-400 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-brand-900/30">
                        {__('Try Forge AI', 'members-forge')}
                    </button>
                </div>
            </div>

            {/* Notification Toaster */}
            <div className="fixed bottom-5 right-5 z-9999 w-80">
                <SnackbarList
                    notices={notices}
                    className="components-snackbar-list"
                    onRemove={removeNotice}
                />
            </div>
        </MainLayout>
    );
};

export default Dashboard;