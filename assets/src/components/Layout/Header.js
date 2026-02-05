import { __ } from '@wordpress/i18n';

const Header = ({ title }) => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your membership ecosystem</p>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                    <span className="sr-only">{__('Notifications', 'members-forge')}</span>
                    🔔
                </button>
            </div>
        </header>
    );
};

export default Header;