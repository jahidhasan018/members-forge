<?php
namespace MembersForge\Tests\Repositories;

use PHPUnit\Framework\TestCase;
use MembersForge\Repositories\LevelRepository;
use MembersForge\Interfaces\LevelRepositoryInterface;
use Mockery;
use Brain\Monkey\Functions;

class LevelRepositoryTest extends TestCase {

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
    public function it_implements_level_repository_interface(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $repository = new LevelRepository();
        $this->assertInstanceOf( LevelRepositoryInterface::class, $repository );
    }

    /** @test */
    public function it_can_create_a_new_level(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        Functions\when('wp_cache_delete')->justReturn(true);
        Functions\when('wp_parse_args')->alias(function($args, $defaults) {
            return array_merge($defaults, $args);
        });
        Functions\when('sanitize_title')->alias(function($title) {
            return strtolower(str_replace(' ', '-', $title));
        });
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 1;  // Mock the insert_id property that wpdb sets after insert
        
         $wpdb->shouldReceive('prepare')
        ->once()
        ->with(
            "SELECT id FROM wp_members_forge_levels WHERE slug = %s LIMIT 1",
            'gold-plan'
        )
        ->andReturn("SELECT id FROM wp_members_forge_levels WHERE slug = 'gold-plan' LIMIT 1");

        $wpdb->shouldReceive('get_var')
        ->once()
        ->andReturn(null);

        $wpdb->shouldReceive('insert')
            ->once()
            ->with(
                'wp_members_forge_levels', 
                Mockery::type('array'), 
                Mockery::type('array')
            )->andReturn(1);
        
        $repo = new LevelRepository();

        $level_id = $repo->create([
            'name' => 'Gold Plan',
            'price' => 100
        ]);

        $this->assertEquals(1, $level_id);        
    }

    /** @test */
    public function it_can_fetch_all_levels(){
        global $wpdb;
        Functions\when('wp_cache_get')->justReturn(false);
        Functions\when('wp_cache_set')->justReturn(true);
        Functions\when('apply_filters')->alias(function($hook, $value) { return $value; });
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $mock_levels = [
            (object) ['id' => 1, 'name' => 'Gold', 'price' => 100],
            (object) ['id' => 2, 'name' => 'Silver', 'price' => 50],
        ];

        $wpdb->shouldReceive('get_results')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($mock_levels);

        $repo = new LevelRepository();
        $levels = $repo->get_levels();

        $this->assertIsArray($levels);
        $this->assertCount(2, $levels);
        $this->assertEquals('Gold', $levels[0]->name);
    }

