<?php
namespace MembersForge\Tests\Unit\API;

use Mockery;
use PHPUnit\Framework\TestCase;
use MembersForge\API\Controllers\StatsController;
use Brain\Monkey\Functions;

// WordPress constants that are not available in test environment
if (!defined('HOUR_IN_SECONDS')) {
    define('HOUR_IN_SECONDS', 3600);
}

class StatsControllerTest extends TestCase {

    // ১. Brain Monkey সেটআপ করা
    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    // ২. প্রতিটি টেস্টের পর ক্লিন করা
    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
    public function it_returns_cached_stats_without_db_query() {
        // Cached data
        $cached = [
            'total_members'    => 100,
            'active_members'   => 80,
            'expired_members'  => 10,
            'cancelled_members'=> 5,
            'pending_members'  => 5,
        ];

        Functions\when('get_transient')->justReturn($cached);
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');

        $controller = new StatsController();
        $response = $controller->get_stats();

        $this->assertTrue($response->data['success']);
        // Cache থেকে এলে DB query হয়নি — তাই value same
        $this->assertEquals(100, $response->data['data']['total_members']);
        $this->assertEquals(80, $response->data['data']['active_members']);
    }

    /** @test */
    public function it_queries_db_when_cache_is_empty() {
        // Cache DB query
        Functions\when('get_transient')->justReturn(false);
        Functions\when('set_transient')->justReturn(true);
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');

        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('get_var')
            ->times(5)
            ->andReturn(10, 8, 1, 1, 0);

        $controller = new StatsController();
        $response = $controller->get_stats();

        $this->assertTrue($response->data['success']);
        $this->assertArrayHasKey('total_members',    $response->data['data']);
        $this->assertArrayHasKey('active_members',   $response->data['data']);
        $this->assertArrayHasKey('expired_members',  $response->data['data']);
        $this->assertArrayHasKey('cancelled_members',$response->data['data']);
        $this->assertArrayHasKey('pending_members',  $response->data['data']);
    }
}