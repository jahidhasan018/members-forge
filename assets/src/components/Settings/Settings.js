import apiFetch from '@wordpress/api-fetch';
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// Tab definition — label and key
const TABS = [
    { key: 'general',    label: __('General',    'members-forge') },
    { key: 'membership', label: __('Membership', 'members-forge') },
    { key: 'email',      label: __('Email',      'members-forge') },
    { key: 'appearance', label: __('Appearance', 'members-forge') },
];

const Settings = () => {
    const [loading, setLoading]       = useState(true);
    const [saving, setSaving]         = useState(false);
    const [settings, setSettings]     = useState(null);
    const [error, setError]           = useState(null);
    const [activeTab, setActiveTab]   = useState('general');
    const [saved, setSaved]           = useState(false); // Save success notice

    // Fetch settings from API on component mount
    useEffect(() => {
        apiFetch({ path: '/members-forge/v1/settings' })
            .then((response) => {
                setSettings(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch settings:', err);
                setError(err.message || 'Failed to load settings.');
                setLoading(false);
            });
    }, []);

    /**
     * Update a nested settings field
     * Example: settings.general.currency = 'EUR'
     * tab = 'general', field = 'currency', value = 'EUR'
     */
    const handleChange = (tab, field, value) => {
        setSettings((prev) => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                [field]: value,
            },
        }));
    };

    /**
     * Save button click — PUT /settings
     */
    const handleSave = () => {
        setSaving(true);
        setSaved(false);

        apiFetch({
            path: '/members-forge/v1/settings',
            method: 'PUT',
            data: settings,
        })
        .then(() => {
            setSaving(false);
            setSaved(true);
            // Hide success notice after 3 seconds
            setTimeout(() => setSaved(false), 3000);
        })
        .catch((err) => {
            console.error('Failed to save settings:', err);
            setSaving(false);
            setError('Failed to save settings.');
        });
    };

    if (loading) {
        return (
            <div className="mf-loading flex items-center gap-3 p-8">
                <Spinner />
                <span className="text-slate-500">{__('Loading...', 'members-forge')}</span>
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                {__('Error', 'members-forge')}: {error}
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {__('Settings', 'members-forge')}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {__('Configure your membership plugin.', 'members-forge')}
                    </p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? __('Saving...', 'members-forge') : __('Save Changes', 'members-forge')}
                </button>
            </div>

            {/* Success Notice */}
            {saved && (
                <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                    {__('Settings saved successfully!', 'members-forge')}
                </div>
            )}

            {/* Settings Layout: Sidebar Tabs + Content */}
            <div className="flex gap-6">
                {/* Sidebar Tab Navigation */}
                <div className="w-48 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                                    activeTab === tab.key
                                        ? 'text-brand-600 border-l-brand-600 bg-brand-50'
                                        : 'text-slate-500 border-l-transparent hover:text-slate-700 hover:bg-slate-50'
                                } ${tab.key !== TABS[TABS.length - 1].key ? 'border-b border-slate-100' : ''}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6">
                    {activeTab === 'general'    && <GeneralTab    settings={settings.general}    onChange={(f, v) => handleChange('general', f, v)} />}
                    {activeTab === 'membership' && <MembershipTab settings={settings.membership} onChange={(f, v) => handleChange('membership', f, v)} />}
                    {activeTab === 'email'      && <EmailTab      settings={settings.email}      onChange={(f, v) => handleChange('email', f, v)} />}
                    {activeTab === 'appearance' && <AppearanceTab settings={settings.appearance} onChange={(f, v) => handleChange('appearance', f, v)} />}
                </div>
            </div>
        </div>
    );
};

