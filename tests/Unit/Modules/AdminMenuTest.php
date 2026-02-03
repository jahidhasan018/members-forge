<?php
namespace MembersForge\Tests\Unit\Modules;

use PHPUnit\Framework\TestCase;
use MembersForge\Modules\Admin\AdminMenu;
use Brain\Monkey\Functions;

class AdminMenuTest extends TestCase{

    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
    public function it_adds_admin_menu_action(){
        Functions\expect('add_action')
            ->once()
            ->with('admin_menu', \Mockery::type('array'));

        $module = new AdminMenu();
        $module->init();

        $this->assertTrue(true);
    }
}