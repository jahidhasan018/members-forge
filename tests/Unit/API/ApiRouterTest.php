<?php

namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;
use MembersForge\API\ApiRouter;
use MembersForge\API\Controllers\StatsController;
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

        $mock_controller = $this->createMock(StatsController::class);

        $router = new ApiRouter($mock_controller);
        $router->init();

        $this->assertTrue(true);
    }
}
