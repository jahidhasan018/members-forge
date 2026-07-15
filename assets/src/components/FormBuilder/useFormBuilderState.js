/**
 * useFormBuilderState — Central state hook for the Form Builder
 *
 * Manages fields, selected field, and form metadata.
 * Provides add, remove, update, and reorder operations.
 */

import { useState, useCallback } from '@wordpress/element';

let fieldCounter = 0;

/**
 * Generate a unique field ID.
 *
 * @return {string} Unique field identifier.
 */
const generateFieldId = () => {
    fieldCounter += 1;
    return `field_${fieldCounter}_${Date.now()}`;
};

/**
 * Form Builder state hook.
 *
 * @param {Object} initialData Optional initial form data for editing.
 * @return {Object} State and action methods.
 */
const useFormBuilderState = ( initialData = {} ) => {
    const [ fields, setFields ] = useState( initialData.fields || [] );
    const [ selectedFieldId, setSelectedFieldId ] = useState( null );
    const [ formMeta, setFormMeta ] = useState( {
        name: initialData.name || '',
        type: initialData.type || 'registration',
        status: initialData.status || 'draft',
        settings: initialData.settings || {
            submit_action: 'registration',
            redirect_url: '',
            auto_login: true,
            email_notification: true,
            actions: [],
        },
    } );

    const selectedField = fields.find( ( f ) => f.id === selectedFieldId ) || null;

    /**
     * Add a new field to the form.
     *
     * @param {string} type Field type identifier.
     */
    const addField = useCallback( ( type ) => {
        const newField = {
            id: generateFieldId(),
            type,
            label: '',
            name: '',
            required: false,
            order: fields.length,
            placeholder: '',
            options: [],
        };

        setFields( ( prev ) => [ ...prev, newField ] );
        setSelectedFieldId( newField.id );
    }, [ fields.length ] );

    /**
     * Remove a field from the form.
     *
     * @param {string} id Field ID to remove.
     */
    const removeField = useCallback( ( id ) => {
        setFields( ( prev ) => prev.filter( ( f ) => f.id !== id ) );

        setSelectedFieldId( ( prevId ) => ( prevId === id ? null : prevId ) );
    }, [] );

    /**
     * Update a single field's properties.
     *
     * @param {string} id      Field ID to update.
     * @param {Object} changes Partial field properties to merge.
     */
    const updateField = useCallback( ( id, changes ) => {
        setFields( ( prev ) =>
            prev.map( ( f ) => ( f.id === id ? { ...f, ...changes } : f ) )
        );
    }, [] );

    /**
     * Reorder fields via drag and drop.
     *
     * @param {number} fromIndex Current index of the field.
     * @param {number} toIndex   Target index to move to.
     */
    const reorderFields = useCallback( ( fromIndex, toIndex ) => {
        setFields( ( prev ) => {
            const updated = [ ...prev ];
            const [ moved ] = updated.splice( fromIndex, 1 );
            updated.splice( toIndex, 0, moved );

            return updated.map( ( f, index ) => ( { ...f, order: index } ) );
        } );
    }, [] );

    return {
        fields,
        selectedField,
        selectedFieldId,
        formMeta,
        setFormMeta,
        setSelectedFieldId,
        addField,
        removeField,
        updateField,
        reorderFields,
    };
};

export default useFormBuilderState;
