<?php

namespace MembersForge;

use MembersForge\API\ApiRouter;
use MembersForge\API\Controllers\LevelsController;
use MembersForge\Core\ModuleManager;
use MembersForge\Modules\Admin\AdminMenu;
use MembersForge\API\Controllers\StatsController;
use MembersForge\Repositories\LevelRepository;
use MembersForge\Database\Migrator;

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

        $level_repository = new LevelRepository();
        $levels_controller = new LevelsController($level_repository);
        $this->module_manager->register(new ApiRouter($stats_controller, $levels_controller));

        $this->module_manager->boot();
    }

    // Migrate/Create tables
    public static function activate(){
        Migrator::migrate();

        flush_rewrite_rules();
    }
}
