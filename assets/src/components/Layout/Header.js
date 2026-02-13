import { useState } from '@wordpress/element';
import { SelectControl, Button } from '@wordpress/components';
import { bell } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Header Component - Top bar with title and actions
 * Uses @wordpress/components with brand styling via CSS
 */
const Header = ({ title, subtitle }) => {
    const [period, setPeriod] = useState('6months');

    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div>
                <h1 className="text-lg font-semibold text-slate-800 m-0">{title}</h1>
                {subtitle && (
                    <p className="text-xs text-slate-500 m-0">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Time Period Dropdown */}
                <div className="hidden sm:block">
                    <SelectControl
                        value={period}
                        options={[
                            { label: __('Last 6 Months', 'members-forge'), value: '6months' },
                            { label: __('Last 12 Months', 'members-forge'), value: '12months' },
                            { label: __('This Year', 'members-forge'), value: 'year' },
                        ]}
                        onChange={setPeriod}
                        __nextHasNoMarginBottom
                        hideLabelFromVision
                        size="compact"
                    />
                </div>

                {/* Notification Bell */}
                <Button
                    icon={bell}
                    label={__('Notifications', 'members-forge')}
                    className="text-slate-400 hover:text-brand-600"
                />

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                    A
                </div>
            </div>
        </header>
    );
};

export default Header;