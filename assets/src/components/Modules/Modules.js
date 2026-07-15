import apiFetch from '@wordpress/api-fetch';
import { Snackbar } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const Modules = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enabled, setEnabled] = useState({});
    const [snack, setSnack] = useState({
        message: '',
        type: '',
        visible: false
    });

    // Helper function to show snackbar message
    const showSnack = (message, type = 'success') => {
        setSnack({
            message,
            type,
            visible: true,
        });

        setTimeout(() => {
            setSnack((prev) => ({ ...prev, visible: false }));
        }, 3000);
    };

    const MODULE_CONFIG = {
        coupon_codes:        { label: 'Coupon Codes',        desc: 'Allow discount coupons on membership signup.' },
        trial_period:        { label: 'Trial Period',         desc: 'Offer free trial before charging.' },
        email_reminders:     { label: 'Email Reminders',      desc: 'Send automated renewal reminder emails.' },
        custom_fields:       { label: 'Custom Fields',        desc: 'Add custom fields to registration form.' },
        member_directory:    { label: 'Member Directory',     desc: 'Show a public list of members.' },
        content_restriction: { label: 'Content Restriction',  desc: 'Restrict posts/pages to members only.' },
    };

    // Get initial enabled state from server (placeholder)
    useEffect(() => {

        apiFetch({ path: '/members-forge/v1/modules' })
            .then((data) => {
                setEnabled(data.data || {});
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    if( loading ){
        return(
            <div className="text-center py-12 text-gray-400">
                Loading modules...
            </div>
        )
    }

    if( error ) {
        return(
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                Failed to load modules. Please try again.
            </div>
        )
    }

    // handleToggleClick
    const handleToggle = async (key) => {
        const nextValue = !enabled[key];

        // 1. optimistic UI update
        setEnabled((prev) => ({
            ...prev,
            [key]: nextValue,
        }));
        
        try {
            // 2. send full updated state OR partial update (depends on API)
            const updated = {
                ...enabled,
                [key]: nextValue,
            };

            await apiFetch({
                path: '/members-forge/v1/modules',
                method: 'PUT',
                data: updated,
            });

            showSnack(`${MODULE_CONFIG[key].label} ${nextValue ? 'enabled' : 'disabled'}`, 'success');
            
        } catch (err) {
            // 3. rollback if fail
            setEnabled((prev) => ({
                ...prev,
                [key]: !nextValue,
            }));

            showSnack(`Failed to enabled ${MODULE_CONFIG[key].label}`, 'error');
            setError(err);
        }
    }

    return(
        <div className="modules-page">

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Modules</h1>
                <p className="text-sm text-gray-500 mt-1">Enable or disable features for your membership site.</p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
                {Object.entries(MODULE_CONFIG).map(([key, module]) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-5 flex items-start justify-between gap-4">
                
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">
                                {module.label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {module.desc}
                            </p>
                        </div>

                        <button
                            type="button"
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled[key] ? 'bg-indigo-500' : 'bg-gray-300'}`}
                            role="switch"
                            aria-label={module.label}
                            aria-checked={String(!!enabled[key])}
                            onClick={() => handleToggle (key)}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${enabled[key] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>

                    </div>
                ))}
            </div>

            {snack.visible && (
                <Snackbar
                    className={`mf-snackbar ${snack.type === 'error' ? 'is-error' : 'is-success'}`}
                >
                    {snack.message}
                </Snackbar>
            )}
        </div>
    )
}

export default Modules;