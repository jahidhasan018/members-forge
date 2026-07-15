/**
 * FieldPalette — Left sidebar panel showing available field types
 *
 * Lists all registered field types fetched from the API.
 * Clicking a field type adds it to the builder canvas.
 */

import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const FIELD_ICONS = {
    text: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18M3 8h12M3 12h6" />
        </svg>
    ),
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    password: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    number: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
    ),
    select: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
    ),
    radio: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
            <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
        </svg>
    ),
    checkbox: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    textarea: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
    ),
    date: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    level_selector: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 5-7-5m14 5l-7 5-7-5" />
        </svg>
    ),
    terms: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
};

/**
 * FieldPalette component.
 *
 * @param {Object}   props
 * @param {Array}    props.fieldTypes     List of available field types from API.
 * @param {boolean}  props.loading        Whether field types are being fetched.
 * @param {Function} props.onAddField     Callback when a field type is clicked.
 */
const FieldPalette = ( { fieldTypes, loading, onAddField } ) => {
    if ( loading ) {
        return (
            <div className="flex items-center justify-center h-32">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                { __( 'Field Types', 'members-forge' ) }
            </h3>

            <div className="space-y-1">
                { fieldTypes.map( ( field ) => (
                    <button
                        key={ field.type }
                        onClick={ () => onAddField( field.type ) }
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150 text-left"
                    >
                        <span className="shrink-0 text-slate-400">
                            { FIELD_ICONS[ field.type ] || (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) }
                        </span>
                        <span className="font-medium">{ field.label }</span>
                    </button>
                ) ) }
            </div>
        </div>
    );
};

export default FieldPalette;
