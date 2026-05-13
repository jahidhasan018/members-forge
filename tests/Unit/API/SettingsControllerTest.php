<?php
namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;
use MembersForge\API\Controllers\SettingsController;
use Brain\Monkey\Functions;

class SettingsControllerTest extends TestCase {
    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
    public function it_returns_default_settings_when_none_saved() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('get_option')->justReturn(false);

        $controller = new SettingsController();
        $response   = $controller->get_settings();

        $this->assertTrue($response->data['success']);

        $data = $response->data['data'];

        $this->assertEquals('USD', $data['general']['currency']);
        $this->assertEquals('pending', $data['membership']['default_status']);
        $this->assertEquals(0, $data['membership']['trial_days']);
        $this->assertTrue($data['email']['welcome_email']);
    }

    /** @test */
    public function it_returns_saved_settings_merged_with_defaults() {
        Functions\when('rest_ensure_response')->returnArg();

        Functions\when('get_option')->justReturn([
            'general' => [
                'currency' => 'BDT',
            ]
        ]);

        $controller = new SettingsController();
        $response   = $controller->get_settings();

        $data = $response->data['data'];

        // Saved value আসবে
        $this->assertEquals('BDT', $data['general']['currency']);
        // Default values এখনো আছে
        $this->assertEquals('Y-m-d', $data['general']['date_format']);
        $this->assertEquals('pending', $data['membership']['default_status']);
    }

    /** @test */
    public function it_saves_settings_and_return_success() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('update_option')->justReturn(true);
        Functions\when('get_option')->justReturn([]);
        
        $controller = new SettingsController();

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/settings');
        $request->set_json_params([
            'general' => [
                'currency' => 'EUR',
                'per_page' => 50,
            ],
        ]);

        $response = $controller->update_settings($request);

        $this->assertTrue($response->data['success']);
    }

    /** @test */
    public function it_returns_error_when_save_fails() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('update_option')->justReturn(false);
        Functions\when('get_option')->justReturn([]);

        $controller = new SettingsController();

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/settings');
        $request->set_json_params(['general' => ['currency' => 'EUR']]);

        $response = $controller->update_settings($request);

        $this->assertFalse($response->data['success']);
        $this->assertEquals(500, $response->get_status());
    }
}

