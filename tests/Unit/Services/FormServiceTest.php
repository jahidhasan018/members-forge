<?php
namespace Tests\Unit\API\Services;

use MembersForge\Interfaces\FormRepositoryInterface;
use MembersForge\Services\FormService;
use PHPUnit\Framework\TestCase;
use Mockery;
use  Brain\Monkey;

class FormServiceTest extends TestCase{

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
    public function it_returns_all_forms_with_decoded_fields_and_settings() {
        $repository = Mockery::mock(FormRepositoryInterface::class);

        $repository->shouldReceive('get_all')
            ->once()
            ->andReturn([
                [
                    'id'       => 1,
                    'name'     => 'Registration Form',
                    'fields'   => '{"email":"text","password":"password"}',
                    'settings' => '{"submit_label":"Register"}',
                ],
                [
                    'id'       => 2,
                    'name'     => 'Login Form',
                    'fields'   => '{"username":"text"}',
                    'settings' => '{"theme":"dark"}',
                ],
            ]);
        
        $service = new FormService( $repository );

        $forms  = $service->get_all_forms();

        $this->assertCount(2, $forms );

        $this->assertIsArray($forms[0]['fields']);
        $this->assertIsArray($forms[0]['settings']);
        $this->assertSame('text', $forms[0]['fields']['email']);
        $this->assertSame('Register', $forms[0]['settings']['submit_label']);
        
        // Second form assertions
        $this->assertIsArray($forms[1]['fields']);
        $this->assertIsArray($forms[1]['settings']);

        $this->assertSame(
            'text',
            $forms[1]['fields']['username']
        );

        $this->assertSame(
            'dark',
            $forms[1]['settings']['theme']
        );
    }

    /** @test */
    public function it_returns_single_form_by_id_with_normalized_shape(){
        $repository = Mockery::mock(FormRepositoryInterface::class);

        $repository->shouldReceive('get_by_id')
            ->once()
            ->with(1)
            ->andReturn([
                    'id'       => 1,
                    'name'     => 'Registration Form',
                    'fields'   => '{"email":"text","password":"password"}',
                    'settings' => '{"submit_label":"Register"}',
                ]);

        $service = new FormService( $repository );
        $form = $service->get_form_by_id(1);

        $this->assertIsArray($form);
    }

    /** @test */
    public function it_returns_null_when_form_not_found(){
        $repo = Mockery::mock(FormRepositoryInterface::class);

        $repo->shouldReceive('get_by_id')
            ->once()
            ->with(999)
            ->andReturn(null);
        
        $service = new FormService($repo);
        $form = $service->get_form_by_id(999);

        $this->assertNull($form);
    }

    /** @test */
    public function it_validates_required_form_payload_fields(){
        
        $repo = Mockery::mock(FormRepositoryInterface::class);

        $service = new FormService( $repo );

        $result = $service->validate_form_payload([
            'name' => '',
            'type' => '',
            'shortcode_key' => '',
            'fields' => 'not-an-array',
            'settings' => 'not-an-array',
        ]);

        $this->assertIsArray( $result );
        $this->assertFalse( $result['valid'] );
        $this->assertCount( 5, $result['errors'] );
    }
}