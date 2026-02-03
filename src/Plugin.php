<?php
namespace MembersForge;

use MembersForge\Core\ModuleManager;
use MembersForge\Modules\Admin\AdminMenu;

class Plugin {

    /**
     * @var ModuleManager
     */
    protected $module_manager;

    public function __construct(){
        $this->module_manager = new ModuleManager();
    }

    public function run(){
        $this->module_manager->register(new AdminMenu());
        $this->module_manager->boot();
    }
}