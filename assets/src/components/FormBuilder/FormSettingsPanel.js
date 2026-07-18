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

const FORM_TYPES = [
    { value: 'registration', label: 'Registration' },
    { value: 'login', label: 'Login' },
    { value: 'checkout', label: 'Checkout' },
    { value: 'custom', label: 'Custom' },
];

const FormSettingsPanel = ( { formMeta, setFormMeta } ) => {
    const updateSetting = ( key, value ) => {
        setFormMeta( ( prev ) => ( { ...prev, settings: { ...prev.settings, [ key ]: value } } ) );
    };

    const updateMeta = ( key, value ) => {
        setFormMeta( ( prev ) => ( { ...prev, [ key ]: value } ) );
    };

    const settings = formMeta.settings || {};
    const actions = settings.actions || [];

    return (
        <div className="divide-y divide-slate-100">
            {/* Header */}
            <div className="px-4 py-3">
                <p className="text-sm font-medium text-slate-700">{ formMeta.name || __( 'Untitled Form', 'members-forge' ) }</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{ __( 'Configure form-level settings', 'members-forge' ) }</p>
            </div>

            {/* General */}
            <Section title={ __( 'General', 'members-forge' ) } icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            }>
                {/* Form Type */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Form Type', 'members-forge' ) }</label>
                    <select value={ formMeta.type || 'registration' } onChange={ ( e ) => updateMeta( 'type', e.target.value ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all bg-white appearance-none">
                        { FORM_TYPES.map( ( t ) => ( <option key={ t.value } value={ t.value }>{ t.label }</option> ) ) }
                    </select>
                </div>

                {/* Form Status */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-[11px] font-medium text-slate-500">{ __( 'Published', 'members-forge' ) }</label>
                        <p className="text-[10px] text-slate-400">{ __( 'Make form available on frontend', 'members-forge' ) }</p>
                    </div>
                    <button
                        onClick={ () => updateMeta( 'status', formMeta.status === 'active' ? 'draft' : 'active' ) }
                        className={ `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ formMeta.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300' }` }
                        role="switch" aria-checked={ formMeta.status === 'active' }
                    >
                        <span className={ `inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ formMeta.status === 'active' ? 'translate-x-[18px]' : 'translate-x-[2px]' }` } />
                    </button>
                </div>
            </Section>

            {/* Submission */}
            <Section title={ __( 'Submission', 'members-forge' ) } icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }>
                {/* Submit Button Label */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Submit Button', 'members-forge' ) }</label>
                    <input type="text" value={ settings.submit_label || '' } onChange={ ( e ) => updateSetting( 'submit_label', e.target.value ) } placeholder={ __( 'e.g., Register Now', 'members-forge' ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                </div>

                {/* Success Message */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Success Message', 'members-forge' ) }</label>
                    <textarea value={ settings.success_message || '' } onChange={ ( e ) => updateSetting( 'success_message', e.target.value ) } placeholder={ __( 'Message shown after successful submission', 'members-forge' ) } rows={ 2 } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300 resize-none" />
                </div>

                {/* Redirect URL */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Redirect URL', 'members-forge' ) }</label>
                    <input type="url" value={ settings.redirect_url || '' } onChange={ ( e ) => updateSetting( 'redirect_url', e.target.value ) } placeholder={ __( 'https://example.com/thank-you', 'members-forge' ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                    <p className="text-[10px] text-slate-400 mt-1">{ __( 'Redirect users here after submission.', 'members-forge' ) }</p>
                </div>

                {/* Hide form after submit */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-[11px] font-medium text-slate-500">{ __( 'Hide after submit', 'members-forge' ) }</label>
                        <p className="text-[10px] text-slate-400">{ __( 'Replace form with success message', 'members-forge' ) }</p>
                    </div>
                    <button
                        onClick={ () => updateSetting( 'hide_after_submit', ! settings.hide_after_submit ) }
                        className={ `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ settings.hide_after_submit ? 'bg-brand-600' : 'bg-slate-300' }` }
                        role="switch" aria-checked={ !! settings.hide_after_submit }
                    >
                        <span className={ `inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ settings.hide_after_submit ? 'translate-x-[18px]' : 'translate-x-[2px]' }` } />
                    </button>
                </div>
            </Section>

            {/* Actions */}
            <Section title={ __( 'Actions', 'members-forge' ) } defaultOpen={ actions.length > 0 } icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            }>
                <p className="text-[10px] text-slate-400">{ __( 'Choose what happens on form submission.', 'members-forge' ) }</p>

                <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-brand-200 cursor-pointer transition-colors">
                        <input type="checkbox" checked={ actions.includes( 'create_user' ) } onChange={ ( e ) => { updateSetting( 'actions', e.target.checked ? [ ...actions, 'create_user' ] : actions.filter( ( a ) => a !== 'create_user' ) ); } } className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                        <div>
                            <span className="text-sm font-medium text-slate-700">{ __( 'Create User', 'members-forge' ) }</span>
                            <p className="text-[10px] text-slate-400">{ __( 'Register a new WordPress user', 'members-forge' ) }</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-brand-200 cursor-pointer transition-colors">
                        <input type="checkbox" checked={ actions.includes( 'send_email' ) } onChange={ ( e ) => { updateSetting( 'actions', e.target.checked ? [ ...actions, 'send_email' ] : actions.filter( ( a ) => a !== 'send_email' ) ); } } className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                        <div>
                            <span className="text-sm font-medium text-slate-700">{ __( 'Send Email', 'members-forge' ) }</span>
                            <p className="text-[10px] text-slate-400">{ __( 'Send a notification email', 'members-forge' ) }</p>
                        </div>
                    </label>
                </div>

                {/* Conditional Settings */}
                <div className="space-y-3 pl-1 border-l-2 border-brand-200 ml-1.5">
                    { actions.includes( 'create_user' ) && (
                        <div className="flex items-center justify-between pt-1">
                            <div>
                                <label className="text-[11px] font-medium text-slate-500">{ __( 'Auto-login', 'members-forge' ) }</label>
                                <p className="text-[10px] text-slate-400">{ __( 'Log in user after registration', 'members-forge' ) }</p>
                            </div>
                            <button
                                onClick={ () => updateSetting( 'auto_login', ! settings.auto_login ) }
                                className={ `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ settings.auto_login ? 'bg-brand-600' : 'bg-slate-300' }` }
                                role="switch" aria-checked={ !! settings.auto_login }
                            >
                                <span className={ `inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ settings.auto_login ? 'translate-x-[18px]' : 'translate-x-[2px]' }` } />
                            </button>
                        </div>
                    ) }

                    { actions.includes( 'send_email' ) && (
                        <>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Notification Email', 'members-forge' ) }</label>
                                <input type="email" value={ settings.notification_email || '' } onChange={ ( e ) => updateSetting( 'notification_email', e.target.value ) } placeholder={ __( 'admin@example.com', 'members-forge' ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">{ __( 'Email Subject', 'members-forge' ) }</label>
                                <input type="text" value={ settings.email_subject || '' } onChange={ ( e ) => updateSetting( 'email_subject', e.target.value ) } placeholder={ __( 'Thank you for registering', 'members-forge' ) } className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all placeholder-slate-300" />
                            </div>
                        </>
                    ) }
                </div>
            </Section>
        </div>
    );
};

export default FormSettingsPanel;
