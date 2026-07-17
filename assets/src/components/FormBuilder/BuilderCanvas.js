import { useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const TYPE_ICONS = {
    text: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h12M3 12h6" /></svg>,
    email: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    password: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    number: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
    textarea: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
    select: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>,
    radio: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>,
    checkbox: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    date: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    level_selector: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 5-7-5m14 5l-7 5-7-5" /></svg>,
    terms: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

const DragHandle = () => (
    <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM8 22a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
    </svg>
);

const InputPreview = ( { type } ) => {
    switch ( type ) {
        case 'textarea':
            return <div className="h-6 bg-white rounded border border-slate-200 px-2 flex items-center"><span className="text-[10px] text-slate-300">---</span></div>;
        case 'select':
            return <div className="h-6 bg-white rounded border border-slate-200 px-2 flex items-center justify-between"><span className="text-[10px] text-slate-300">Select...</span><svg className="w-2.5 h-2.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>;
        case 'checkbox':
            return <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 border-2 border-slate-300 rounded" /><span className="text-[10px] text-slate-300">Option</span></div>;
        case 'radio':
            return <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 border-2 border-slate-300 rounded-full" /><span className="text-[10px] text-slate-300">Option</span></div>;
        case 'terms':
            return <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 border-2 border-slate-300 rounded" /><span className="text-[10px] text-slate-300">I agree...</span></div>;
        case 'level_selector':
            return <div className="h-6 bg-white rounded border border-slate-200 px-2 flex items-center"><span className="text-[10px] text-slate-300">Select level...</span></div>;
        default:
            return <div className="h-6 bg-white rounded border border-slate-200" />;
    }
};

const BuilderCanvas = ( { fields, selectedFieldId, onSelectField, onRemoveField, onReorderFields } ) => {
    const dragItem = useRef( null );
    const dragOverIndexRef = useRef( null );
    const [ dragOverIndex, setDragOverIndex ] = useState( null );

    const updateDragOver = ( index ) => {
        if ( dragOverIndexRef.current !== index ) {
            dragOverIndexRef.current = index;
            setDragOverIndex( index );
        }
    };

    const clearDragOver = () => {
        dragOverIndexRef.current = null;
        setDragOverIndex( null );
    };

    const handleDragStart = ( index ) => {
        dragItem.current = index;
    };

    const handleDragOver = ( e, index ) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        updateDragOver( index );
    };

    const handleDragLeave = () => {
        clearDragOver();
    };

    const handleDrop = ( targetIndex ) => {
        clearDragOver();
        if ( dragItem.current === null || dragItem.current === targetIndex ) return;
        onReorderFields( dragItem.current, targetIndex );
        dragItem.current = null;
    };

    const handleDragEnd = () => {
        clearDragOver();
        dragItem.current = null;
    };

    if ( fields.length === 0 ) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-brand-200/50">
                    <svg className="w-9 h-9 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <p className="text-base font-semibold text-slate-700 mb-1">
                    { __( 'No fields added yet', 'members-forge' ) }
                </p>
                <p className="text-sm text-slate-400 mb-6 max-w-xs">
                    { __( 'Click a field type from the right panel to start building your form.', 'members-forge' ) }
                </p>
            </div>
        );
    }

    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    { __( 'Form Fields', 'members-forge' ) }
                    <span className="ml-2 font-normal normal-case text-slate-400">
                        ({ fields.length } { fields.length === 1 ? 'field' : 'fields' })
                    </span>
                </h3>
            </div>

            <div onDragLeave={ handleDragLeave } className="space-y-1">
                { fields.map( ( field, index ) => {
                    const isDragTarget = dragOverIndex === index;
                    const isDragging = dragItem.current === index;

                    return (
                        <div key={ field.id }>
                            <div
                                draggable
                                onDragStart={ () => handleDragStart( index ) }
                                onDragOver={ ( e ) => handleDragOver( e, index ) }
                                onDrop={ () => handleDrop( index ) }
                                onDragEnd={ handleDragEnd }
                                onClick={ () => onSelectField( field.id ) }
                                className={ `group flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-150 ${
                                    selectedFieldId === field.id
                                        ? 'border-brand-400 bg-brand-50 shadow-sm shadow-brand-500/10'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                } ${ isDragging ? 'opacity-30' : '' }` }
                            >
                                <span className="shrink-0 cursor-grab active:cursor-grabbing opacity-20 group-hover:opacity-60 transition-opacity">
                                    <DragHandle />
                                </span>

                                <span className="shrink-0 text-slate-400">
                                    { TYPE_ICONS[ field.type ] }
                                </span>

                                <span className="text-sm font-medium text-slate-700 min-w-0 w-32 truncate">
                                    { field.label || __( 'Untitled', 'members-forge' ) }
                                </span>

                                <div className="flex-1 max-w-xs">
                                    <InputPreview type={ field.type } />
                                </div>

                                <button
                                    onClick={ ( e ) => { e.stopPropagation(); onRemoveField( field.id ); } }
                                    className="shrink-0 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title={ __( 'Remove field', 'members-forge' ) }
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div
                                className={ `overflow-hidden transition-all duration-200 ${
                                    isDragTarget ? 'max-h-8 opacity-100 py-1' : 'max-h-0 opacity-0'
                                }` }
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px rounded-full bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                                    <span className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest shrink-0">
                                        { __( 'Drop here', 'members-forge' ) }
                                    </span>
                                    <div className="flex-1 h-px rounded-full bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                                </div>
                            </div>
                        </div>
                    );
                } ) }

                <div
                    onDragOver={ ( e ) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; updateDragOver( fields.length ); } }
                    onDrop={ () => handleDrop( fields.length ) }
                    onDragLeave={ ( e ) => { if ( e.currentTarget === e.target ) clearDragOver(); } }
                    className={ `h-10 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center mt-1 ${
                        dragOverIndex === fields.length ? 'border-brand-400 bg-brand-50/50' : 'border-transparent'
                    }` }
                >
                    { dragOverIndex === fields.length && (
                        <span className="text-xs font-medium text-brand-500">{ __( 'Drop here to add at the end', 'members-forge' ) }</span>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default BuilderCanvas;
