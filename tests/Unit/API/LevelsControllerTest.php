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
}