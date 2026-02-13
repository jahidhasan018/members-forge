<?php

namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;
use MembersForge\API\ApiRouter;
use MembersForge\API\Controllers\StatsController;
use MembersForge\API\Controllers\LevelsController;
use Brain\Monkey\Functions;

class ApiRouterTest extends TestCase
{

    protected function setUp(): void
    {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    protected function tearDown(): void
    {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
    public function it_register_rest_api_routes()
    {
        Functions\expect('add_action')
            ->once()
            ->with('rest_api_init', \Mockery::type('array'));

        $mock_stats_controller = $this->createMock(StatsController::class);
        $mock_level_controller = $this->createMock(LevelsController::class);

        $router = new ApiRouter($mock_stats_controller, $mock_level_controller);
        $router->init();

        $this->assertTrue(true);
    }

    /** @test */
    public function check_admin_permission_returns_true_for_admin(){
        Functions\expect('current_user_can')
            ->once()
            ->with('manage_options')
            ->andReturn(true);

        $mock_stats_controller = $this->createMock(StatsController::class);
        $mock_level_controller = $this->createMock(LevelsController::class);
        $router = new ApiRouter($mock_stats_controller, $mock_level_controller);

        $this->assertTrue($router->check_admin_permission());
    }

    /** @test */
    public function check_admin_permission_returns_false_for_non_admin()
    {
        Functions\expect('current_user_can')
            ->once()
            ->with('manage_options')
            ->andReturn(false);

        $mock_stats_controller = $this->createMock(StatsController::class);
        $mock_level_controller = $this->createMock(LevelsController::class);
        $router = new ApiRouter($mock_stats_controller, $mock_level_controller);

        $this->assertFalse($router->check_admin_permission());
    }

}
