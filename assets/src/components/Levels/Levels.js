import { useState, useEffect } from '@wordpress/element';
import { Spinner, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const Levels = () => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch({ path: '/members-forge/v1/levels' })
            .then((data) => {
                setLevels(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            })
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{__('Subscription Tiers', 'members-forge')}</h2>
                    <p className="text-slate-500 mt-1">{__('Create and manage your membership levels and pricing models.', 'members-forge')}</p>
                </div>
                <Button isPrimary className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded shadow-sm">
                    {__('+ Add New Level', 'members-forge')}
                </Button>
            </div>

            {levels.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-medium text-slate-900">{__('No levels found', 'members-forge')}</h3>
                    <Button isPrimary className="mt-4 bg-brand-600">
                        {__('Create First Level', 'members-forge')}
                    </Button>
                </div>
            ) : (
                /* Grid Layout (Screenshot Design) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.map((level) => (
                        <div key={level.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-shadow duration-200">

                            {/* Top: Badge & Menu */}
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide rounded-md ${level.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {level.status}
                                </span>
                                <button className="text-slate-400 hover:text-slate-600">⋮</button>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{level.name}</h3>
                            <p className="text-sm text-slate-500 mb-6 h-10 overflow-hidden">
                                {level.description || __('No description added yet.', 'members-forge')}
                            </p>

                            {/* Price */}
                            <div className="mb-8">
                                <span className="text-3xl font-extrabold text-slate-900">${parseInt(level.price)}</span>
                                <span className="text-slate-400 font-medium text-sm"> / {level.billing_interval}</span>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                                <button className="flex justify-center items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                    Edit
                                </button>
                                <button className="flex justify-center items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                    Clone
                                </button>
                            </div>

                            {/* Footer: Members Count (Static Mockup for now) */}
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-500">248 Members</span>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default Levels;