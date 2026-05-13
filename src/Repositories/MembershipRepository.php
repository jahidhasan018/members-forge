<?php
namespace MembersForge\Repositories;
use MembersForge\Interfaces\MembershipRepositoryInterface;
class MembershipRepository implements MembershipRepositoryInterface{
    
    private $table;
    private $cache_group = 'members_forge';

    public function __construct(){
        global $wpdb;
        $this->table = $wpdb->prefix . 'members_forge_memberships';
    }

    /**
     * Create a membership for a user
     *
     * @param int $user_id
     * @param int $level_id
     * @param array $data
     * @return int|false
     */
    public function create(int $user_id, int $level_id, array $data): int|false{
        global $wpdb;

        $defaults = [
            'status'        => 'pending',
            'created_at'    => current_time('mysql')
        ];

        $item = array_merge( $defaults, $data, [
            'user_id'   => $user_id,
            'level_id'  => $level_id
        ]);

        $result = $wpdb->insert( $this->table, $item, $this->get_format($item));

        if( $result ){
            wp_cache_delete( "members_forge_user_memberships_{$user_id}", $this->cache_group );
            do_action('members_forge_membership_created', $wpdb->insert_id, $item);
            return $wpdb->insert_id;
        }

        return false;
    }

    /**
     * Get membership by membership id
     * @param int $id
     * @return object
     */
    public function get_by_id(int $id): object|null {
        $cache_key = "members_forge_membership_{$id}";
        $cached = wp_cache_get($cache_key, $this->cache_group );
        if( $cached !== false ){
            return $cached;
        }

        global $wpdb;
        $sql = $wpdb->prepare(
            "SELECT * FROM {$this->table} WHERE id = %d LIMIT 1",
            $id
        );

        $result = $wpdb->get_row($sql);
        if( $result ){
            wp_cache_set($cache_key, $result, $this->cache_group, HOUR_IN_SECONDS );
        }

        return $result;
    }

    /**
     * Summary of get_by_user
     * @param int $user_id
     * @return array
     */
    public function get_by_user(int $user_id): array {
        $cache_key = "members_forge_user_memberships_{$user_id}";
        $cached = wp_cache_get( $cache_key, $this->cache_group );
        if( $cached !== false ){
            return $cached;
        }

        global $wpdb;
        $sql = $wpdb->prepare(
            "SELECT * FROM {$this->table} WHERE user_id = %d ORDER BY ID DESC",
            $user_id
        );

        $result = $wpdb->get_results($sql);

        if( $result ){
            wp_cache_set( $cache_key, $result, $this->cache_group, HOUR_IN_SECONDS );
        }

        return $result;
    }

    /**
     * Update status of a user membership
     * @param int $id
     * @param string $status [pending, active, ...]
     * @return bool
     */
    public function update_status(int $id, string $status): bool {
        global $wpdb;

        $result = $wpdb->update(
            $this->table,
            ['status' => $status],
            ['id'     => $id],
            ['%s'],
            ['%d']
        );

        if($result !== false){
            wp_cache_delete("members_forge_membership_{$id}", $this->cache_group );
            do_action('members_forge_membership_status_updated', $id, $status );
        }

        return $result !== false;
    }

    /**
     * Delete a membership by $d
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool {
        do_action('members_forge_before_membership_deleted', $id);
        global $wpdb;
        $result = $wpdb->delete($this->table, ['id' => $id], ['%d']);

        if( $result !== false ){
            wp_cache_delete( "members_forge_membership_{$id}", $this->cache_group );
            do_action('members_forge_membership_deleted', $id);
        }

        return $result !== false;
    }

    /**
     * Get all memberships with user and level info (JOIN) for full members list
     * @return array
     */
    public function get_all(): array {
        $cache_key = "members_forge_all_memberships";
        $cached = wp_cache_get( $cache_key, $this->cache_group );
        if( $cached !== false ){
            return $cached;
        }

        global $wpdb;

        $levels_table = $wpdb->prefix . 'members_forge_levels';
        $sql = "
            SELECT
                m.*,
                u.display_name,
                u.user_email,
                l.name AS level_name
            FROM {$this->table} AS m
            INNER JOIN {$wpdb->users} AS u ON m.user_id = u.ID
            INNER JOIN {$levels_table} AS l ON m.level_id = l.id
            ORDER BY m.id DESC
        ";

        $results = $wpdb->get_results($sql);

        wp_cache_set( $cache_key, $results, $this->cache_group, HOUR_IN_SECONDS );

        return $results ?: [];
    }

    /**
     * Format the items value
     * @param array $data
     * @return string[]
     */
    private function get_format( array $data ){
        $format = [];
        foreach ($data as $value) {
            if (is_int($value))         $format[] = '%d';
            elseif (is_float($value))   $format[] = '%f';
            else                        $format[] = '%s';
        }
        return $format;
    }
}