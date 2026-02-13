import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    Button,
    TextControl,
    SelectControl,
    TextareaControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl
} from '@wordpress/components';

const DEFAULT_INITIAL_DATA = {};

const LevelForm = ({ onSave, onCancel, initialData = DEFAULT_INITIAL_DATA, isEditing = false }) => {
    // Default form state
    const getDefaultState = () => ({
        name: '',
        is_free: false,
        price: '0',
        billing_interval: 'one_time',
        trial_days: '0',
        status: 'active',
        description: '',
        max_members: '',
        features: ''
    });

    // Local state management
    const [level, setLevel] = useState(getDefaultState());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setLevel({
                name: initialData.name || '',
                is_free: initialData.is_free || initialData.price === '0' || initialData.price === 0,
                price: initialData.price || '0',
                billing_interval: initialData.billing_interval || 'one_time',
                trial_days: initialData.trial_days || '0',
                status: initialData.status || 'active',
                description: initialData.description || '',
                max_members: initialData.max_members || '',
                features: initialData.features || ''
            });
        } else {
            setLevel(getDefaultState());
        }
    }, [initialData]);

    // Input change handler
    const handleChange = (key, value) => {
        setLevel((prev) => {
            const newState = { ...prev, [key]: value };

            // If toggling free tier, reset price to 0
            if (key === 'is_free' && value === true) {
                newState.price = '0';
            }

            return newState;
        });
    };

    // Submit handler
    const handleSubmit = () => {
        // Validation
        if (!level.name.trim()) {
            alert(__('Please enter a level name', 'members-forge'));
            return;
        }

        if (!level.is_free && (!level.price || parseFloat(level.price) < 0)) {
            alert(__('Please enter a valid price', 'members-forge'));
            return;
        }

        setIsSubmitting(true);

        // Prepare data for submission
        const submitData = {
            ...level,
            price: level.is_free ? '0' : level.price,
            id: initialData?.id // Include ID for updates
        };

        onSave(submitData);
    };

    return (
        <div className="mf-level-form space-y-5">
            {/* Level Name */}
            <TextControl
                label={__('Level Name', 'members-forge')}
                value={level.name}
                onChange={(val) => handleChange('name', val)}
                placeholder={__('e.g., Gold Plan', 'members-forge')}
                __nextHasNoMarginBottom
            />

            {/* Free Tier Toggle */}
            <div className="mf-toggle-section bg-slate-50 p-4 rounded-lg border border-slate-200">
                <ToggleControl
                    label={__('Free Tier', 'members-forge')}
                    help={level.is_free
                        ? __('This is a free membership level', 'members-forge')
                        : __('This level requires payment', 'members-forge')
                    }
                    checked={level.is_free}
                    onChange={(val) => handleChange('is_free', val)}
                    __nextHasNoMarginBottom
                />
            </div>

            {/* Price & Interval Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                    <TextControl
                        label={__('Price ($)', 'members-forge')}
                        type="number"
                        min="0"
                        step="0.01"
                        value={level.price}
                        onChange={(val) => handleChange('price', val)}
                        disabled={level.is_free}
                        placeholder="0"
                        __nextHasNoMarginBottom
                    />
                </div>

                {/* Billing Interval */}
                <div>
                    <SelectControl
                        label={__('Interval', 'members-forge')}
                        value={level.billing_interval}
                        options={[
                            { label: __('One-time', 'members-forge'), value: 'one_time' },
                            { label: __('Monthly', 'members-forge'), value: 'month' },
                            { label: __('Yearly', 'members-forge'), value: 'year' },
                            { label: __('Weekly', 'members-forge'), value: 'week' },
                            { label: __('Quarterly', 'members-forge'), value: 'quarter' },
                        ]}
                        onChange={(val) => handleChange('billing_interval', val)}
                        disabled={level.is_free}
                        __nextHasNoMarginBottom
                    />
                </div>
            </div>

            {/* Trial Period - Only show for paid subscriptions */}
            {!level.is_free && level.billing_interval !== 'one_time' && (
                <TextControl
                    label={__('Trial Period (Days)', 'members-forge')}
                    type="number"
                    min="0"
                    value={level.trial_days}
                    onChange={(val) => handleChange('trial_days', val)}
                    help={__('Number of free trial days before billing starts. Set to 0 for no trial.', 'members-forge')}
                    __nextHasNoMarginBottom
                />
            )}

            {/* Status */}
            <div className="mf-status-section">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                    {__('Status', 'members-forge')}
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${level.status === 'active'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        onClick={() => handleChange('status', 'active')}
                    >
                        {__('Active', 'members-forge')}
                    </button>
                    <button
                        type="button"
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${level.status === 'inactive'
                            ? 'bg-slate-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        onClick={() => handleChange('status', 'inactive')}
                    >
                        {__('Inactive', 'members-forge')}
                    </button>
                </div>
            </div>

            {/* Max Members (optional limit) */}
            <TextControl
                label={__('Max Members (Optional)', 'members-forge')}
                type="number"
                min="0"
                value={level.max_members}
                onChange={(val) => handleChange('max_members', val)}
                help={__('Limit the number of members for this level. Leave empty for unlimited.', 'members-forge')}
                placeholder={__('Unlimited', 'members-forge')}
                __nextHasNoMarginBottom
            />

            {/* Description */}
            <TextareaControl
                label={__('Description', 'members-forge')}
                value={level.description}
                onChange={(val) => handleChange('description', val)}
                help={__('Short description shown on checkout and membership pages.', 'members-forge')}
                rows={3}
                __nextHasNoMarginBottom
            />

            {/* Features List */}
            <TextareaControl
                label={__('Features (Optional)', 'members-forge')}
                value={level.features}
                onChange={(val) => handleChange('features', val)}
                help={__('List features separated by new lines. These will be displayed as bullet points.', 'members-forge')}
                placeholder={__('Unlimited downloads\nPriority support\nExclusive content', 'members-forge')}
                rows={4}
                __nextHasNoMarginBottom
            />

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
                {onCancel && (
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        {__('Cancel', 'members-forge')}
                    </Button>
                )}
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isBusy={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-brand-600 hover:bg-brand-700"
                >
                    {isEditing
                        ? __('Save Changes', 'members-forge')
                        : __('Create Level', 'members-forge')
                    }
                </Button>
            </div>
        </div>
    );
};

export default LevelForm;