import { useState, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";

const MenuItem = ({ item, activePage, onNavigate, collapsed, getIcon }) => (
    <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        title={collapsed ? item.name : undefined}
        className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-brand-600 ${activePage === item.id
            ? 'bg-brand-600 text-white shadow-lg'
            : 'text-slate-400 hover:bg-brand-600 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`}
    >
        <span className="shrink-0 text-current">
            {getIcon(item.icon)}
        </span>
        {!collapsed && (
            <span className="ml-3 font-medium text-sm text-current">
                {__(item.name, 'members-forge')}
            </span>
        )}
    </button>
);

const Sidebar = ({ activePage, onNavigate, defaultCollapsed }) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    useEffect( () => {
        if ( defaultCollapsed ) {
            setCollapsed( true );
        }
    }, [ defaultCollapsed ] );

    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
        { id: 'levels', name: 'Levels', icon: 'layers' },
        { id: 'members', name: 'Members', icon: 'users' },
        { id: 'modules', name: 'Modules', icon: 'box' },
        { id: 'forms', name: 'Form Builder', icon: 'form' },
        { id: 'forge-ai', name: 'Forge AI', icon: 'ai' },
        { id: 'settings', name: 'Settings', icon: 'settings' },
    ];

    const getIcon = (iconName) => {
        const icons = {
            dashboard: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            ),
            layers: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            users: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            box: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            form: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            ai: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            style: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            settings: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            docs: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        };
        return icons[iconName] || <span className="w-5 h-5 flex items-center justify-center">•</span>;
    };

    const toggleCollapsed = () => setCollapsed(prev => !prev);

    return (
        <aside className={`mf-sidebar bg-slate-900 flex flex-col shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
            {/* Logo Area */}
            <div className={`h-14 flex items-center border-b border-slate-800 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                {!collapsed && (
                    <>
                        <span className="ml-3 text-lg font-bold text-white block">MembersForge</span>
                        <span className="ml-1 text-sm text-slate-400"> v1.0</span>
                    </>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleCollapsed}
                title={collapsed ? __('Expand sidebar', 'members-forge') : __('Collapse sidebar', 'members-forge')}
                className={`flex items-center py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${collapsed ? 'justify-center' : 'px-4'}`}
            >
                <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                {!collapsed && (
                    <span className="ml-3 text-xs">{__('Collapse', 'members-forge')}</span>
                )}
            </button>

            {/* Menu Items */}
            <nav className="flex-1 py-2 overflow-y-auto">
                <div className={collapsed ? 'flex flex-col items-center gap-1' : 'px-3 space-y-1'}>
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            activePage={activePage}
                            onNavigate={onNavigate}
                            collapsed={collapsed}
                            getIcon={getIcon}
                        />
                    ))}
                </div>
            </nav>

            {/* Support Section */}
            <div className={`border-t border-slate-800 ${collapsed ? 'p-3' : 'p-3'}`}>
                {!collapsed && (
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-3">
                        {__('Support', 'members-forge')}
                    </p>
                )}
                <button
                    title={collapsed ? __('Documentation', 'members-forge') : undefined}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <span className="shrink-0">{getIcon('docs')}</span>
                    {!collapsed && (
                        <span className="ml-3 text-sm">{__('Documentation', 'members-forge')}</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;