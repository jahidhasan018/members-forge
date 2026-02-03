<?php
namespace MembersForge\Core;

use MembersForge\Interfaces\ModuleInterface;
class ModuleManager{
    protected $modules = [];

    public function register(ModuleInterface $module): self{
        $this->modules[] = $module;
        return $this;
    }

    public function boot(): void{
        foreach($this->modules as $module){
            $module->init();
        }
    }
}