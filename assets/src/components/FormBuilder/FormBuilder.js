/**
 * FormBuilder — Main form builder page with 3-panel layout
 *
 * Composes FieldPalette (left), BuilderCanvas (center),
 * and FieldSettingsPanel (right). Handles form loading/saving.
 */

import { useEffect, useState } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import FieldPalette from './FieldPalette';
import BuilderCanvas from './BuilderCanvas';
import FieldSettingsPanel from './FieldSettingsPanel';
import useFormBuilderState from './useFormBuilderState';

/**
 * FormBuilder component.
 *
 * @param {Object}   props
 * @param {number|null} props.formId   Form ID to edit, or null for new form.
 * @param {Function} props.onBack      Callback to navigate back to forms list.
 */
const FormBuilder = ( { formId, onBack } ) => {
    const [ loading, setLoading ] = useState( !! formId );
    const [ saving, setSaving ] = useState( false );
    const [ fieldTypes, setFieldTypes ] = useState( [] );
    const [ typesLoading, setTypesLoading ] = useState( true );
    const [ error, setError ] = useState( null );
    const [ success, setSuccess ] = useState( false );

    const state = useFormBuilderState( {} );

    // Fetch field types on mount
    useEffect( () => {
        apiFetch( { path: '/members-forge/v1/field-types' } )
            .then( ( response ) => {
                setFieldTypes( response.data || [] );
                setTypesLoading( false );
            } )
            .catch( () => {
                setTypesLoading( false );
            } );
    }, [] );

    // Load existing form data if editing
    useEffect( () => {
        if ( ! formId ) {
            return;
        }

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

                // Re-initialize fields via internal state
                form.fields.forEach( ( field ) => state.addField( field.type ) );

                setLoading( false );
            } )
            .catch( ( err ) => {
                setError( err.message || 'Failed to load form.' );
                setLoading( false );
            } );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ formId ] );

    /**
     * Save the form via API.
     */
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

        if ( formId ) {
            payload.id = formId;
        }

        try {
            const response = await apiFetch( {
                path: formId
                    ? `/members-forge/v1/forms/${ formId }`
                    : '/members-forge/v1/forms',
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

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={ onBack }
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title={ __( 'Back to forms', 'members-forge' ) }
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            { formId
                                ? __( 'Edit Form', 'members-forge' )
                                : __( 'Create New Form', 'members-forge' ) }
                        </h2>
                        <p className="text-sm text-slate-500">
                            { state.formMeta.name || __( 'Untitled Form', 'members-forge' ) }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    { error && (
                        <span className="text-sm text-red-500">{ error }</span>
                    ) }
                    { success && (
                        <span className="text-sm text-emerald-600 font-medium">
                            { __( 'Form saved!', 'members-forge' ) }
                        </span>
                    ) }

                    {/* Form Name Input */}
                    <input
                        type="text"
                        value={ state.formMeta.name }
                        onChange={ ( e ) =>
                            state.setFormMeta( ( prev ) => ( { ...prev, name: e.target.value } ) )
                        }
                        placeholder={ __( 'Form Name', 'members-forge' ) }
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
                    />

                    {/* Save Button */}
                    <button
                        onClick={ handleSave }
                        disabled={ saving || ! state.formMeta.name }
                        className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                    >
                        { saving
                            ? __( 'Saving...', 'members-forge' )
                            : __( 'Save Form', 'members-forge' ) }
                    </button>
                </div>
            </div>

            {/* 3-Panel Builder */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left: Field Palette */}
                <div className="w-48 shrink-0 bg-white rounded-2xl border border-slate-200 overflow-y-auto">
                    <FieldPalette
                        fieldTypes={ fieldTypes }
                        loading={ typesLoading }
                        onAddField={ state.addField }
                    />
                </div>

                {/* Center: Builder Canvas */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-y-auto">
                    <BuilderCanvas
                        fields={ state.fields }
                        selectedFieldId={ state.selectedFieldId }
                        onSelectField={ state.setSelectedFieldId }
                        onRemoveField={ state.removeField }
                    />
                </div>

                {/* Right: Field Settings */}
                <div className="w-64 shrink-0 bg-white rounded-2xl border border-slate-200 overflow-y-auto">
                    <FieldSettingsPanel
                        field={ state.selectedField }
                        onUpdateField={ state.updateField }
                    />
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
