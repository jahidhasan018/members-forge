<?php
/**
 * FormService Test Suite
 *
 * @package MembersForge\Tests\Unit\Forms
 * @since 1.0.0
 */

namespace MembersForge\Tests\Unit\Forms;

use Mockery;
use PHPUnit\Framework\TestCase;
use Brain\Monkey\Functions;
use MembersForge\Forms\FieldRegistry;
use MembersForge\Forms\FormService;
use MembersForge\Forms\Actions\FormActionInterface;
use MembersForge\Interfaces\FormRepositoryInterface;

class FormServiceTest extends TestCase {

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
    public function it_returns_form_with_decoded_json_fields(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldReceive( 'get_by_id' )
            ->once()
            ->with( 1 )
            ->andReturn( [
                'id'             => 1,
                'name'           => 'Registration',
                'type'           => 'registration',
                'fields'         => '[{"id":"f1","type":"text","label":"Name"}]',
                'settings'       => '{"submit_action":"registration"}',
                'shortcode_key'  => 'reg-form-1',
                'status'         => 'active',
                'schema_version' => 1,
                'created_by'     => 1,
            ] );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $form = $service->get_form( 1 );

        $this->assertIsArray( $form );
        $this->assertEquals( 'Registration', $form['name'] );
        $this->assertIsArray( $form['fields'] );
        $this->assertEquals( 'text', $form['fields'][0]['type'] );
        $this->assertIsArray( $form['settings'] );
        $this->assertEquals( 'registration', $form['settings']['submit_action'] );
    }

    /** @test */
    public function it_returns_null_when_form_not_found(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldReceive( 'get_by_id' )->once()->with( 999 )->andReturn( null );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $this->assertNull( $service->get_form( 999 ) );
    }

    /** @test */
    public function it_creates_a_form_and_generates_shortcode_key(): void {
        global $wpdb;
        $wpdb = Mockery::mock( '\wpdb' );
        $wpdb->prefix = 'wp_';
        $wpdb->shouldReceive( 'prepare' )->once()->andReturn( "SELECT COUNT(*) FROM wp_members_forge_forms WHERE shortcode_key LIKE 'registration-form%'" );
        $wpdb->shouldReceive( 'get_var' )->once()->andReturn( 2 );

        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldReceive( 'create' )
            ->once()
            ->with( Mockery::on( function ( $data ) {
                return $data['shortcode_key'] === 'registration-form-3'
                    && $data['name'] === 'Test Form'
                    && $data['type'] === 'registration';
            } ) )
            ->andReturn( 5 );

        Functions\when( 'get_current_user_id' )->justReturn( 1 );
        Functions\when( 'sanitize_text_field' )->returnArg();
        Functions\when( 'sanitize_key' )->returnArg();
        Functions\when( 'sanitize_title' )->alias( function ( $s ) {
            return strtolower( str_replace( ' ', '-', $s ) );
        } );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $form_id = $service->save_form( [
            'name' => 'Test Form',
            'type' => 'registration',
        ] );

        $this->assertEquals( 5, $form_id );
    }

    /** @test */
    public function it_returns_false_when_name_is_empty(): void {
        $repo    = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldNotReceive( 'create' );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $this->assertFalse( $service->save_form( [ 'type' => 'login' ] ) );
    }

    /** @test */
    public function it_updates_an_existing_form(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldReceive( 'update' )
            ->once()
            ->with( 1, Mockery::on( function ( $data ) {
                return $data['name'] === 'Updated Name';
            } ) )
            ->andReturn( true );

        Functions\when( 'sanitize_text_field' )->returnArg();
        Functions\when( 'sanitize_key' )->returnArg();

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $result = $service->save_form( [
            'id'   => 1,
            'name' => 'Updated Name',
            'type' => 'registration',
        ] );

        $this->assertEquals( 1, $result );
    }

    /** @test */
    public function it_validates_field_types_against_registry(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );

        $registry = new FieldRegistry();
        $registry->register( 'text', [ 'label' => 'Text', 'icon' => 'text', 'render' => '', 'validate' => '' ] );
        $registry->register( 'email', [ 'label' => 'Email', 'icon' => 'email', 'render' => '', 'validate' => '' ] );

        $service = new FormService( $repo, $registry );

        $valid_fields   = [ [ 'type' => 'text' ], [ 'type' => 'email' ] ];
        $invalid_fields = [ [ 'type' => 'text' ], [ 'type' => 'honeypot' ] ];

        $this->assertTrue( $service->validate_field_types( $valid_fields ) );
        $this->assertFalse( $service->validate_field_types( $invalid_fields ) );
    }

    /** @test */
    public function it_returns_false_when_field_types_are_invalid(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldNotReceive( 'create' );

        Functions\when( 'get_current_user_id' )->justReturn( 1 );
        Functions\when( 'sanitize_text_field' )->returnArg();
        Functions\when( 'sanitize_key' )->returnArg();
        Functions\when( 'sanitize_title' )->returnArg();

        global $wpdb;
        $wpdb = Mockery::mock( '\wpdb' );
        $wpdb->prefix = 'wp_';
        $wpdb->shouldReceive( 'prepare' )->once()->andReturn( "SELECT COUNT(*)" );
        $wpdb->shouldReceive( 'get_var' )->once()->andReturn( 0 );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $result = $service->save_form( [
            'name'   => 'Bad Form',
            'type'   => 'registration',
            'fields' => [ [ 'type' => 'unknown_type' ] ],
        ] );

        $this->assertFalse( $result );
    }

    /** @test */
    public function it_executes_registered_actions(): void {
        $repo     = Mockery::mock( FormRepositoryInterface::class );
        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $action = Mockery::mock( FormActionInterface::class );
        $action->shouldReceive( 'execute' )->once()->with(
            Mockery::type( 'array' ),
            Mockery::type( 'array' )
        );

        $service->register_action( 'test_action', $action );

        $form = [
            'name'     => 'Test',
            'settings' => [
                'actions' => [ 'test_action' ],
            ],
        ];

        $submission = [ 'email' => 'test@example.com' ];

        Functions\expect( 'do_action' )
            ->once()->with( 'members_forge_before_form_submit', $form, $submission );

        Functions\expect( 'do_action' )
            ->once()->with( 'members_forge_after_form_submit', $form, $submission );

        $service->execute_actions( $form, $submission );
    }

    /** @test */
    public function it_publishes_a_form(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldReceive( 'update' )
            ->once()
            ->with( 1, [ 'status' => 'active' ] )
            ->andReturn( true );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $this->assertTrue( $service->publish_form( 1 ) );
    }

    /** @test */
    public function it_deletes_a_form(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );
        $repo->shouldReceive( 'delete' )->once()->with( 1 )->andReturn( true );

        $registry = new FieldRegistry();
        $service  = new FormService( $repo, $registry );

        $this->assertTrue( $service->delete_form( 1 ) );
    }

    /** @test */
    public function it_returns_field_types_from_registry(): void {
        $repo = Mockery::mock( FormRepositoryInterface::class );

        $registry = new FieldRegistry();
        $registry->register( 'text', [ 'label' => 'Text', 'icon' => 'text', 'render' => '', 'validate' => '' ] );
        $registry->register( 'email', [ 'label' => 'Email', 'icon' => 'email', 'render' => '', 'validate' => '' ] );

        $service = new FormService( $repo, $registry );

        $types = $service->get_field_types();

        $this->assertCount( 2, $types );
        $this->assertEquals( 'text', $types[0]['type'] );
        $this->assertEquals( 'Email', $types[1]['label'] );
    }
}
