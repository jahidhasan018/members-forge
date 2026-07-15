/**
 * BuilderCanvas — Center panel showing the form's field list
 *
 * Displays added fields in order. Supports selecting a field
 * to edit its settings and removing fields from the form.
 */

import { __ } from '@wordpress/i18n';

/**
 * Render a field preview based on its type.
 *
 * @param {Object} field Field configuration object.
 * @return {string} Placeholder input preview HTML as text.
 */
const getFieldPreview = ( field ) => {
    const label = field.label || __( 'Untitled', 'members-forge' );

    switch ( field.type ) {
        case 'textarea':
            return (
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{ label }</label>
                    <div className="w-full h-16 bg-slate-50 rounded-md border border-slate-200" />
                </div>
            );
        case 'select':
            return (
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{ label }</label>
                    <div className="w-full h-8 bg-slate-50 rounded-md border border-slate-200 flex items-center px-2 text-xs text-slate-400">
                        { __( 'Select an option...', 'members-forge' ) }
                    </div>
                </div>
            );
        case 'checkbox':
        case 'terms':
            return (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-300 rounded" />
                    <span className="text-xs font-medium text-slate-600">{ label }</span>
                </div>
            );
        case 'radio':
            return (
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{ label }</label>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                        <span className="text-xs text-slate-400">{ __( 'Option', 'members-forge' ) }</span>
                    </div>
                </div>
            );
        case 'level_selector':
            return (
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{ label }</label>
                    <div className="w-full h-8 bg-slate-50 rounded-md border border-slate-200 flex items-center px-2 text-xs text-slate-400">
                        { __( 'Select a plan...', 'members-forge' ) }
                    </div>
                </div>
            );
        default:
            return (
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{ label }</label>
                    <div className="w-full h-8 bg-slate-50 rounded-md border border-slate-200" />
                </div>
            );
    }
};

/**
 * BuilderCanvas component.
 *
 * @param {Object}   props
 * @param {Array}    props.fields            Current form fields.
 * @param {string|null} props.selectedFieldId Currently selected field ID.
 * @param {Function} props.onSelectField     Callback when a field is clicked.
 * @param {Function} props.onRemoveField     Callback when remove is clicked.
 * @param {Function} props.onAddField        Callback to add a new field.
 */
const BuilderCanvas = ( { fields, selectedFieldId, onSelectField, onRemoveField, onAddField } ) => {
    if ( fields.length === 0 ) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                    { __( 'No fields added yet', 'members-forge' ) }
                </p>
                <p className="text-xs text-slate-400 mb-4">
                    { __( 'Click a field type from the left panel to add it here.', 'members-forge' ) }
                </p>
                { onAddField && (
                    <span className="text-xs text-brand-600 font-medium">
                        { __( 'Tip: Search for "Add New Field" in Field Types', 'members-forge' ) }
                    </span>
                ) }
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                { __( 'Form Fields', 'members-forge' ) }
                <span className="ml-2 font-normal normal-case text-slate-400">
                    ({ fields.length })
                </span>
            </h3>

            <div className="space-y-2">
                { fields.map( ( field, index ) => (
                    <div
                        key={ field.id }
                        onClick={ () => onSelectField( field.id ) }
                        className={ `relative group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                            selectedFieldId === field.id
                                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }` }
                    >
                        {/* Field Order */}
                        <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                            { index + 1 }
                        </span>

                        {/* Field Preview */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                                    { field.type }
                                </span>
                                { field.required && (
                                    <span className="text-[10px] font-medium text-rose-500">
                                        { __( 'Required', 'members-forge' ) }
                                    </span>
                                ) }
                            </div>
                            { getFieldPreview( field ) }
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={ ( e ) => {
                                e.stopPropagation();
                                onRemoveField( field.id );
                            } }
                            className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title={ __( 'Remove field', 'members-forge' ) }
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) ) }
            </div>
        </div>
    );
};

export default BuilderCanvas;
