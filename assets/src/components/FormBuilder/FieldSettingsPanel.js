/**
 * FieldSettingsPanel — Right sidebar panel for field configuration
 *
 * Displays editable properties for the currently selected field.
 * Supports label, name/key, required toggle, placeholder, and options.
 */

import { __ } from '@wordpress/i18n';

/**
 * FieldSettingsPanel component.
 *
 * @param {Object}   props
 * @param {Object|null} props.field     The currently selected field.
 * @param {Function} props.onUpdateField Callback to update field properties.
 */
const FieldSettingsPanel = ( { field, onUpdateField } ) => {
    if ( ! field ) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-medium text-slate-500">
                    { __( 'Select a field to edit', 'members-forge' ) }
                </p>
                <p className="text-xs text-slate-400 mt-1">
                    { __( 'Click on any field in the canvas to configure its settings.', 'members-forge' ) }
                </p>
            </div>
        );
    }

    const handleChange = ( key, value ) => {
        onUpdateField( field.id, { [ key ]: value } );
    };

    const needsOptions = [ 'select', 'radio' ].includes( field.type );

    return (
        <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                { __( 'Field Settings', 'members-forge' ) }
            </h3>

            <div className="space-y-4">
                {/* Field Type (Read-only) */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        { __( 'Type', 'members-forge' ) }
                    </label>
                    <div className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-500 border border-slate-200">
                        { field.type }
                    </div>
                </div>

                {/* Label */}
                <div>
                    <label
                        htmlFor={ `field-label-${ field.id }` }
                        className="block text-xs font-medium text-slate-600 mb-1"
                    >
                        { __( 'Label', 'members-forge' ) }
                    </label>
                    <input
                        id={ `field-label-${ field.id }` }
                        type="text"
                        value={ field.label || '' }
                        onChange={ ( e ) => handleChange( 'label', e.target.value ) }
                        placeholder={ __( 'Enter field label', 'members-forge' ) }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>

                {/* Name / Key */}
                <div>
                    <label
                        htmlFor={ `field-name-${ field.id }` }
                        className="block text-xs font-medium text-slate-600 mb-1"
                    >
                        { __( 'Name / Key', 'members-forge' ) }
                    </label>
                    <input
                        id={ `field-name-${ field.id }` }
                        type="text"
                        value={ field.name || '' }
                        onChange={ ( e ) => handleChange( 'name', e.target.value ) }
                        placeholder={ __( 'e.g., first_name', 'members-forge' ) }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                        { __( 'Used as the form field name attribute.', 'members-forge' ) }
                    </p>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">
                        { __( 'Required', 'members-forge' ) }
                    </label>
                    <button
                        onClick={ () => handleChange( 'required', ! field.required ) }
                        className={ `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            field.required ? 'bg-brand-600' : 'bg-slate-300'
                        }` }
                        role="switch"
                        aria-checked={ !! field.required }
                    >
                        <span
                            className={ `inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                field.required ? 'translate-x-[18px]' : 'translate-x-[2px]'
                            }` }
                        />
                    </button>
                </div>

                {/* Placeholder (not for checkbox/terms/radio) */}
                { ! [ 'checkbox', 'terms', 'radio' ].includes( field.type ) && (
                    <div>
                        <label
                            htmlFor={ `field-placeholder-${ field.id }` }
                            className="block text-xs font-medium text-slate-600 mb-1"
                        >
                            { __( 'Placeholder', 'members-forge' ) }
                        </label>
                        <input
                            id={ `field-placeholder-${ field.id }` }
                            type="text"
                            value={ field.placeholder || '' }
                            onChange={ ( e ) => handleChange( 'placeholder', e.target.value ) }
                            placeholder={ __( 'Enter placeholder text', 'members-forge' ) }
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                ) }

                {/* Options (for select and radio) */}
                { needsOptions && (
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            { __( 'Options', 'members-forge' ) }
                        </label>
                        <textarea
                            value={ ( field.options || [] ).join( '\n' ) }
                            onChange={ ( e ) =>
                                handleChange(
                                    'options',
                                    e.target.value
                                        .split( '\n' )
                                        .map( ( s ) => s.trim() )
                                        .filter( Boolean )
                                )
                            }
                            placeholder={ __( 'One option per line', 'members-forge' ) }
                            rows={ 4 }
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            { __( 'Enter each option on a new line.', 'members-forge' ) }
                        </p>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default FieldSettingsPanel;
