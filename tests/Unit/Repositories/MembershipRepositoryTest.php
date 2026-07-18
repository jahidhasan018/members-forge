<?php
namespace MembersForge\Tests\Repositories;

use MembersForge\Interfaces\MembershipRepositoryInterface;
use MembersForge\Repositories\MembershipRepository;
use PHPUnit\Framework\TestCase;
use Brain\Monkey\Functions;
use Mockery;

class MembershipRepositoryTest extends TestCase{
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
    public function it_implements_membership_repository_interface(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        $repo = new MembershipRepository();
        $this->assertInstanceOf(MembershipRepositoryInterface::class, $repo);
    }

    /** @test */
    public function it_can_create_a_new_membership() {
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';
        $wpdb->insert_id = 1;

        Functions\when('current_time')->justReturn('2026-01-01 00:00:00');
        Functions\when('wp_cache_delete')->justReturn(true);

        $wpdb->shouldReceive('insert')
            ->once()
            ->with(
                'wp_members_forge_memberships',
                Mockery::on(function($data){
                return $data['user_id'] === 5
                    && $data['level_id'] === 2
                    && $data['status'] === 'pending';
                }),
                Mockery::type('array')
            )
            ->andReturn(1);

        $repo = new MembershipRepository();
        $id = $repo->create(5, 2, ['amount_paid' => 49.99, 'currency' => 'USD']);

        $this->assertEquals(1, $id);
    }

    /** @test */
    public function it_returns_false_when_create_fails() {
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        Functions\when('current_time')->justReturn('2026-01-01 00:00:00');

        $wpdb->shouldNotReceive('insert')->once()->andReturn(false);

        $repo = new MembershipRepository();
        $result = $repo->create(1, 1, []);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_can_get_all_memberships_for_a_user() {
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        Functions\when('wp_cache_get')->justReturn(false);
        Functions\when('wp_cache_set')->justReturn(true);

        $mock_data = [
            (object) ['id' => 1, 'user_id' => 3, 'level_id' => 1, 'status' => 'active'],
            (object) ['id' => 2, 'user_id' => 3, 'level_id' => 2, 'status' => 'expired'],
        ];

        $wpdb->shouldReceive('prepare')->once()->andReturn('SELECT ...');
        $wpdb->shouldReceive('get_results')->once()->andReturn($mock_data);

        $repo = new MembershipRepository();
        $result = $repo->get_by_user(3);

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals('active', $result[0]->status);
    }

    /** @test */
    public function it_can_get_a_membership_by_id(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        Functions\when('wp_cache_get')->justReturn(false);
        Functions\when('wp_cache_set')->justReturn(true);

        $mock = (object) ['id' => 7, 'user_id' => 3, 'level_id' => 1, 'status' => 'active'];


        $wpdb->shouldReceive('prepare')->once()->andReturn('SELECT ...');
        $wpdb->shouldReceive('get_row')->once()->andReturn($mock);

        $repo = new MembershipRepository();
        $result = $repo->get_by_id(7);

        $this->assertIsObject($result);
        $this->assertEquals(7, $result->id);
        $this->assertEquals('active', $result->status);
    }

    /** @test */
    public function it_returns_null_when_membership() {
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        Functions\when('wp_cache_get')->justReturn(false);

        $wpdb->shouldReceive('prepare')->once()->andReturn('SELECT ...');
        $wpdb->shouldReceive('get_row')->once()->andReturn(null);

        $repo = new MembershipRepository();
        $result = $repo->get_by_id(999);

        $this->assertNull($result);
    }

    /** @test */
    public function it_can_update_membership_status() {
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        Functions\when('wp_cache_delete')->justReturn(true);
        
        $wpdb->shouldReceive('update')
        ->once()
        ->with(
            'wp_members_forge_memberships',
            ['status' => 'active'],
            ['id' => 4],
            ['%s'],
            ['%d']
        )
        ->andReturn(1);

        $repo = new MembershipRepository();
        $result = $repo->update_status(4, 'active');

        $this->assertTrue($result);
    }

    /** @test */
    public function it_can_delete_a_membership() {
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->prefix = 'wp_';

        \Brain\Monkey\Functions\when('wp_cache_delete')->justReturn(true);

        $wpdb->shouldReceive('delete')
            ->once()
            ->with('wp_members_forge_memberships', ['id' => 9], ['%d'])
            ->andReturn(1);

        $repo = new MembershipRepository();
        $result = $repo->delete(9);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_can_get_all_memberships_with_user_and_level_info(){
        global $wpdb;
        $wpdb = Mockery::mock('\wpdb');
        $wpdb->users = 'wp_users';
        $wpdb->prefix = 'wp_';

        Functions\when('wp_cache_get')->justReturn(false);
        Functions\when('wp_cache_set')->justReturn(true);

        // JOIN query result — includes user and level info
        $mock_data = [
            (object) [
                'id'           => 1,
                'user_id'      => 10,
                'level_id'     => 1,
                'status'       => 'active',
                'display_name' => 'John Doe',
                'user_email'   => 'john@example.com',
                'level_name'   => 'Gold Plan',
            ],
            (object) [
                'id'           => 2,
                'user_id'      => 11,
                'level_id'     => 2,
                'status'       => 'expired',
                'display_name' => 'Jane Smith',
                'user_email'   => 'jane@example.com',
                'level_name'   => 'Silver Plan',
            ],
        ];

        // get_results will be called once for JOIN query
        $wpdb->shouldReceive('get_results')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($mock_data);

        $repo =  new MembershipRepository();
        $result = $repo->get_all();

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals('John Doe', $result[0]->display_name);
        $this->assertEquals('Gold Plan', $result[0]->level_name);
    }
}
