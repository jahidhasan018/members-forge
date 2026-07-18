<?php
/**
 * FormController Test Suite
 *
 * @package MembersForge\Tests\Unit\API
 * @since 1.0.0
 */

namespace MembersForge\Tests\Unit\API;

use Mockery;
use PHPUnit\Framework\TestCase;
use Brain\Monkey\Functions;
use MembersForge\API\Controllers\FormController;
use MembersForge\Forms\FormService;

class FormControllerTest extends TestCase {

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
    public function it_returns_all_forms(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_all_forms' )
            ->once()
            ->andReturn( [
                [ 'id' => 1, 'name' => 'Form A' ],
                [ 'id' => 2, 'name' => 'Form B' ],
            ] );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'GET', '/members-forge/v1/forms' );
        $response   = $controller->get_items( $request );

        $this->assertTrue( $response->data['success'] );
        $this->assertCount( 2, $response->data['data'] );
    }

    /** @test */
    public function it_returns_a_single_form(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )
            ->once()
            ->with( 1 )
            ->andReturn( [ 'id' => 1, 'name' => 'Registration', 'fields' => [], 'settings' => [] ] );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'GET', '/members-forge/v1/forms/1' );
        $request->set_url_params( [ 'id' => 1 ] );
        $response   = $controller->get_item( $request );

        $this->assertTrue( $response->data['success'] );
        $this->assertEquals( 'Registration', $response->data['data']['name'] );
    }

    /** @test */
    public function it_returns_404_when_form_not_found(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )->once()->with( 999 )->andReturn( null );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'GET', '/members-forge/v1/forms/999' );
        $request->set_url_params( [ 'id' => 999 ] );
        $response   = $controller->get_item( $request );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals( 404, $response->get_status() );
    }

    /** @test */
    public function it_creates_a_form_and_returns_201(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'save_form' )
            ->once()
            ->with( Mockery::type( 'array' ) )
            ->andReturn( 7 );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'POST', '/members-forge/v1/forms' );
        $request->set_body_params( [
            'name' => 'New Form',
            'type' => 'registration',
        ] );
        $response = $controller->create_item( $request );

        $this->assertTrue( $response->data['success'] );
        $this->assertEquals( 201, $response->get_status() );
        $this->assertEquals( 7, $response->data['data']['id'] );
    }

    /** @test */
    public function it_returns_400_when_create_fails(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'save_form' )->once()->andReturn( false );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'POST', '/members-forge/v1/forms' );
        $request->set_body_params( [ 'name' => '' ] );
        $response = $controller->create_item( $request );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals( 400, $response->get_status() );
    }

    /** @test */
    public function it_updates_an_existing_form(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )
            ->once()
            ->with( 1 )
            ->andReturn( [ 'id' => 1, 'name' => 'Old' ] );
        $service->shouldReceive( 'save_form' )
            ->once()
            ->with( Mockery::on( function ( $data ) {
                return isset( $data['id'] ) && $data['id'] === 1;
            } ) )
            ->andReturn( 1 );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'PUT', '/members-forge/v1/forms/1' );
        $request->set_url_params( [ 'id' => 1 ] );
        $request->set_body_params( [ 'name' => 'Updated Form' ] );
        $response = $controller->update_item( $request );

        $this->assertTrue( $response->data['success'] );
    }

    /** @test */
    public function it_returns_400_for_invalid_id_on_update(): void {
        $service  = Mockery::mock( FormService::class );
        $service->shouldNotReceive( 'get_form' );
        $service->shouldNotReceive( 'save_form' );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'PUT', '/members-forge/v1/forms/0' );
        $request->set_url_params( [ 'id' => 0 ] );
        $response = $controller->update_item( $request );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals( 400, $response->get_status() );
    }

    /** @test */
    public function it_deletes_a_form(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )->once()->with( 3 )->andReturn( [ 'id' => 3 ] );
        $service->shouldReceive( 'delete_form' )->once()->with( 3 )->andReturn( true );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'DELETE', '/members-forge/v1/forms/3' );
        $request->set_url_params( [ 'id' => 3 ] );
        $response = $controller->delete_item( $request );

        $this->assertTrue( $response->data['success'] );
        $this->assertTrue( $response->data['data']['deleted'] );
    }

    /** @test */
    public function it_returns_404_when_deleting_missing_form(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )->once()->with( 999 )->andReturn( null );
        $service->shouldNotReceive( 'delete_form' );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'DELETE', '/members-forge/v1/forms/999' );
        $request->set_url_params( [ 'id' => 999 ] );
        $response = $controller->delete_item( $request );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals( 404, $response->get_status() );
    }

    /** @test */
    public function it_returns_field_types(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_field_types' )
            ->once()
            ->andReturn( [
                [ 'type' => 'text', 'label' => 'Text', 'icon' => 'text' ],
                [ 'type' => 'email', 'label' => 'Email', 'icon' => 'email' ],
            ] );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'GET', '/members-forge/v1/field-types' );
        $response   = $controller->get_field_types( $request );

        $this->assertTrue( $response->data['success'] );
        $this->assertCount( 2, $response->data['data'] );
    }

    /** @test */
    public function it_publishes_a_form(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )->once()->with( 2 )->andReturn( [ 'id' => 2, 'status' => 'draft' ] );
        $service->shouldReceive( 'publish_form' )->once()->with( 2 )->andReturn( true );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'POST', '/members-forge/v1/forms/2/publish' );
        $request->set_url_params( [ 'id' => 2 ] );
        $response = $controller->publish_item( $request );

        $this->assertTrue( $response->data['success'] );
        $this->assertEquals( 'active', $response->data['data']['status'] );
    }

    /** @test */
    public function it_returns_404_when_publishing_missing_form(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )->once()->with( 999 )->andReturn( null );
        $service->shouldNotReceive( 'publish_form' );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'POST', '/members-forge/v1/forms/999/publish' );
        $request->set_url_params( [ 'id' => 999 ] );
        $response = $controller->publish_item( $request );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals( 404, $response->get_status() );
    }

    /** @test */
    public function it_returns_500_when_delete_fails(): void {
        $service = Mockery::mock( FormService::class );
        $service->shouldReceive( 'get_form' )->once()->with( 1 )->andReturn( [ 'id' => 1 ] );
        $service->shouldReceive( 'delete_form' )->once()->with( 1 )->andReturn( false );

        Functions\when( 'rest_ensure_response' )->returnArg();

        $controller = new FormController( $service );
        $request    = new \WP_REST_Request( 'DELETE', '/members-forge/v1/forms/1' );
        $request->set_url_params( [ 'id' => 1 ] );
        $response = $controller->delete_item( $request );

        $this->assertFalse( $response->data['success'] );
        $this->assertEquals( 500, $response->get_status() );
    }
}
