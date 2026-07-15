<?php
namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;
use Brain\Monkey\Functions;
use MembersForge\Repositories\MembershipRepository;
use MembersForge\API\Controllers\MembershipsController;
use Mockery;

class MembershipsControllerTest extends TestCase {

    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_creates_a_membership_and_returns_201(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);
        Functions\when('get_current_user_id')->justReturn(5);
        Functions\when('sanitize_text_field')->returnArg();

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldReceive('create')
            ->once()
            ->with(5, 2, Mockery::type('array'))
            ->andReturn(10);

        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('POST', '/members-forge/v1/memberships');
        $request->set_body_params([
            'level_id'   => 2,
            'amount_paid' => 49.99,
            'currency'   => 'USD',
        ]);

        $response = $controller->create_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertTrue($response->data['success']);
        $this->assertEquals(201, $response->get_status());
        $this->assertEquals(10, $response->data['data']['id']);
    }

    /** @test */
    public function it_returns_400_when_level_id_missing() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);
        Functions\when('get_current_user_id')->justReturn(5);

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldNotReceive('create');

        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('POST', '/members-forge/v1/memberships');
        $request->set_body_params(['amount_paid' => 49.99]);

        $response = $controller->create_item($request);

        $this->assertFalse($response->data['success']);
        $this->assertEquals(400, $response->get_status());
    }

    /** @test */
    public function it_returns_memberships_for_a_user() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldReceive('get_by_user')
            ->once()
            ->with(3)
            ->andReturn([
                (object) ['id' => 1, 'user_id' => 3, 'status' => 'active'],
                (object) ['id' => 2, 'user_id' => 3, 'status' => 'expired'],
            ]);
        
        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('GET', 'members-forge/v1/memberships/user/3');
        $request->set_url_params(['user_id' => 3]);

        $response = $controller->get_user_memberships($request);

        $this->assertTrue($response->data['success']);
        $this->assertCount(2, $response->data['data']);
    }

    /** @test */
    public function it_updates_membership_status() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);
        Functions\when('sanitize_text_field')->returnArg();

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldReceive('get_by_id')
            ->once()
            ->with(7)
            ->andReturn((object) ['id' => 7, 'status' => 'pending']);
        $repo->shouldReceive('update_status')
            ->once()
            ->with(7, 'active')
            ->andReturn(true);

        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/memberships/7/status');
        $request->set_url_params(['id' => 7]);
        $request->set_body_params(['status' => 'active']);

        $response = $controller->update_status($request);

        $this->assertTrue($response->data['success']);
        $this->assertEquals(200, $response->get_status());
    }

    /** @test */
    public function it_returns_404_when_updating_status_of_missing_membership(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldReceive('get_by_id')->with(999)->andReturn(null);
        $repo->shouldNotReceive('update_status');

        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/memberships/999/status');
        $request->set_url_params(['id' => 999]);
        $request->set_body_params(['status' => 'active']);

        $response = $controller->update_status($request);
        
        $this->assertFalse($response->data['success']);
        $this->assertEquals(404, $response->get_status());
    }

    /** @test */
    public function it_delete_a_membership(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldReceive('get_by_id')->once()->with(4)->andReturn((object) ['id' => 4]);
        $repo->shouldReceive('delete')->once()->with(4)->andReturn(true);

        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('DELETE', '/members-forge/v1/memberships/4');
        $request->set_url_params(['id' => 4]);

        $response = $controller->delete_item($request);

        $this->assertTrue($response->data['success']);
        $this->assertEquals(200, $response->get_status());
    }

    /** @test */
    public function it_returns_all_memberships_with_user_and_level_info() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        // Response mimics JOIN query — includes user and level info
        $mock_data = [
            (object) [
                'id'           => 1,
                'user_id'      => 10,
                'status'       => 'active',
                'display_name' => 'John Doe',
                'user_email'   => 'john@example.com',
                'level_name'   => 'Gold Plan',
            ],
        ];

        $repo = Mockery::mock(MembershipRepository::class);
        $repo->shouldReceive('get_all')
            ->once()
            ->withNoArgs()
            ->andReturn($mock_data);

        $controller = new MembershipsController($repo);

        $request = new \WP_REST_Request('GET', '/members-forge/v1/memberships');

        $response = $controller->get_all_memberships($request);

        $this->assertTrue($response->data['success']);
        $this->assertCount(1, $response->data['data']);
        $this->assertEquals('John Doe', $response->data['data'][0]->display_name);
        $this->assertEquals('Gold Plan', $response->data['data'][0]->level_name);
    }
}
