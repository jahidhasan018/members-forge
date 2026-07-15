import { useState } from "@wordpress/element";
import Dashboard from "./components/Dashboard/Dashboard";
import MainLayout from "./components/Layout/MainLayout";
import Levels from "./components/Levels/Levels";
import Members from "./components/Members/Members";
import Modules from "./components/Modules/Modules";
import Settings from "./components/Settings/Settings";
import Forms from "./components/Forms/Forms";
import FormBuilder from "./components/FormBuilder/FormBuilder";

const App = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [formId, setFormId] = useState(null);

    const navigateToFormBuilder = (id = null) => {
        setFormId(id);
        setActivePage('form-builder');
    };

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard />;
            case 'levels':
                return <Levels />;
            case 'members':
                return <Members />;
            case 'modules':
                return <Modules />;
            case 'forms':
                return <Forms onNavigateToBuilder={navigateToFormBuilder} />;
            case 'form-builder':
                return (
                    <FormBuilder
                        formId={formId}
                        onBack={() => setActivePage('forms')}
                    />
                );
            case 'forge-ai':
                return <div className="text-slate-500 text-center py-20">Forge Ai Coming Soon...</div>;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    const getPageTitle = () => {
        switch (activePage) {
            case 'dashboard': return 'Dashboard';
            case 'levels': return 'Membership Levels';
            case 'members': return 'Members';
            case 'forms': return 'Forms';
            case 'form-builder': return formId ? 'Edit Form' : 'Create New Form';
            default: return 'MembersForge';
        }
    };

    const getPageSubtitle = () => {
        switch (activePage) {
            case 'dashboard': return 'Manage your membership ecosystem';
            case 'levels': return 'Create and manage subscription tiers';
            case 'members': return 'View and manage your members';
            case 'forms': return 'Create and manage your membership forms';
            case 'form-builder': return 'Build your form with drag-and-drop fields';
            default: return '';
        }
    };

    return (
        <MainLayout
            title={getPageTitle()}
            subtitle={getPageSubtitle()}
            activePage={activePage}
            onNavigate={(page) => {
                if (page === 'form-builder') {
                    navigateToFormBuilder(null);
                } else {
                    setActivePage(page);
                }
            }}
        >
            {renderContent()}
        </MainLayout>
    );
};

export default App;