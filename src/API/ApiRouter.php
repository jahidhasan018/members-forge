<?php

namespace MembersForge\API;

use MembersForge\Interfaces\ModuleInterface;
use MembersForge\API\Controllers\StatsController;
use MembersForge\API\Controllers\LevelsController;
use MembersForge\API\Controllers\MembershipsController;
use MembersForge\API\Controllers\SettingsController;
use MembersForge\API\Controllers\FormController;

class ApiRouter implements ModuleInterface
{

    /**
     * @var StatsController
     */
    private $stats_controller;

    /**
     * $var LevelsController
     */
    private $levels_controller;

    /**
     * $var MembershipsController
     */
    private $memberships_controller;
    
    /**
     * @var SettingsController
     */
    private $settings_controller;

    /**
     * @var FormController
     */
    private $form_controller;

    /**
     * API Namespace
     */

    const NAMESPACE = 'members-forge/v1';

    /**
     * Constructor Injection
     */
    public function __construct(
        StatsController $stats_controller, 
        LevelsController $levels_controller,
        MembershipsController $memberships_controller,
        SettingsController $settings_controller,
        FormController $form_controller
    ){
        $this->stats_controller       = $stats_controller;
        $this->levels_controller      = $levels_controller;
        $this->memberships_controller = $memberships_controller;
        $this->settings_controller    = $settings_controller;
        $this->form_controller        = $form_controller;
    }

    public function init(): void
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        // Get Statastics
        register_rest_route(self::NAMESPACE, 'stats', [
            'methods'               => 'GET',
            'callback'              => [$this->stats_controller, 'get_stats'],
            'permission_callback'   => [$this, 'check_admin_permission']
        ]);

        // --- Levels Colletion Routes (GET list, POST create) ---
        register_rest_route( self::NAMESPACE, '/levels', [
            [
                'methods'               => 'GET',
                'callback'              => [$this->levels_controller, 'get_items'],
                'permission_callback'   => [$this, 'check_admin_permission']
            ],
            [
                'methods'               => 'POST',
                'callback'              => [$this->levels_controller, 'create_item'],
                'permission_callback'   => [$this, 'check_admin_permission']
            ]
        ]);

        // --- Levels Single Item Routes (PUT update, Delete remove) ---
        register_rest_route( self::NAMESPACE, '/levels/(?P<id>\d+)', [
            [
                'methods'               => 'PUT',
                'callback'              => [$this->levels_controller, 'update_item'],
                'permission_callback'   => [$this, 'check_admin_permission']
            ],
            [
                'methods'               => 'DELETE',
                'callback'              => [$this->levels_controller, 'delete_item'],
                'permission_callback'   => [$this, 'check_admin_permission']
            ]
        ]);

        // --- Memberships: POST create, GET by user ---
        register_rest_route( self::NAMESPACE, '/memberships', [
            [
                'methods'               => 'GET',
                'callback'              => [$this->memberships_controller, 'get_all_memberships'],
                'permission_callback'   => [$this, 'check_admin_permission']
            ],
            [
                'methods'               => 'POST',
                'callback'              => [$this->memberships_controller, 'create_item'],
                'permission_callback'   => '__return_true'
            ]
        ]);

        register_rest_route( self::NAMESPACE, '/memberships/user/(?P<user_id>\d+)', [
            [
                'methods'               => 'GET',
                'callback'              => [$this->memberships_controller, 'get_user_memberships'],
                'permission_callback'   => [$this, 'check_admin_permission']
            ]
        ]);

        // --- Memberships: PUT status, DELETE ---
        register_rest_route( self::NAMESPACE, '/memberships/(?P<id>\d+)/status', [
            [
                'methods'             => 'PUT',
                'callback'            => [$this->memberships_controller, 'update_status'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ]
        ]);

        register_rest_route( self::NAMESPACE, '/memberships/(?P<id>\d+)', [
            [
                'methods'             => 'DELETE',
                'callback'            => [$this->memberships_controller, 'delete_item'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ]
        ]);
        
        // --- Settings: GET all settings, PUT to save ---
        register_rest_route( self::NAMESPACE, '/settings', [
            [
                'methods'           => 'GET',
                'callback'          => [$this->settings_controller, 'get_settings'],
                'permission_callback' => [$this, 'check_admin_permission']
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [$this->settings_controller, 'update_settings'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ]
        ]);

        

        // --- Modules: GET all modules, PUT save modules ---
        register_rest_route( self::NAMESPACE, '/modules', [
            [
                'methods'             => 'GET',
                'callback'            => [$this->settings_controller, 'get_modules'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [$this->settings_controller, 'update_modules'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ]
        ]);

        // ============================================================
        // Form Builder Routes
        // ============================================================

        // --- Forms: GET list, POST create ---
        register_rest_route( self::NAMESPACE, '/forms', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this->form_controller, 'get_items' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this->form_controller, 'create_item' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
        ] );

        // --- Forms Single: GET, PUT, DELETE ---
        register_rest_route( self::NAMESPACE, '/forms/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this->form_controller, 'get_item' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [ $this->form_controller, 'update_item' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this->form_controller, 'delete_item' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
        ] );

        // --- Field Types: GET available field types ---
        register_rest_route( self::NAMESPACE, '/field-types', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this->form_controller, 'get_field_types' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
        ] );

        // --- Forms Publish: POST draft → active ---
        register_rest_route( self::NAMESPACE, '/forms/(?P<id>\d+)/publish', [
            [
                'methods'             => 'POST',
                'callback'            => [ $this->form_controller, 'publish_item' ],
                'permission_callback' => [ $this, 'check_admin_permission' ],
            ],
        ] );
    }

    public function check_admin_permission()
    {
        return current_user_can( 'manage_options' );
        //return true;
    }
}
