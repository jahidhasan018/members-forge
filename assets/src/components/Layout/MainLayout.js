import { __ } from '@wordpress/i18n';
import Sidebar from './Sidebar';

/**
 * Header Component - Top bar with title and actions
 */
const Header = ({ title, subtitle }) => {
    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div>
                <h1 className="text-lg font-semibold text-slate-800 m-0">{title}</h1>
                {subtitle && (
                    <p className="text-xs text-slate-500 m-0">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Dropdown for time period */}
                <select className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-600 hidden sm:block">
                    <option>{__('Last 6 Months', 'members-forge')}</option>
                    <option>{__('Last 12 Months', 'members-forge')}</option>
                    <option>{__('This Year', 'members-forge')}</option>
                </select>

                {/* Notification Bell */}
                <button
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-all"
                    title={__('Notifications', 'members-forge')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                    A
                </div>
            </div>
        </header>
    );
};

/**
 * MainLayout - Full page layout with sidebar
 * Works within WordPress admin area
 */
const MainLayout = ({ children, title, subtitle }) => {
    return (
        <div className="mf-app-container">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="mf-main-content flex flex-col min-h-full">
                {/* Header */}
                <Header title={title} subtitle={subtitle} />

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 bg-slate-50 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;