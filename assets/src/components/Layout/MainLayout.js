import { __ } from '@wordpress/i18n';
import Sidebar from './Sidebar';
import Header from '../Layout/Header';

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