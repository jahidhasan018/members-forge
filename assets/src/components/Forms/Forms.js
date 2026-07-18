/**
 * Forms — Forms list page
 *
 * Displays a table of all saved forms with options to
 * create new, edit, delete, and publish forms.
 */

import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * Forms component.
 *
 * @param {Object}   props
 * @param {Function} props.onNavigateToBuilder Callback to navigate to form builder.
 */
const Forms = ( { onNavigateToBuilder } ) => {
    const [ forms, setForms ] = useState( [] );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( null );

    useEffect( () => {
        fetchForms();
    }, [] );

    /**
     * Fetch all forms from the API.
     */
    const fetchForms = () => {
        setLoading( true );

        apiFetch( { path: '/members-forge/v1/forms' } )
            .then( ( response ) => {
                setForms( response.data || [] );
                setLoading( false );
            } )
            .catch( ( err ) => {
                console.error( 'Failed to fetch forms:', err );
                setError( err.message || 'Failed to load forms.' );
                setLoading( false );
            } );
    };

    /**
     * Delete a form after confirmation.
     *
     * @param {Object} form Form object to delete.
     */
    const handleDelete = ( form ) => {
        if (
            ! window.confirm(
                __( 'Are you sure you want to delete', 'members-forge' ) +
                    ` "${ form.name }"?`
            )
        ) {
            return;
        }

        apiFetch( {
            path: `/members-forge/v1/forms/${ form.id }`,
            method: 'DELETE',
        } )
            .then( () => {
                setForms( ( prev ) => prev.filter( ( f ) => f.id !== form.id ) );
            } )
            .catch( ( err ) => {
                console.error( 'Failed to delete form:', err );
                alert( __( 'Error deleting form. Please try again.', 'members-forge' ) );
            } );
    };

    /**
     * Publish a form (draft → active).
     *
     * @param {Object} form Form object to publish.
     */
    const handlePublish = ( form ) => {
        apiFetch( {
            path: `/members-forge/v1/forms/${ form.id }/publish`,
            method: 'POST',
        } )
            .then( () => {
                setForms( ( prev ) =>
                    prev.map( ( f ) =>
                        f.id === form.id ? { ...f, status: 'active' } : f
                    )
                );
            } )
            .catch( ( err ) => {
                console.error( 'Failed to publish form:', err );
                alert( __( 'Error publishing form.', 'members-forge' ) );
            } );
    };

    const getStatusClass = ( status ) => {
        return status === 'active'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500';
    };

    const getFormTypeLabel = ( type ) => {
        const labels = {
            registration: __( 'Registration', 'members-forge' ),
            login: __( 'Login', 'members-forge' ),
            checkout: __( 'Checkout', 'members-forge' ),
            profile: __( 'Profile', 'members-forge' ),
        };

        return labels[ type ] || type;
    };

    if ( loading ) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner />
                <span className="ml-3 text-slate-500">{ __( 'Loading forms...', 'members-forge' ) }</span>
            </div>
        );
    }

    if ( error ) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <p className="font-medium">{ __( 'Error loading forms', 'members-forge' ) }</p>
                <p className="text-sm mt-1">{ error }</p>
                <button
                    onClick={ fetchForms }
                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                    { __( 'Try Again', 'members-forge' ) }
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        { __( 'Forms', 'members-forge' ) }
                    </h2>
                    <p className="text-slate-500 mt-1">
                        { __( 'Create and manage your membership forms.', 'members-forge' ) }
                    </p>
                </div>

                <button
                    onClick={ () => onNavigateToBuilder( null ) }
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    { __( 'Add New Form', 'members-forge' ) }
                </button>
            </div>

            {/* Empty State */}
            { forms.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="text-5xl mb-4">
                        <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        { __( 'No forms yet', 'members-forge' ) }
                    </h3>
                    <p className="text-slate-500 mb-6">
                        { __( 'Create your first form to start collecting memberships.', 'members-forge' ) }
                    </p>
                    <button
                        onClick={ () => onNavigateToBuilder( null ) }
                        className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        { __( 'Create Your First Form', 'members-forge' ) }
                    </button>
                </div>
            ) : (
                /* Forms Table */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    { __( 'Name', 'members-forge' ) }
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    { __( 'Type', 'members-forge' ) }
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    { __( 'Shortcode', 'members-forge' ) }
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    { __( 'Status', 'members-forge' ) }
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    { __( 'Actions', 'members-forge' ) }
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { forms.map( ( form, index ) => (
                                <tr
                                    key={ form.id }
                                    className={ `hover:bg-slate-50 transition-colors ${
                                        index !== forms.length - 1 ? 'border-b border-slate-100' : ''
                                    }` }
                                >
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            { form.name }
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            { form.fields
                                                ? `${ form.fields.length } ${ __( 'fields', 'members-forge' ) }`
                                                : '' }
                                        </p>
                                    </td>

                                    {/* Type */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">
                                            { getFormTypeLabel( form.type ) }
                                        </span>
                                    </td>

                                    {/* Shortcode */}
                                    <td className="px-6 py-4">
                                        { form.shortcode_key && (
                                            <code className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                                { `[mf_form key="${ form.shortcode_key }"]` }
                                            </code>
                                        ) }
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span
                                            className={ `px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md ${ getStatusClass(
                                                form.status
                                            ) }` }
                                        >
                                            { form.status }
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Publish Button (only if draft) */}
                                            { form.status === 'draft' && (
                                                <button
                                                    onClick={ () => handlePublish( form ) }
                                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                                                >
                                                    { __( 'Publish', 'members-forge' ) }
                                                </button>
                                            ) }

                                            {/* Edit Button */}
                                            <button
                                                onClick={ () => onNavigateToBuilder( form.id ) }
                                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
                                            >
                                                { __( 'Edit', 'members-forge' ) }
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={ () => handleDelete( form ) }
                                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                            >
                                                { __( 'Delete', 'members-forge' ) }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            ) }
        </div>
    );
};

export default Forms;
