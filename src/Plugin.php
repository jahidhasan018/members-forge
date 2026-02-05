<?php

namespace MembersForge;

use MembersForge\API\ApiRouter;
use MembersForge\Core\ModuleManager;
use MembersForge\Modules\Admin\AdminMenu;
use MembersForge\API\Controllers\StatsController;

class Plugin
{

    /**
     * @var ModuleManager
     */
    protected $module_manager;

    public function __construct()
    {
        $this->module_manager = new ModuleManager();
    }

    public function run()
    {

        $this->module_manager->register(new AdminMenu());

        // Pass Api Router
        $stats_controller = new StatsController();
        $this->module_manager->register(new ApiRouter($stats_controller));

        $this->module_manager->boot();
    }
}
