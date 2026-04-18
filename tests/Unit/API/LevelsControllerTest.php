<?php
namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;
use Brain\Monkey\Functions;
use MembersForge\Repositories\LevelRepository;
use MembersForge\API\Controllers\LevelsController;
use Mockery;

class LevelsControllerTest extends TestCase{

    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    public function tearDown(): void {
        \Brain\Monkey\tearDown();
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_return_levels_via_api(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);

        $repoMock->shouldReceive('get_levels')
            ->andReturn([
                (object) ['id' => 1, 'name' => 'Silver'],
                (object) ['id' => 2, 'name' => 'Gold']
            ]);

        $contorller = new LevelsController($repoMock);

        $request = new \WP_REST_Request();
        $response = $contorller->get_items($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertTrue($response->data['success']);
        $this->assertCount(2, $response->data['data']);
        $this->assertEquals('Silver', $response->data['data'][0]->name);
    }

    /** @test */
    public function it_creates_a_level_and_returns_201(){
        // WP helper mock করা হচ্ছে যাতে test environment এ dependency issue না হয়
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        // Repository mock: create call এ নতুন id return করবে
        $repoMock = Mockery::mock(LevelRepository::class);
        $repoMock->shouldReceive('create')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn(10);

        $controller = new LevelsController($repoMock);

        // Post request payload simulate করা হচ্ছে
        $request = new \WP_REST_Request('POST', '/members-forge/v1/levels');
        $request->set_body_params([
            'name' => 'Pro Plan',
            'price' => 49.99,
            'status' => 'active'
        ]);

        $response = $controller->create_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertTrue($response->data['success']);
        $this->assertEquals(201, $response->get_status());
        $this->assertEquals(10, $response->data['data']['id']);
    }

    /** @test */
    public function it_updates_an_existing_level(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);

        // Update এর আগে existence check করা হচ্ছে
        $repoMock->shouldReceive('get_by_id')
            ->once()
            ->with(5)
            ->andReturn((object) ['id' => 5, 'name' => 'Silver']);

        $repoMock->shouldReceive('update')
            ->once()
            ->with(5, Mockery::type('array'))
            ->andReturn(true);

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/levels/5');
        $request->set_url_params(['id' => 5]);
        $request->set_body_params([
            'name'  => 'Silver Plus',
            'price' => 29.99
        ]);

        $response = $controller->update_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertTrue($response->data['success']);
        $this->assertEquals(200, $response->get_status());
    }

    /** @test */
    public function it_returns_404_when_updating_a_missing_level(){
        Functions\when('rest_ensure_response')->returnArg();        
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);

        // id না থাকলে null return হবে
        $repoMock->shouldReceive('get_by_id')
            ->once()
            ->with(999)
            ->andReturn(null);

        // not found case এ update call হওয়া উচিত না
        $repoMock->shouldNotReceive('update');

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/levels/999');
        $request->set_url_params(['id' => 999]);
        $request->set_body_params(['name' => 'Ghost Plan']);

        $response = $controller->update_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertFalse($response->data['success']);
        $this->assertEquals(404, $response->get_status());
    }

    /** @test */
    public function it_deletes_an_existing_level(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);

        $repoMock->shouldReceive('get_by_id')
            ->once()
            ->with(7)
            ->andReturn((object) ['id' => 7, 'name' => 'Basic']);

        $repoMock->shouldReceive('delete')
            ->once()
            ->with(7)
            ->andReturn(true);

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('DELETE', '/members-forge/v1/levels/7');
        $request->set_url_params(['id' => 7]);

        $response = $controller->delete_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertTrue($response->data['success']);
        $this->assertEquals(200, $response->get_status());
    }

    /** @test */
    public function it_return_400_when_creating_level_without_name(){
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);
        $repoMock->shouldNotReceive('create');

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('POST', '/members-forge/v1/levels');

        $request->set_body_params([
            'price'     => 20,
            'status'    => 'active'
        ]);

        $response = $controller->create_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertFalse($response->data['success']);
        $this->assertEquals(400, $response->get_status());
    }

    /** @test */
    public function it_returns_400_when_updating_with_invalid_id() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock( LevelRepository::class );
        $repoMock->shouldNotReceive('get_by_id');
        $repoMock->shouldNotReceive('update');

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/levels/0');
        $request->set_url_params(['id' => 0]);
        $request->set_body_params(['name' => 'Invalid']);

        $response = $controller->update_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertFalse($response->data['success']);
        $this->assertEquals(400, $response->get_status());
    }

    /** @test */
    public function it_creates_a_level_from_json_payload() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('sanitize_textarea_field')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);
        $repoMock->shouldReceive('create')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn(15);
        
        $controller = new LevelsController($repoMock);

        // Simulate JSON payload
        $request = new \WP_REST_Request('POST', '/members-forge/v1/levels');
        $request->set_body_params([
            'name'      => 'JSON Plan',
            'price'     => 99.00,
            'status'    => 'active'
        ]);

        $response = $controller->create_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertTrue($response->data['success']);
        $this->assertEquals(201, $response->get_status());
        $this->assertEquals(15, $response->data['data']['id']);
    }

    /** @test */
    public function it_returns_400_when_deleting_with_invalid_id() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);

        $repoMock = Mockery::mock(LevelRepository::class);
        $repoMock->shouldNotReceive('get_by_id');
        $repoMock->shouldNotReceive('delete');

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('DELETE', '/members-forge/v1/levels/0');
        $request->set_url_params(['id'  => 0]);

        $response = $controller->delete_item($request);

        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertFalse($response->data['success']);
        $this->assertEquals(400, $response->get_status());
    }

    /** @test */
    public function it_returns_correct_message_when_update_fails() {
        Functions\when('rest_ensure_response')->returnArg();
        Functions\when('current_user_can')->justReturn(true);
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('sanitize_textarea_field')->returnArg();

        $repoMock = Mockery::mock(LevelRepository::class);
        $repoMock->shouldReceive('get_by_id')
            ->once()
            ->with(3)
            ->andReturn( (object) ['id' => 3, 'name' => 'Basic'] );
        
        $repoMock->shouldReceive('update')
            ->once()
            ->andReturn(false);

        $controller = new LevelsController($repoMock);

        $request = new \WP_REST_Request('PUT', '/members-forge/v1/levels/3');
        $request->set_url_params(['id' => 3]);
        $request->set_body_params(['name' => 'Update Name']);

        $response = $controller->update_item($request);

        $this->assertFalse($response->data['success']);
        $this->assertEquals(500, $response->get_status());
        $this->assertEquals(
            'Failed to update level.',
            $response->data['error']['message']
        );
    }
}