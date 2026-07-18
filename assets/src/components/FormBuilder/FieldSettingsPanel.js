import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Section = ( { title, icon, defaultOpen = true, children } ) => {
    const [ open, setOpen ] = useState( defaultOpen );

    return (
        <div className="border-b border-slate-100 last:border-b-0">
            <button
                onClick={ () => setOpen( ! open ) }
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
                <span className="flex items-center gap-2">
                    { icon && <span className="text-slate-400">{ icon }</span> }
                    { title }
                </span>
                <svg
                    className={ `w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${ open ? 'rotate-180' : '' }` }
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            { open && <div className="px-4 pb-4 space-y-3">{ children }</div> }
        </div>
    );
};

const FieldSettingsPanel = ( { field, onUpdateField } ) => {
    const [ optionInput, setOptionInput ] = useState( '' );

    if ( ! field ) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">
                    { __( 'No field selected', 'members-forge' ) }
                </p>
                <p className="text-xs text-slate-400">
                    { __( 'Click on a field in the canvas to edit its settings.', 'members-forge' ) }
                </p>
            </div>
        );
    }

    const handleChange = ( key, value ) => onUpdateField( field.id, { [ key ]: value } );
    const needsOptions = [ 'select', 'radio', 'checkbox' ].includes( field.type );

    const addOption = () => {
        const trimmed = optionInput.trim();
        if ( ! trimmed ) return;
        const current = field.options || [];
        if ( current.includes( trimmed ) ) return;
        handleChange( 'options', [ ...current, trimmed ] );
        setOptionInput( '' );
    };

    const removeOption = ( index ) => {
        handleChange( 'options', ( field.options || [] ).filter( ( _, i ) => i !== index ) );
    };

    const handleOptionKeyDown = ( e ) => {
        if ( e.key === 'Enter' ) { e.preventDefault(); addOption(); }
    };

    return (
        <div className="divide-y divide-slate-100">
            {/* Field Info Header */}
            <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase text-brand-600">{ field.type.replace( '_', ' ' ).slice( 0, 3 ) }</span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{ field.label || __( 'Untitled', 'members-forge' ) }</p>
                    <p className="text-[10px] text-slate-400 capitalize">{ field.type.replace( '_', ' ' ) } field</p>
                </div>
            </div>

            {/* Basic Settings */}
            <Section title={ __( 'Basic', 'members-forge' ) } icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            }>
                {/* Label */}
                <div>
                    <label htmlFor={ `field-label-${ field.id }` } className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Label', 'members-forge' ) }</label>
                    <input id={ `field-label-${ field.id }` } type="text" value={ field.label || '' } onChange={ ( e ) => handleChange( 'label', e.target.value ) } placeholder={ __( 'Enter field label', 'members-forge' ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                </div>

                {/* Name / Key (auto-generated, read-only) */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Name / Key', 'members-forge' ) }</label>
                    <div className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-500 border border-slate-200 font-mono truncate">{ field.name || '' }</div>
                    <p className="text-[10px] text-slate-400 mt-1">{ __( 'Auto-generated and unique. Used as the field name attribute in HTML.', 'members-forge' ) }</p>
                </div>
            </Section>

            {/* Validation Settings */}
            <Section title={ __( 'Validation', 'members-forge' ) } icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            }>
                {/* Required Toggle */}
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-500">{ __( 'Required field', 'members-forge' ) }</label>
                    <button
                        onClick={ () => handleChange( 'required', ! field.required ) }
                        className={ `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ field.required ? 'bg-brand-600' : 'bg-slate-300' }` }
                        role="switch" aria-checked={ !! field.required }
                    >
                        <span className={ `inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ field.required ? 'translate-x-[18px]' : 'translate-x-[2px]' }` } />
                    </button>
                </div>

                {/* Placeholder (not for checkbox/terms/radio/level_selector) */}
                { ! [ 'checkbox', 'terms', 'radio', 'level_selector' ].includes( field.type ) && (
                    <div>
                        <label htmlFor={ `field-placeholder-${ field.id }` } className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Placeholder', 'members-forge' ) }</label>
                        <input id={ `field-placeholder-${ field.id }` } type="text" value={ field.placeholder || '' } onChange={ ( e ) => handleChange( 'placeholder', e.target.value ) } placeholder={ __( 'Enter placeholder text', 'members-forge' ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                    </div>
                ) }
            </Section>

            {/* Options (for select, radio, checkbox) */}
            { needsOptions && (
                <Section title={ __( 'Options', 'members-forge' ) } icon={
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                }>
                    {/* Chip list */}
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                        { ( field.options || [] ).length === 0 && (
                            <span className="text-xs text-slate-400 italic">{ __( 'No options added', 'members-forge' ) }</span>
                        ) }
                        { ( field.options || [] ).map( ( option, index ) => (
                            <span key={ index } className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-200">
                                { option }
                                <button onClick={ () => removeOption( index ) } className="text-brand-400 hover:text-red-500 transition-colors" title={ __( 'Remove', 'members-forge' ) }>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        ) ) }
                    </div>

                    {/* Add option input */}
                    <div className="flex gap-1.5">
                        <input type="text" value={ optionInput } onChange={ ( e ) => setOptionInput( e.target.value ) } onKeyDown={ handleOptionKeyDown } placeholder={ __( 'Type and press Enter', 'members-forge' ) } className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                        <button onClick={ addOption } disabled={ ! optionInput.trim() } className="px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors shrink-0" title={ __( 'Add', 'members-forge' ) }>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                </Section>
            ) }

            {/* Date-specific settings */}
            { field.type === 'date' && (
                <Section title={ __( 'Date Range', 'members-forge' ) } icon={
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                }>
                    <div>
                        <label htmlFor={ `field-min-date-${ field.id }` } className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Min Date', 'members-forge' ) }</label>
                        <input id={ `field-min-date-${ field.id }` } type="date" value={ field.min_date || '' } onChange={ ( e ) => handleChange( 'min_date', e.target.value ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all" />
                        <p className="text-[10px] text-slate-400 mt-1">{ __( 'Earliest selectable date.', 'members-forge' ) }</p>
                    </div>
                    <div>
                        <label htmlFor={ `field-max-date-${ field.id }` } className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Max Date', 'members-forge' ) }</label>
                        <input id={ `field-max-date-${ field.id }` } type="date" value={ field.max_date || '' } onChange={ ( e ) => handleChange( 'max_date', e.target.value ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all" />
                        <p className="text-[10px] text-slate-400 mt-1">{ __( 'Latest selectable date.', 'members-forge' ) }</p>
                    </div>
                </Section>
            ) }
        </div>
    );
};

export default FieldSettingsPanel;
