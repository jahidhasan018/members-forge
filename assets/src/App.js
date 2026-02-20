import { useState } from "@wordpress/element";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import Levels from "./components/Levels/Levels";

const App = () => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard />;
            case 'levels':
                return <Levels />;
            case 'members':
                return <div className="text-slate-500 text-center py-20">Coming Soon...</div>;
            case 'modules':
                return <div className="text-slate-500 text-center py-20">Modules Coming Soon...</div>;
            case 'form-builder':
                return <div className="text-slate-500 text-center py-20">Form Builder Coming Soon...</div>;
            case 'forge-ai':
                return <div className="text-slate-500 text-center py-20">Forge Ai Coming Soon...</div>;
            case 'settings':
                return <div className="text-slate-500 text-center py-20">Settings Coming Soon...</div>;
            default:
                return <Dashboard />;
        }
    };

    const getPageTitle = () => {
        switch (activePage) {
            case 'dashboard': return 'Dashboard';
            case 'levels': return 'Membership Levels';
            case 'members': return 'Members';
            default: return 'MembersForge';
        }
    };

    const getPageSubtitle = () => {
        switch (activePage) {
            case 'dashboard': return 'Manage your membership ecosystem';
            case 'levels': return 'Create and manage subscription tiers';
            case 'members': return 'View and manage your members';
            default: return '';
        }
    };

    return (
        <MainLayout
            title={getPageTitle()}
            subtitle={getPageSubtitle()}
            activePage={activePage}
            onNavigate={setActivePage}
        >
            {renderContent()}
        </MainLayout>
    );
};

export default App;