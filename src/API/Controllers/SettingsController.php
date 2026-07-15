<?php 
namespace MembersForge\API\Controllers;

use MembersForge\API\AbstractController;
use WP_REST_Request;

class SettingsController extends AbstractController {

    // Option Key to store Settings
    const OPTION_KEY  = 'members_forge_settings';
    const MODULES_KEY = 'members_forge_modules';

    /**
     * Get defaults settings if users dosen't save/change anything
     * @return array
     */
    public function get_defaults(): array{
        return [
            'general' => [
                'currency'          => 'USD',
                'currency_position' => 'before', // $100 or 100$
                'date_format'       => 'Y-m-d',
                'per_page'          => 20,
            ],
            'membership' => [
                'default_status'    => 'pending',
                'trial_days'        => 0,
                'grace_period_days' => 0,
                'allow_multiple'    => false,
            ],
            'email' => [
                'from_name'       => '',
                'from_email'      => '',
                'welcome_email'   => true,
                'expiry_reminder' => true,
                'reminder_days'   => 7,
            ],
            'appearance' => [
                'primary_color'        => '#6366f1',
                'account_page_id'      => 0,
                'login_page_id'        => 0,
                'after_login_redirect' => 'account',
            ],
        ];
    }

    // Get default modules
    public function get_default_modules() {
        return [
            'coupon_codes'      => false,
            'trial_period'      => false,
            'email_reminders'   => false,
            'custom_fields'     => false,
            'member_directory'  => false,
            'content_restriction' => false,
        ];
    }

    /**
     * Get /settings - Return all settings
     */
    public function get_settings() {
        $saved = get_option( self::OPTION_KEY, [] );

        if( ! is_array($saved) ){
            $saved = [];
        }

        // Merge defaults settings with saved values
        $settings = array_replace_recursive( $this->get_defaults(), $saved );

        return $this->success_response( $settings );
    }

    /**
     * PUT /settings - Save settings
     */
    public function update_settings( WP_REST_Request $request ){
        $input = $request->get_json_params();

        $existing = get_option( self::OPTION_KEY, [] );
        if( ! is_array($existing) ){
            $existing = [];
        }

        // Update new settings with Existing
        $updated = array_replace_recursive( $existing, $input );

        // Save in option table
        $saved = update_option( self::OPTION_KEY, $updated );

        if( ! $saved ){
            return $this->error_response( 'Failed to save settings.', 500 );
        }

        $final = array_replace_recursive( $this->get_defaults(), $updated );

        return $this->success_response( $final );
    }

    /**
     * GET /modules - Get modules settings
     */
    public function get_modules() {
        $modules = get_option( self::MODULES_KEY, [] );
        if( ! is_array($modules) ) {
            $modules = [];
        }

        $merged = array_merge( $this->get_default_modules(), $modules );

        return $this->success_response($merged);
    }

    /**
     * PUT /modules - Update modules
     */
    public function update_modules( WP_REST_Request $request ) {
        $params = $request->get_json_params();
        // Get an array of all keys
        $keys = array_keys( $params );

        $allowed = ['coupon_codes','trial_period','email_reminders','custom_fields','member_directory','content_restriction'];
        if( array_diff( $keys, $allowed ) ){
            return $this->error_response("The keys is not allowed", 400);
        }

        $saved = get_option(self::MODULES_KEY, []);
        if( ! is_array($saved) ) {
            $saved = [];
        }
        $merged = array_merge($saved, $params);

        $updated = update_option(self::MODULES_KEY, $merged);
        if( ! $updated ){
            return $this->error_response('Failed to save modules.', 500);
        }

        return $this->success_response( $merged );
    }
}
