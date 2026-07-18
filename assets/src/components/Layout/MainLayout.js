import { __ } from '@wordpress/i18n';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, title, subtitle, activePage, onNavigate }) => {
    return (
        <div className="mf-app-container flex min-h-screen bg-slate-100">
            {/* Pass props to Sidebar */}
            <Sidebar activePage={activePage} onNavigate={onNavigate} defaultCollapsed={activePage === 'form-builder'} />

            {/* Main Content Area */}
            <div className="mf-main-content flex flex-col flex-1 min-w-0">
                {/* Header */}
                <Header title={title} subtitle={subtitle} />

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;