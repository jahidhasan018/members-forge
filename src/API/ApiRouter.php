<?php

namespace MembersForge\API;

use MembersForge\Interfaces\ModuleInterface;
use MembersForge\API\Controllers\StatsController;

class ApiRouter implements ModuleInterface
{

    /**
     * @var StatsController
     */
    private $stats_controller;

    /**
     * API Namespace
     */

    const NAMESPACE = 'members-forge/v1';

    /**
     * Constructor Injection
     */
    public function __construct(StatsController $stats_controller)
    {
        $this->stats_controller = $stats_controller;
    }

    public function init(): void
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route(self::NAMESPACE, 'stats', [
            'methods'               => 'GET',
            'callback'              => [$this->stats_controller, 'get_stats'],
            'permission_callback'   => [$this, 'check_admin_permission']
        ]);
    }

    public function check_admin_permission()
    {
        return current_user_can( 'manage_options' );
    }
}
