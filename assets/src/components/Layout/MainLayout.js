import { __ } from '@wordpress/i18n';
import Sidebar from './Sidebar';
import Header from './Header'; // পথ ঠিক আছে কিনা চেক করে নিবেন

const MainLayout = ({ children, title, subtitle, activePage, onNavigate }) => {
    return (
        <div className="mf-app-container flex min-h-screen bg-slate-100">
            {/* Sidebar কে প্রপস পাঠানো হচ্ছে */}
            <Sidebar activePage={activePage} onNavigate={onNavigate} />

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