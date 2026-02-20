import { useState, useEffect } from '@wordpress/element';
import { Spinner, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Modal from '../UI/Modal';
import LevelForm from './LevelForm';

const Levels = ({ onNavigate }) => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);

    // Fetch levels on mount
    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = () => {
        setLoading(true);
        apiFetch({ path: '/members-forge/v1/levels' })
            .then((response) => {
                // API now returns { success: true, data: [...] }
                setLevels(response.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    };

    /**
     * Open modal for creating a new level
     */
    const handleAddNew = () => {
        setEditingLevel(null);
        setModalOpen(true);
    };

    /**
     * Open modal for editing an existing level
     */
    const handleEdit = (level) => {
        setEditingLevel(level);
        setModalOpen(true);
    };

    /**
     * Close modal and reset editing state
     */
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingLevel(null);
    };

    /**
     * Handle save (create or update)
     */
    const handleSave = (data) => {
        const isUpdating = editingLevel && editingLevel.id;

        const apiPath = isUpdating
            ? `/members-forge/v1/levels/${editingLevel.id}`
            : '/members-forge/v1/levels';

        const method = isUpdating ? 'PUT' : 'POST';

        apiFetch({
            path: apiPath,
            method: method,
            data: data,
        })
            .then((savedLevel) => {
                if (isUpdating) {
                    // Update existing level in the list
                    setLevels(levels.map(l => l.id === savedLevel.id ? savedLevel : l));
                } else {
                    // Add new level to the list
                    setLevels([...levels, savedLevel]);
                }
                handleCloseModal();
            })
            .catch((error) => {
                console.error(error);
                alert(
                    isUpdating
                        ? __('Error updating level. Please try again.', 'members-forge')
                        : __('Error creating level. Please try again.', 'members-forge')
                );
            });
    };

    /**
     * Handle clone level
     */
    const handleClone = (level) => {
        const clonedData = {
            ...level,
            name: `${level.name} (Copy)`,
            id: undefined // Remove ID to create a new level
        };

        apiFetch({
            path: '/members-forge/v1/levels',
            method: 'POST',
            data: clonedData,
        })
            .then((newLevel) => {
                setLevels([...levels, newLevel]);
            })
            .catch((error) => {
                console.error(error);
                alert(__('Error cloning level. Please try again.', 'members-forge'));
            });
    };

    /**
     * Format billing interval for display
     */
    const formatInterval = (interval) => {
        const intervalMap = {
            'one_time': __('one-time', 'members-forge'),
            'month': __('monthly', 'members-forge'),
            'year': __('yearly', 'members-forge'),
            'week': __('weekly', 'members-forge'),
            'quarter': __('quarterly', 'members-forge'),
        };
        return intervalMap[interval] || interval;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {__('Subscription Tiers', 'members-forge')}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {__('Create and manage your membership levels and pricing models.', 'members-forge')}
                    </p>
                </div>
                <Button
                    variant="primary"
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium"
                    onClick={handleAddNew}
                >
                    <span className="mr-1">+</span>
                    {__('Add New Level', 'members-forge')}
                </Button>
            </div>

            {/* Empty State */}
            {levels.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {__('No levels found', 'members-forge')}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {__('Get started by creating your first membership level.', 'members-forge')}
                    </p>
                    <Button
                        variant="primary"
                        className="bg-brand-600 hover:bg-brand-700"
                        onClick={handleAddNew}
                    >
                        {__('Create First Level', 'members-forge')}
                    </Button>
                </div>
            ) : (
                /* Levels Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.map((level) => (
                        <div
                            key={level.id}
                            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-shadow duration-200 relative group"
                        >
                            {/* Header with Status & Menu */}
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md ${level.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {level.status}
                                </span>

                                {/* Free Badge */}
                                {(level.is_free || level.price === '0' || level.price === 0) && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                        {__('Free', 'members-forge')}
                                    </span>
                                )}
                            </div>

                            {/* Level Name */}
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {level.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-10">
                                {level.description || __('No description added yet.', 'members-forge')}
                            </p>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-slate-900">
                                    ${parseInt(level.price || 0)}
                                </span>
                                <span className="text-slate-400 font-medium text-sm ml-1">
                                    / {formatInterval(level.billing_interval)}
                                </span>
                            </div>

                            {/* Trial Period Badge */}
                            {level.trial_days && parseInt(level.trial_days) > 0 && (
                                <div className="mb-4">
                                    <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        {level.trial_days} {__('day trial', 'members-forge')}
                                    </span>
                                </div>
                            )}

                            {/* Member Count (if available) */}
                            {level.member_count !== undefined && (
                                <div className="text-sm text-slate-500 mb-4 flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    {level.member_count} {__('Members', 'members-forge')}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleEdit(level)}
                                    className="flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {__('Edit', 'members-forge')}
                                </button>
                                <button
                                    onClick={() => handleClone(level)}
                                    className="flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    {__('Clone', 'members-forge')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                title={editingLevel
                    ? __('Edit', 'members-forge') + ' ' + editingLevel.name
                    : __('Create New Level', 'members-forge')
                }
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                className="mf-level-modal"
            >
                <LevelForm
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                    initialData={editingLevel || {}}
                    isEditing={!!editingLevel}
                />
            </Modal>
        </>
    );
};

export default Levels;