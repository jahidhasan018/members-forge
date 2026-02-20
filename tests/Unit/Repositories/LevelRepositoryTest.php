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
        Functions\when('wp_parse_args')->returnArg(1);
        Functions\when('wp_parse_args')->alias(function($args, $defaults) {
            return array_merge($defaults, $args);
        });
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 1;  // Mock the insert_id property that wpdb sets after insert
        
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

        $wpdb->shouldReceive('update')
            ->once()
            ->andReturn(false);
        
        $repo = new LevelRepository();
        $result = $repo->update(999, [
            'name' => 'Invalid Plan'
        ]);

        $this->assertFalse($result);
    }
}