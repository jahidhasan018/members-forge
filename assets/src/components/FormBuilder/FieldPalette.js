import { useState } from '@wordpress/element';
import { Spinner, SearchControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const FIELD_ICONS = {
    text: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18M3 8h12M3 12h6" /></svg>,
    email: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    password: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    number: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
    select: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>,
    radio: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg>,
    checkbox: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    textarea: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
    date: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    level_selector: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 5-7-5m14 5l-7 5-7-5" /></svg>,
    terms: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

const CATEGORIES = [
    {
        name: 'Input Fields',
        types: [ 'text', 'email', 'password', 'number', 'textarea', 'date' ],
    },
    {
        name: 'Choice Fields',
        types: [ 'select', 'radio', 'checkbox' ],
    },
    {
        name: 'Special Fields',
        types: [ 'level_selector', 'terms' ],
    },
];

const FieldPalette = ( { fieldTypes, loading, onAddField } ) => {
    const [ search, setSearch ] = useState( '' );
    const [ activeCategory, setActiveCategory ] = useState( 'all' );

    const filtered = fieldTypes.filter( ( f ) =>
        f.label.toLowerCase().includes( search.toLowerCase() )
    );

    const getCategoryForType = ( type ) =>
        CATEGORIES.find( ( c ) => c.types.includes( type ) );

    if ( loading ) {
        return (
            <div className="flex items-center justify-center h-32">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    { __( 'Field Types', 'members-forge' ) }
                </h3>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={ search }
                        onChange={ ( e ) => setSearch( e.target.value ) }
                        placeholder={ __( 'Search fields...', 'members-forge' ) }
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="px-3 pb-2 flex gap-1">
                { [ { name: 'All', key: 'all' }, ...CATEGORIES.map( ( c ) => ( { name: c.name, key: c.name } ) ) ].map( ( cat ) => (
                    <button
                        key={ cat.key }
                        onClick={ () => setActiveCategory( cat.key ) }
                        className={ `text-[10px] font-medium px-2 py-1 rounded-md transition-colors ${
                            activeCategory === cat.key
                                ? 'bg-brand-100 text-brand-700'
                                : 'text-slate-500 hover:bg-slate-100'
                        }` }
                    >
                        { cat.name }
                    </button>
                ) ) }
            </div>

            {/* Field List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                <div className="grid grid-cols-1 gap-1.5">
                    { filtered
                        .filter( ( f ) => activeCategory === 'all' || getCategoryForType( f.type )?.name === activeCategory )
                        .map( ( field ) => (
                            <button
                                key={ field.type }
                                onClick={ () => onAddField( field.type ) }
                                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm hover:shadow-brand-500/10 transition-all duration-150 text-left"
                            >
                                <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                    { FIELD_ICONS[ field.type ] }
                                </span>
                                <div className="min-w-0">
                                    <span className="block text-sm font-medium text-slate-700 group-hover:text-brand-700 transition-colors">
                                        { field.label }
                                    </span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                        { field.type === 'text' && 'Single line text input' }
                                        { field.type === 'email' && 'Email address input' }
                                        { field.type === 'password' && 'Password input field' }
                                        { field.type === 'number' && 'Numeric input field' }
                                        { field.type === 'textarea' && 'Multi-line text area' }
                                        { field.type === 'select' && 'Dropdown selection menu' }
                                        { field.type === 'radio' && 'Single choice radio group' }
                                        { field.type === 'checkbox' && 'Multiple choice checkboxes' }
                                        { field.type === 'date' && 'Date picker input' }
                                        { field.type === 'level_selector' && 'Membership level selection' }
                                        { field.type === 'terms' && 'Terms & conditions checkbox' }
                                    </span>
                                </div>
                                <span className="shrink-0 ml-auto opacity-0 group-hover:opacity-100 text-brand-500 transition-opacity">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                            </button>
                        ) ) }
                </div>

                { filtered.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-xs text-slate-400">{ __( 'No fields found', 'members-forge' ) }</p>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default FieldPalette;
