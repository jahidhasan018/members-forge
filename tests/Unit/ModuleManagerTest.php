<?php
namespace MembersForge\Tests\Unit;

use PHPUnit\Framework\TestCase;
use MembersForge\Core\ModuleManager;
use MembersForge\Interfaces\ModuleInterface;

class ModuleManagerTest extends TestCase {
    /** @test */
    public function it_can_register_and_boot_modules(){
        $manager = new ModuleManager();

        $module = $this->createMock(ModuleInterface::class);

        $module->expects($this->once())->method('init');
        $manager->register($module);
        $manager->boot();
    }
}