/** General Tab */
const GeneralTab = ({ settings, onChange }) => (
    <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {__('General Settings', 'members-forge')}
        </h3>

        {/* Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Currency', 'members-forge')}
            </label>
            <div className="sm:col-span-2">
                <select
                    value={settings.currency}
                    onChange={(e) => onChange('currency', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    {['USD', 'EUR', 'GBP', 'BDT', 'INR'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Currency Position */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Currency Position', 'members-forge')}
            </label>
            <div className="sm:col-span-2">
                <select
                    value={settings.currency_position}
                    onChange={(e) => onChange('currency_position', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    <option value="before">{__('Before ($100)', 'members-forge')}</option>
                    <option value="after">{__('After (100$)', 'members-forge')}</option>
                </select>
            </div>
        </div>

        {/* Per Page */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Members Per Page', 'members-forge')}
            </label>
            <div className="sm:col-span-2">
                <input
                    type="number"
                    value={settings.per_page}
                    min="1" max="100"
                    onChange={(e) => onChange('per_page', parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
        </div>
    </div>
);

/** Membership Tab */
const MembershipTab = ({ settings, onChange }) => (
    <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {__('Membership Settings', 'members-forge')}
        </h3>

        {/* Default Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Default Status', 'members-forge')}
            </label>
            <div className="sm:col-span-2">
                <select
                    value={settings.default_status}
                    onChange={(e) => onChange('default_status', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    {['pending', 'active', 'paused'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Trial Days */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Trial Period (days)', 'members-forge')}
                <span className="block text-xs text-slate-400 font-normal">0 = no trial</span>
            </label>
            <div className="sm:col-span-2">
                <input
                    type="number"
                    value={settings.trial_days}
                    min="0"
                    onChange={(e) => onChange('trial_days', parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
        </div>

        {/* Grace Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Grace Period (days)', 'members-forge')}
                <span className="block text-xs text-slate-400 font-normal">Days of access after expiry</span>
            </label>
            <div className="sm:col-span-2">
                <input
                    type="number"
                    value={settings.grace_period_days}
                    min="0"
                    onChange={(e) => onChange('grace_period_days', parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
        </div>

        {/* Allow Multiple */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-slate-700">
                {__('Allow Multiple Plans', 'members-forge')}
            </label>
            <div className="sm:col-span-2 flex items-center gap-3">
                <button
                    onClick={() => onChange('allow_multiple', !settings.allow_multiple)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.allow_multiple ? 'bg-brand-600' : 'bg-slate-200'
                    }`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.allow_multiple ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
                <span className="text-sm text-slate-500">
                    {settings.allow_multiple ? __('Enabled', 'members-forge') : __('Disabled', 'members-forge')}
                </span>
            </div>
        </div>
    </div>
);

/** Email Tab */
const EmailTab = ({ settings, onChange }) => (
    <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {__('Email Settings', 'members-forge')}
        </h3>

        {[
            { field: 'from_name',  label: __('From Name', 'members-forge'),  type: 'text' },
            { field: 'from_email', label: __('From Email', 'members-forge'), type: 'email' },
        ].map(({ field, label, type }) => (
            <div key={field} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <label className="text-sm font-medium text-slate-700 pt-2">{label}</label>
                <div className="sm:col-span-2">
                    <input
                        type={type}
                        value={settings[field]}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
            </div>
        ))}

        {/* Toggle fields */}
        {[
            { field: 'welcome_email',   label: __('Welcome Email', 'members-forge') },
            { field: 'expiry_reminder', label: __('Expiry Reminder', 'members-forge') },
        ].map(({ field, label }) => (
            <div key={field} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <div className="sm:col-span-2 flex items-center gap-3">
                    <button
                        onClick={() => onChange(field, !settings[field])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[field] ? 'bg-brand-600' : 'bg-slate-200'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[field] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                    <span className="text-sm text-slate-500">
                        {settings[field] ? __('Enabled', 'members-forge') : __('Disabled', 'members-forge')}
                    </span>
                </div>
            </div>
        ))}

        {/* Reminder Days */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Reminder Days Before Expiry', 'members-forge')}
            </label>
            <div className="sm:col-span-2">
                <input
                    type="number"
                    value={settings.reminder_days}
                    min="1"
                    onChange={(e) => onChange('reminder_days', parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
        </div>
    </div>
);

/** Appearance Tab */
const AppearanceTab = ({ settings, onChange }) => (
    <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {__('Appearance Settings', 'members-forge')}
        </h3>

        {/* Primary Color */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('Primary Color', 'members-forge')}
            </label>
            <div className="sm:col-span-2 flex items-center gap-3">
                <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => onChange('primary_color', e.target.value)}
                    className="h-9 w-16 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-sm text-slate-500">{settings.primary_color}</span>
            </div>
        </div>

        {/* After Login Redirect */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-medium text-slate-700 pt-2">
                {__('After Login Redirect', 'members-forge')}
            </label>
            <div className="sm:col-span-2">
                <select
                    value={settings.after_login_redirect}
                    onChange={(e) => onChange('after_login_redirect', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    <option value="account">{__('My Account Page', 'members-forge')}</option>
                    <option value="home">{__('Home Page', 'members-forge')}</option>
                    <option value="dashboard">{__('Admin Dashboard', 'members-forge')}</option>
                </select>
            </div>
        </div>
    </div>
);

export default Settings;