    /** @test */
    public function it_can_update_an_existing_level(){
        global $wpdb;
        Functions\when('wp_cache_delete')->justReturn(true);
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('update')
            ->once()
            ->with(
                'wp_members_forge_levels',
                Mockery::type('array'),
                Mockery::type('array'),
                Mockery::type('array'),
                Mockery::type('array')
            )->andReturn(1);

        $repo = new LevelRepository();

        $result = $repo->update(1, [
            'name' => 'Platinum Plan',
            'price' => 200
        ]);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_returns_false_when_update_fails(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';
        $wpdb->last_error = 'Update failed';

        $wpdb->shouldReceive('update')
            ->once()
            ->andReturn(false);
        
        $repo = new LevelRepository();
        $result = $repo->update(999, [
            'name' => 'Invalid Plan'
        ]);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_can_get_a_single_level_by_id(){
        global $wpdb;
        Functions\when('wp_cache_get')->justReturn(false);
        Functions\when('wp_cache_set')->justReturn(true);
        Functions\when('apply_filters')->alias(function($hook, $value) { return $value; });
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = "wp_";

        $mock_level = (object) [
            'id'    => 3,
            'name'  => 'Gold',
            'price' => 99.00
        ];

        $wpdb->shouldReceive('get_row')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($mock_level);

        $wpdb->shouldReceive('prepare')
            ->once()
            ->with(
                "SELECT * FROM wp_members_forge_levels WHERE id = %d LIMIT 1",
                3
            )
            ->andReturn("SELECT * FROM wp_members_forge_levels WHERE id = 3 LIMIT 1");


        $repo = new LevelRepository();
        $level = $repo->get_by_id(3);

        $this->assertIsObject($level);
        $this->assertEquals(3, $level->id);
        $this->assertEquals('Gold', $level->name);
    }

    /** @test */
    public function it_can_delete_an_existing_level(){
        global $wpdb;
        Functions\when('wp_cache_delete')->justReturn(true);
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('delete')
            ->once()
            ->with(
                'wp_members_forge_levels',
                ['id' => 3],
                ['%d']
            )
            ->andReturn(1);

        $repo = new LevelRepository();
        $result = $repo->delete(3);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_can_return_false_when_delete_fails(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('delete')
            ->once()
            ->andReturn(false);

        $repo = new LevelRepository();
        $result = $repo->delete(999);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_treats_update_zero_afffected_rows_as_success(){
        global $wpdb;
        Functions\when('wp_cache_delete')->justReturn(true);
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $wpdb->shouldReceive('update')
            ->once()
            ->with(
                'wp_members_forge_levels',
                Mockery::type('array'),
                ['id' => 1],
                Mockery::type('array'),
                ['%d']
            )
            ->andReturn(0);
        
        $repo = new LevelRepository();

        $result = $repo->update(1, [
            'name'  => 'Same Name'
        ]);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_auto_generates_slug_from_name_on_create(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        Functions\when('wp_cache_delete')->justReturn(true);
        Functions\when('wp_parse_args')->alias(function($args, $defaults) {
            return array_merge($defaults, $args);
        });
        // Wordpress sanitize_title function moc
        Functions\when('sanitize_title')->alias(function($title) {
            return strtolower(str_replace(' ', '-', $title));
        });

        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 5;

        $wpdb->shouldReceive('prepare')
        ->once()
        ->with(
            "SELECT id FROM wp_members_forge_levels WHERE slug = %s LIMIT 1",
            'gold-plan'
        )
        ->andReturn("SELECT id FROM wp_members_forge_levels WHERE slug = 'gold-plan' LIMIT 1");

        // Slug uniqueness check
        $wpdb->shouldReceive('get_var')
            ->once()
            ->andReturn(null);
        
        $wpdb->shouldReceive('insert')
            ->once()
            ->with(
                'wp_members_forge_levels',
                Mockery::on(function($data) {
                // Insert data তে slug থাকা উচিত এবং name থেকে generate হওয়া উচিত
                    return isset($data['slug']) && $data['slug'] === 'gold-plan';
                }),
                Mockery::type('array')
            )
            ->andReturn(1);
        
        $repo = new LevelRepository();
        $id = $repo->create(['name' => 'Gold Plan', 'price' => 50]);

        $this->assertEquals(5, $id);
    }

    /** @test */
    public function it_appends_suffix_when_slug_already_exists(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        Functions\when('current_time')->justReturn('2026-02-05 12:00:00');
        Functions\when('wp_cache_delete')->justReturn(true);
        Functions\when('wp_parse_args')->alias(function($args, $defaults) {
            return array_merge($defaults, $args);
        });
        Functions\when('sanitize_title')->alias(function($title) {
            return strtolower(str_replace(' ', '-', $title));
        });
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 6;

        
        $wpdb->shouldReceive('prepare')
            ->twice()
            ->andReturn(
                "SELECT id FROM wp_members_forge_levels WHERE slug = 'gold-plan' LIMIT 1",
                "SELECT id FROM wp_members_forge_levels WHERE slug = 'gold-plan-2' LIMIT 1"
            );

        // First check: 'gold-plan' exists
        // Second check: 'gold-plan-2' does not exist
        $wpdb->shouldReceive('get_var')
            ->twice()
            ->andReturn('1', null);

        $wpdb->shouldReceive('insert')
        ->once()
        ->with(
            'wp_members_forge_levels',
            Mockery::on(function($data) {
                // Duplicate হলে -2 suffix আসা উচিত
                return isset($data['slug']) && $data['slug'] === 'gold-plan-2';
            }),
            Mockery::type('array')
        )
        ->andReturn(1);

        $repo = new LevelRepository();
        $id = $repo->create(['name' => 'Gold Plan', 'price' => 50]);

        $this->assertEquals(6, $id);
    }

    /** @test */
    public function it_invalidates_cache_and_fires_action_on_create() {
        Functions\when('wp_parse_args')->alias(function($a, $b){ return array_merge($b, $a);});
        Functions\when('current_time')->justReturn('2026-01-01 00:00:00');
        Functions\when('sanitize_title')->returnArg();
        Functions\when('wp_cache_get')->justReturn(false);

        // Cache delete
        Functions\expect('wp_cache_delete')
            ->once()
            ->with('members_forge_levels_all', 'members_forge');

        // Action fire $id, $data
        \Brain\Monkey\Actions\expectDone('members_forge_level_created')
            ->once();

         $wpdb = Mockery::mock('wpdb');
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 5;
        $wpdb->shouldReceive('get_var')->andReturn(null); // slug unique
        $wpdb->shouldReceive('prepare')->andReturnArg(0);
        $wpdb->shouldReceive('insert')->andReturn(1);

        $GLOBALS['wpdb'] = $wpdb;
         $repo = new LevelRepository();
        $result = $repo->create(['name' => 'Gold']);

        $this->assertEquals(5, $result);
    }

    /** @test */
    public function it_returns_cached_levels_without_db_query() {
        $cached_levels = [
            (object) ['id' => 1, 'name' => 'Silver'],
        ];

        // Cache hit simulate
        Functions\when('wp_cache_get')
            ->justReturn($cached_levels);

        $wpdb = Mockery::mock('wpdb');
        $wpdb->prefix = 'wp_';
        // DB query হওয়া উচিত না
        $wpdb->shouldNotReceive('get_results');
        $GLOBALS['wpdb'] = $wpdb;

        $repo = new LevelRepository();
        $result = $repo->get_levels();

        $this->assertCount(1, $result);
        $this->assertEquals('Silver', $result[0]->name);
    }

    /** @test */
    public function it_fires_deleted_action_with_id_on_delete() {
        Functions\when('wp_cache_delete')->justReturn(true);

        // $id সহ action fire হওয়া উচিত
        \Brain\Monkey\Actions\expectDone('members_forge_level_deleted')
            ->once()
            ->with(7);

        \Brain\Monkey\Actions\expectDone('members_forge_before_level_deleted')
            ->once()
            ->with(7);

        $wpdb = Mockery::mock('wpdb');
        $wpdb->prefix = 'wp_';
        $wpdb->shouldReceive('delete')->andReturn(1);
        $GLOBALS['wpdb'] = $wpdb;

        $repo = new LevelRepository();
        $result = $repo->delete(7);

        $this->assertTrue($result);
    }
}