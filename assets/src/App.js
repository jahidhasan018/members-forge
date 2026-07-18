import { useState, useEffect, useCallback } from "@wordpress/element";
import Dashboard from "./components/Dashboard/Dashboard";
import MainLayout from "./components/Layout/MainLayout";
import Levels from "./components/Levels/Levels";
import Members from "./components/Members/Members";
import Modules from "./components/Modules/Modules";
import Settings from "./components/Settings/Settings";
import Forms from "./components/Forms/Forms";
import FormBuilder from "./components/FormBuilder/FormBuilder";

const parseHash = () => {
    const hash = window.location.hash.replace( '#', '' );
    const parts = hash.split( '/' ).filter( Boolean );
    const page = parts[ 0 ] || 'dashboard';
    return { page, formId: parts[ 0 ] === 'form-builder' && parts[ 1 ] ? parseInt( parts[ 1 ], 10 ) || null : null };
};

const pushHash = ( page, formId = null ) => {
    const hash = formId ? `#/${page}/${formId}` : `#/${page}`;
    window.history.pushState( null, '', hash );
};

const App = () => {
    const initial = parseHash();
    const [ activePage, setActivePage ] = useState( initial.page );
    const [ formId, setFormId ] = useState( initial.formId );

    useEffect( () => {
        const onHashChange = () => {
            const { page, formId: id } = parseHash();
            setActivePage( page );
            setFormId( id );
        };

        window.addEventListener( 'hashchange', onHashChange );
        window.addEventListener( 'popstate', onHashChange );

        return () => {
            window.removeEventListener( 'hashchange', onHashChange );
            window.removeEventListener( 'popstate', onHashChange );
        };
    }, [] );

    useEffect( () => {
        const titles = {
            dashboard: 'Dashboard',
            levels: 'Membership Levels',
            members: 'Members',
            modules: 'Modules',
            forms: 'Forms',
            'form-builder': formId ? 'Edit Form' : 'Create New Form',
            'forge-ai': 'Forge AI',
            settings: 'Settings',
        };
        document.title = `MembersForge — ${ titles[ activePage ] || 'Dashboard' }`;
    }, [ activePage, formId ] );

    const navigateToFormBuilder = useCallback( ( id = null ) => {
        pushHash( 'form-builder', id );
        setFormId( id );
        setActivePage( 'form-builder' );
    }, [] );

    const navigateTo = useCallback( ( page ) => {
        if ( page === 'form-builder' ) {
            navigateToFormBuilder( null );
        } else {
            pushHash( page );
            setActivePage( page );
            setFormId( null );
        }
    }, [ navigateToFormBuilder ] );

    const goBackToForms = useCallback( () => {
        pushHash( 'forms' );
        setActivePage( 'forms' );
        setFormId( null );
    }, [] );

    const renderContent = () => {
        switch ( activePage ) {
            case 'dashboard':
                return <Dashboard />;
            case 'levels':
                return <Levels />;
            case 'members':
                return <Members />;
            case 'modules':
                return <Modules />;
            case 'forms':
                return <Forms onNavigateToBuilder={ navigateToFormBuilder } />;
            case 'form-builder':
                return (
                    <FormBuilder
                        formId={ formId }
                        onBack={ goBackToForms }
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
        switch ( activePage ) {
            case 'dashboard': return 'Dashboard';
            case 'levels': return 'Membership Levels';
            case 'members': return 'Members';
            case 'forms': return 'Forms';
            case 'form-builder': return formId ? 'Edit Form' : 'Create New Form';
            default: return 'MembersForge';
        }
    };

    const getPageSubtitle = () => {
        switch ( activePage ) {
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
            title={ getPageTitle() }
            subtitle={ getPageSubtitle() }
            activePage={ activePage }
            onNavigate={ navigateTo }
        >
            { renderContent() }
        </MainLayout>
    );
};

export default App;
