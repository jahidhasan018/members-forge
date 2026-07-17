import { useEffect, useState } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import FieldPalette from './FieldPalette';
import BuilderCanvas from './BuilderCanvas';
import FieldSettingsPanel from './FieldSettingsPanel';
import FormSettingsPanel from './FormSettingsPanel';
import useFormBuilderState from './useFormBuilderState';

const FormBuilder = ( { formId, onBack } ) => {
    const [ loading, setLoading ] = useState( !! formId );
    const [ saving, setSaving ] = useState( false );
    const [ fieldTypes, setFieldTypes ] = useState( [] );
    const [ typesLoading, setTypesLoading ] = useState( true );
    const [ error, setError ] = useState( null );
    const [ success, setSuccess ] = useState( false );
    const [ rightTab, setRightTab ] = useState( 'fields' );
    const [ showFormSettings, setShowFormSettings ] = useState( false );

    const state = useFormBuilderState( {} );

    useEffect( () => {
        apiFetch( { path: '/members-forge/v1/field-types' } )
            .then( ( response ) => {
                setFieldTypes( response.data || [] );
                setTypesLoading( false );
            } )
            .catch( () => setTypesLoading( false ) );
    }, [] );

    useEffect( () => {
        if ( ! formId ) return;

        setLoading( true );

        apiFetch( { path: `/members-forge/v1/forms/${ formId }` } )
            .then( ( response ) => {
                const form = response.data;

                state.setFormMeta( {
                    name: form.name || '',
                    type: form.type || 'registration',
                    status: form.status || 'draft',
                    settings: form.settings || {
                        submit_action: 'registration',
                        redirect_url: '',
                        auto_login: true,
                        email_notification: true,
                        actions: [],
                    },
                } );

                state.loadFields( form.fields );
                setLoading( false );
            } )
            .catch( ( err ) => {
                setError( err.message || 'Failed to load form.' );
                setLoading( false );
            } );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ formId ] );

    useEffect( () => {
        if ( state.selectedFieldId ) {
            setRightTab( 'options' );
        }
    }, [ state.selectedFieldId ] );

    const handleSave = async () => {
        setSaving( true );
        setError( null );
        setSuccess( false );

        const payload = {
            name: state.formMeta.name,
            type: state.formMeta.type,
            status: state.formMeta.status,
            fields: state.fields,
            settings: state.formMeta.settings,
        };

        if ( formId ) payload.id = formId;

        try {
            await apiFetch( {
                path: formId ? `/members-forge/v1/forms/${ formId }` : '/members-forge/v1/forms',
                method: formId ? 'PUT' : 'POST',
                data: payload,
            } );

            setSuccess( true );
            setSaving( false );
            setTimeout( () => setSuccess( false ), 3000 );
        } catch ( err ) {
            setError( err.message || 'Failed to save form.' );
            setSaving( false );
        }
    };

    if ( loading ) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner />
                <span className="ml-3 text-slate-500">{ __( 'Loading form...', 'members-forge' ) }</span>
            </div>
        );
    }

    const statusColors = {
        active: 'bg-emerald-100 text-emerald-700',
        draft: 'bg-amber-100 text-amber-700',
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3.5 mb-4 shrink-0 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={ onBack }
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            title={ __( 'Back to forms', 'members-forge' ) }
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    { formId ? __( 'Edit Form', 'members-forge' ) : __( 'Create New Form', 'members-forge' ) }
                                </h2>
                            </div>
                            <span className={ `inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${ statusColors[ state.formMeta.status ] || 'bg-slate-100 text-slate-700' }` }>
                                { state.formMeta.status === 'active' ? __( 'Published', 'members-forge' ) : __( 'Draft', 'members-forge' ) }
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        { error && (
                            <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                { error }
                            </span>
                        ) }
                        { success && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                { __( 'Form saved!', 'members-forge' ) }
                            </span>
                        ) }

                        {/* Toggle Form Settings */}
                        <button
                            onClick={ () => setShowFormSettings( ! showFormSettings ) }
                            className={ `p-2 rounded-xl transition-all ${
                                showFormSettings
                                    ? 'bg-brand-100 text-brand-600'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }` }
                            title={ __( 'Form Settings', 'members-forge' ) }
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Form Name Input */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <input
                                type="text"
                                value={ state.formMeta.name }
                                onChange={ ( e ) => state.setFormMeta( ( prev ) => ( { ...prev, name: e.target.value } ) ) }
                                placeholder={ __( 'Form Name', 'members-forge' ) }
                                className="pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all w-56 placeholder-slate-300"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={ handleSave }
                            disabled={ saving || ! state.formMeta.name }
                            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-brand-600 to-brand-700 text-white text-sm font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 transition-all shadow-sm shadow-brand-500/20"
                        >
                            { saving ? (
                                <>
                                    <Spinner />
                                    { __( 'Saving...', 'members-forge' ) }
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    { __( 'Save Form', 'members-forge' ) }
                                </>
                            ) }
                        </button>
                    </div>
                </div>

                {/* Collapsible Form Settings */}
                { showFormSettings && (
                    <div className="border-t border-slate-100 mt-3 pt-3">
                        <div className="max-w-3xl">
                            <FormSettingsPanel formMeta={ state.formMeta } setFormMeta={ state.setFormMeta } />
                        </div>
                    </div>
                ) }
            </div>

            {/* 2-Panel Builder */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Center: Builder Canvas */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-y-auto shadow-sm">
                    <BuilderCanvas
                        fields={ state.fields }
                        selectedFieldId={ state.selectedFieldId }
                        onSelectField={ state.setSelectedFieldId }
                        onRemoveField={ state.removeField }
                        onReorderFields={ state.reorderFields }
                    />
                </div>

                {/* Right: Fields / Options Tabs */}
                <div className="w-80 shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                    {/* Tab Switcher */}
                    <div className="flex border-b border-slate-100 shrink-0">
                        <button
                            onClick={ () => setRightTab( 'fields' ) }
                            className={ `flex-1 py-3 text-xs font-semibold text-center transition-all ${
                                rightTab === 'fields'
                                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }` }
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                { __( 'Fields', 'members-forge' ) }
                            </span>
                        </button>
                        <button
                            onClick={ () => setRightTab( 'options' ) }
                            className={ `flex-1 py-3 text-xs font-semibold text-center transition-all ${
                                rightTab === 'options'
                                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }` }
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                { __( 'Options', 'members-forge' ) }
                            </span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        { rightTab === 'fields' ? (
                            <FieldPalette
                                fieldTypes={ fieldTypes }
                                loading={ typesLoading }
                                onAddField={ state.addField }
                            />
                        ) : (
                            <FieldSettingsPanel field={ state.selectedField } onUpdateField={ state.updateField } />
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
