<?php

namespace MembersForge\API;

use MembersForge\Interfaces\ModuleInterface;
use MembersForge\API\Controllers\StatsController;
use MembersForge\API\Controllers\LevelsController;

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
     * API Namespace
     */

    const NAMESPACE = 'members-forge/v1';

    /**
     * Constructor Injection
     */
    public function __construct(StatsController $stats_controller, LevelsController $levels_controller)
    {
        $this->stats_controller     = $stats_controller;
        $this->levels_controller    = $levels_controller;
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
    }

    public function check_admin_permission()
    {
        return current_user_can( 'manage_options' );
        //return true;
    }
}
