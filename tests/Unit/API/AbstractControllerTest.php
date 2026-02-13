<?php
namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;
use MembersForge\API\AbstractController;
use MembersForge\Interfaces\ControllerInterface;

/**
 * Concrete implementation for testing abstract class
 */
class TestableController extends AbstractController{

}

class AbstractControllerTest extends TestCase{

    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }
    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
    public function it_implements_controller_interface() {
        $controller = new TestableController();

        $this->assertInstanceOf( ControllerInterface::class, $controller );
    }

    /** @test */
    public function success_response_returns_correct_format() {
        // Mock WP_REST_Response since we're in unit test
        $controller = new TestableController();
        $response = $controller->success_response(['name' => 'Gold Plan'], 200);

        $this->assertTrue( $response->data['success'] );
        $this->assertEquals( ['name' => 'Gold Plan'], $response->data['data'] );
    }

    /** @test */
    public function error_response_returns_correct_format(){

        $controller = new TestableController();
        $response = $controller->error_response( 'Not found', 404 );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals('Not found', $response->data['error']['message']);
    }

        /** @test */
    public function paginated_response_returns_correct_format() {
        $controller = new TestableController();
        $items = [
            ['id' => 1, 'name' => 'Gold'],
            ['id' => 2, 'name' => 'Silver'],
        ];
        
        $response = $controller->paginated_response( $items, 50, 1, 10 );
        
        $this->assertTrue( $response->data['success'] );
        $this->assertCount( 2, $response->data['data'] );
        $this->assertEquals( 50, $response->data['meta']['total'] );
        $this->assertEquals( 5, $response->data['meta']['total_pages'] );
    }
}