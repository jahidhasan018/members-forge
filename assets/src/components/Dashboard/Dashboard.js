import { useState, useEffect } from '@wordpress/element';
import {
    Spinner,
    Button,
    SelectControl,
    SnackbarList,
    Card as WPCard,
    CardHeader,
    CardBody,
    __experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import Card from '../UI/Card';

/**
 * StatCard - Individual stat display card using our branded Card component
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
                    <Text
                        size={28}
                        weight={700}
                        className="text-slate-900"
                    >
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </Text>
                </div>
            </div>
        </Card>
    );
};

/**
 * ChartPlaceholder - Placeholder for charts
 */
const ChartPlaceholder = ({ title, colorClass = 'brand' }) => {
    const bgClass = colorClass === 'brand'
        ? 'from-brand-50 to-white'
        : 'from-amber-50 to-white';
    const iconClass = colorClass === 'brand'
        ? 'text-brand-400'
        : 'text-amber-300';

    return (
        <div className={`h-48 sm:h-64 flex items-center justify-center bg-linear-to-b ${bgClass} rounded-lg border border-dashed border-slate-200`}>
            <div className="text-center">
                <svg className={`w-10 h-10 ${iconClass} mx-auto mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {colorClass === 'brand' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    )}
                </svg>
                <Text size={14} className="text-slate-400">
                    {__('Chart Coming Soon', 'members-forge')}
                </Text>
            </div>
        </div>
    );
};

/**
 * Dashboard Page Component
 */
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notices, setNotices] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('6months');

    useEffect(() => {
        apiFetch({ path: '/members-forge/v1/stats' })
            .then((response) => {
                // API now returns { success: true, data: { ... } }
                setStats(response.data);
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
            <WPCard>
                <CardBody className="flex flex-col justify-center items-center h-64">
                    <Spinner />
                    <Text className="mt-4 text-slate-500">
                        {__('Loading dashboard...', 'members-forge')}
                    </Text>
                </CardBody>
            </WPCard>
        );
    }

    // Error State
    if (error || !stats) {
        return (
            <WPCard>
                <CardBody className="flex flex-col justify-center items-center h-64">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <Text weight={500} className="text-slate-700">
                        {__('Error loading data', 'members-forge')}
                    </Text>
                    <Text size={14} className="text-slate-500 mt-1">
                        {error}
                    </Text>
                    <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        {__('Try Again', 'members-forge')}
                    </Button>
                </CardBody>
            </WPCard>
        );
    }

    return (
        <>
            {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard
                    label={__('Monthly Recurring Revenue', 'members-forge')}
                    value={stats.total_revenue}
                    prefix="$"
                    change="12.5%"
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
                                <Text size={12} className="text-slate-500">
                                    {__('Revenue', 'members-forge')}
                                </Text>
                            </div>
                            <SelectControl
                                value={chartPeriod}
                                options={[
                                    { label: __('Last 6 Months', 'members-forge'), value: '6months' },
                                    { label: __('Last 12 Months', 'members-forge'), value: '12months' },
                                    { label: __('This Year', 'members-forge'), value: 'year' },
                                ]}
                                onChange={setChartPeriod}
                                __nextHasNoMarginBottom
                                hideLabelFromVision
                                size="compact"
                            />
                        </div>
                        <ChartPlaceholder title="Revenue" colorClass="brand" />
                    </Card>
                </div>

                {/* Member Growth - Takes 1/3 width on desktop */}
                <div>
                    <Card title={__('Member Growth', 'members-forge')}>
                        <ChartPlaceholder title="Growth" colorClass="amber" />
                    </Card>
                </div>
            </div>

            {/* AI Promo Banner */}
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Text
                            as="h3"
                            size={18}
                            weight={600}
                            className="text-white mb-1"
                        >
                            {__('Scale your membership faster with AI', 'members-forge')}
                        </Text>
                        <Text size={14} className="text-slate-400">
                            {__('Generate conversion-focused email sequences and pricing tables instantly.', 'members-forge')}
                        </Text>
                    </div>
                    <Button
                        variant="primary"
                        className="shrink-0"
                    >
                        {__('Try Forge AI', 'members-forge')}
                    </Button>
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
        </>
    );
};

export default Dashboard;