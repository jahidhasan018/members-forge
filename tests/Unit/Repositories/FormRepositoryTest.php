<?php
namespace MembersForge\Tests\Unit\Repositories;

use Brain\Monkey\Functions;
use MembersForge\Repositories\FormRepository;
use Mockery;
use PHPUnit\Framework\TestCase;
use function PHPUnit\Framework\once;

class FormRepositoryTest extends TestCase {

    private const ARRAY_OUTPUT = 'ARRAY_A';

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
    public function it_returns_all_forms() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';
        
        $form_fields = $this->get_form_fields();

        $wpdb->shouldReceive('get_results')
            ->once()
            ->with(Mockery::type('string'), self::ARRAY_OUTPUT)
            ->andReturn($form_fields);
        
        $repo = new FormRepository($wpdb);
        $response = $repo->get_all();

        $this->assertCount( 2, $response );
    }

    /** @test */
    public function it_returns_form_by_id() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $form_fields = $this->get_form_fields()[0];

        $sql = "SELECT * FROM {$wpdb->prefix }members_forge_forms WHERE id = 1";

        $wpdb->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'), 1)
            ->andReturn($sql);

        $wpdb->shouldReceive('get_row')
            ->once()
            ->with($sql, self::ARRAY_OUTPUT)
            ->andReturnUsing(function() use ($form_fields) {
                return $form_fields;
            });

        $repo = new FormRepository($wpdb);
        $response = $repo->get_by_id(1);

        $this->assertEquals(1, $response['id']);
        $this->assertEquals('Registration Form', $response['name']);
        $this->assertEquals('registration', $response['type']);
    }

    /** @test */
    public function it_returns_null_when_form_not_found_by_id() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $sql = "SELECT * FROM {$wpdb->prefix}members_forge_forms WHERE id = 1";

        $wpdb->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'), 1)
            ->andReturn($sql);
        
        $wpdb->shouldReceive('get_row')
            ->once()
            ->with($sql, self::ARRAY_OUTPUT)
            ->andReturn(null);
        
        $repo = new FormRepository($wpdb);
        $response = $repo->get_by_id(1);

        $this->assertNull($response);
    }

    /** @test */
    public function it_returns_form_by_shortcode_key() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $form_fields = $this->get_form_fields()[0];

        $sql = "SELECT * FROM {$wpdb->prefix }members_forge_forms WHERE shortcode_key = 'registration-form-1'";

        $wpdb->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'), 'registration-form-1')
            ->andReturn($sql);

        $wpdb->shouldReceive('get_row')
            ->once()
            ->with($sql, self::ARRAY_OUTPUT)
            ->andReturnUsing(function() use ($form_fields) {
                return $form_fields;
            });
        
        $repo = new FormRepository($wpdb);
        $response = $repo->get_by_key('registration-form-1');

        $this->assertEquals('registration-form-1', $response['shortcode_key']);
    }

    /** @test */
    public function it_creates_a_form_and_return_id() {
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 3;
        
        $data = [
            'name' => 'Checkout Form',
            'type' => 'checkout',
            'schema_version' => 1,
            'shortcode_key' => 'checkout-form-1',
            'created_at'      => '2026-02-05 12:00:00',
            'updated_at'      => '2026-02-05 12:00:00',
        ];

        $wpdb->shouldReceive('insert')
            ->once()
            ->with(
                'wp_members_forge_forms',    
                $data,
                ['%s', '%s', '%d', '%s', '%s', '%s'])
            ->andReturn(true);

        $repo = new FormRepository($wpdb);
        $response = $repo->create($data);
        
        $this->assertEquals(3, $response);
    }

    /** @test */
    public function it_returns_false_when_create_fails() {
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 0;

        $wpdb->shouldReceive('insert')
            ->once()
            ->with('wp_members_forge_forms', [
                    'created_at'      => '2026-02-05 12:00:00',
                    'updated_at'      => '2026-02-05 12:00:00',
                ], ['%s', '%s'])
            ->andReturn(false);

        $repo = new FormRepository($wpdb);
        $response = $repo->create([]);

        $this->assertFalse($response);
    }

    /** @test */
    public function it_updates_a_form() {
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb->prefix = 'wp_';

        $data = [
            'name' => 'Registration',
            'type' => 'registration',
            'schema_version' => 2,
            'updated_at'      => '2026-02-05 12:00:00',
        ];

        $wpdb->shouldReceive('update')
            ->once()
            ->with(
                'wp_members_forge_forms',
                $data,
                ['id' => 1],
                ['%s', '%s', '%d', '%s'],
                ['%d']
                )
            ->andReturn(1);

        $repo = new FormRepository($wpdb);
        $response = $repo->update(1, $data);

        $this->assertTrue($response);
    }

    /** @test */
    public function it_treats_zero_updated_rows_as_success() {
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('update')
            ->once()
            ->with(
                'wp_members_forge_forms',
                ['name' => 'Registration', 'updated_at' => '2026-02-05 12:00:00'],
                ['id' => 1],
                ['%s', '%s'],
                ['%d']
            )
            ->andReturn(0);

        $repo = new FormRepository($wpdb);

        $this->assertTrue($repo->update(1, ['name' => 'Registration']));
    }

    /** @test */
    public function it_deletes_a_form() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('delete')
            ->once()
            ->with(
                'wp_members_forge_forms',
                ['id'=> 1],
                ['%d']
            )
            ->andReturn(1);

        $repo = new FormRepository($wpdb);
        $response = $repo->delete(1);

        $this->assertTrue($response);
    }

    /** @test */
    public function it_treats_zero_deleted_rows_as_success() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('delete')
            ->once()
            ->with(
                'wp_members_forge_forms',
                ['id'=> 1],
                ['%d']
            )
            ->andReturn(0);

        $repo = new FormRepository($wpdb);

        $this->assertTrue($repo->delete(1));
    }

    /** @test */
    public function it_implements_form_repository_interface() {
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $repository = new FormRepository($wpdb);

        $this->assertInstanceOf(\MembersForge\Interfaces\FormRepositoryInterface::class, $repository);
    }

    /** @test */
    public function create_fails_even_with_stale_insert_id() {
        $wpdb = Mockery::mock( '\wpdb' );
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 999;
        
        $wpdb->shouldReceive('insert')
            ->once()
            ->andReturn(false);
        
        $repo = new FormRepository( $wpdb );
        $response = $repo->create([
            'name' => 'Checkout Form',
            'type' => 'checkout',
        ]);

        $this->assertFalse($response);
    }

    /** @test */
    public function fields_settings_are_json_encoded_when_create() {
        $wpdb = Mockery::mock( '\wpdb' );
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 1;

        $data = $this->get_form_fields();
        $expected = $this->to_db_payload($data)[0];

        $wpdb->shouldReceive('insert')
            ->once()
            ->withArgs(function ($table, $data, $format) {

                if ($table !== 'wp_members_forge_forms') {
                    return false;
                }

                // check important fields only
                return
                    $data['name'] === 'Registration Form' &&
                    $data['type'] === 'registration' &&
                    is_string($data['fields']) &&
                    is_string($data['settings']) &&
                    json_decode($data['fields'], true)[0]['id'] === 'field_1';
            })
            ->andReturn(1);

        $repo = new FormRepository( $wpdb );
        $response = $repo->create( $data[0] );

        $this->assertIsString($expected['fields']);
        $this->assertJson($expected['fields']);
        $decoded = json_decode($expected['fields'], true);
        $this->assertSame( 'text', $decoded[0]['type'] );
    }

    /** @test */
    public function it_adds_updated_at_when_updating_form(): void
    {
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb = Mockery::mock( '\wpdb' );
        $wpdb->prefix = 'wp_';

        $formId = 1;

        $input = [
            'name' => 'Updated Form',
            'type' => 'registration',
            'fields' => [
                [
                    'id' => 'field_1',
                    'type' => 'text',
                    'label' => 'First Name',
                    'name' => 'first_name',
                    'required' => true,
                ],
            ],
            'settings' => [
                'submit_action' => 'email',
            ],
        ];

        $wpdb->shouldReceive('update')
            ->once()
            ->withArgs(function ($table, $data, $where, $format, $whereFormat) use ($formId) {
                // table check
                if ($table !== 'wp_members_forge_forms') {
                    return false;
                }

                // must contain updated_at added by repository
                if (!isset($data['updated_at'])) {
                    return false;
                }

                // ensure it's a valid datetime string
                if (!is_string($data['updated_at'])) {
                    return false;
                }

                // business assertions
                if ($data['name'] !== 'Updated Form') {
                    return false;
                }

                // JSON encoding validation
                $fields = json_decode($data['fields'], true);
                if ($fields[0]['type'] !== 'text') {
                    return false;
                }

                // where clause check
                if ($where !== ['id' => $formId]) {
                    return false;
                }

                return true;
            })
            ->andReturn(1);

        $repository = new FormRepository($wpdb);

        $data = $repository->update($formId, $input);

        $this->assertEquals(true, $data);
    }

    /** @test */
    public function it_filters_out_unknown_keys_when_creating_form(): void
    {
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        $wpdb = Mockery::mock( '\wpdb' );
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 1;

        $data = [
            'name' => 'Form A',
            'type' => 'registration',
            'hack' => 'x', // should be removed
        ];

        $wpdb->shouldReceive('insert')
            ->once()
            ->withArgs(function ($table, $data) {

                if ($table !== 'wp_members_forge_forms') {
                    return false;
                }

                // must not contain unknown key
                if (isset($data['hack'])) {
                    return false;
                }

                // must still contain valid data
                return $data['name'] === 'Form A'
                    && $data['type'] === 'registration';
            })
            ->andReturn(1);

        $repository = new FormRepository($wpdb);

        $response = $repository->create($data);
        $this->assertEquals(1, $response);
    }

    // Get form fields
    protected function get_form_fields() {
        return [
            [
                'id' => 1,
                'name' => 'Registration Form',
                'type' => 'registration',
                'fields' => [
                    [
                        'id' => 'field_1',
                        'type' => 'text',
                        'label' => 'First Name',
                        'name' => 'first_name',
                        'required' => true,
                    ],
                ],
                'settings' => [
                    'submit_action' => 'email',
                ],
                'shortcode_key' => 'registration-form-1',
                'status' => 'active',
                'schema_version' => 1,
                'created_by' => 1,
                'created_at' => '2026-05-15 10:00:00',
                'updated_at' => '2026-05-15 10:00:00',
            ],
            [
                'id' => 2,
                'name' => 'Login Form',
                'type' => 'login',
                'fields' => [
                    [
                        'id' => 'field_1',
                        'type' => 'text',
                        'label' => 'Username',
                        'name' => 'username',
                        'required' => true,
                    ],
                ],
                'settings' => [
                    'submit_action' => 'login',
                ],
                'shortcode_key' => 'login-form-1',
                'status' => 'draft',
                'schema_version' => 1,
                'created_by' => 1,
                'created_at' => '2026-05-15 10:10:00',
                'updated_at' => '2026-05-15 10:10:00',
            ],
        ];
    }

    protected function to_db_payload(array $forms): array {
        
        return array_map(function ($form) {
            $form['fields'] = json_encode($form['fields']);
            $form['settings'] = json_encode($form['settings']);

            return $form;
        }, $forms);
    }
}
