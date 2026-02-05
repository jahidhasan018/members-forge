<?php
namespace MembersForge\Tests\Unit\API;

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
    public function it_returns_dashboard_stats_structure() {
        // ৩. WordPress ফাংশনগুলো মক করা
        
        // get_transient: আমরা চাই এটি false রিটার্ন করুক, যাতে ডেটা জেনারেট হয়
        Functions\when('get_transient')->justReturn(false);

        // set_transient: এটি শুধু কল হবে, কিছু রিটার্ন করার দরকার নেই
        Functions\when('set_transient')->justReturn(true);

        // current_time: একটি ফিক্সড টাইম রিটার্ন করবে
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');

        // rest_ensure_response: এটি ইনপুট ডেটাকেই ফেরত দিবে
        Functions\when('rest_ensure_response')->returnArg();

        // ৪. এবার কন্ট্রোলার টেস্ট করা
        $controller = new StatsController();
        $response = $controller->get_stats();

        // ৫. ভেরিফিকেশন
        $this->assertIsArray($response);
        $this->assertArrayHasKey('active_members', $response);
        $this->assertArrayHasKey('total_revenue', $response);
        $this->assertArrayHasKey('cached_at', $response);
    }
}