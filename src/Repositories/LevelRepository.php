<?php
namespace MembersForge\Repositories;

use MembersForge\Interfaces\LevelRepositoryInterface;

class LevelRepository implements LevelRepositoryInterface {
    private $table;

    private $cache_group;

    public function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'members_forge_levels';
        $this->cache_group = 'members_forge';
    }

    /**
     * Create a level
     * @param array 
     * @return int|false
     */
    public function create( array $data ): int|false{
        global $wpdb;

        $defaults = [
            'status'     => 'active',
            'created_at' => current_time( 'mysql' ),
            'priority'   => 0
        ];

        $item = wp_parse_args( $data, $defaults );

        $item['slug'] = $this->generate_unique_slug( $item['name'] ?? '' );

        $format = $this->get_format( $item );

        $result = $wpdb->insert( $this->table, $item, $format );

        // Inserted item id
        if ( $result ) {
            wp_cache_delete('members_forge_levels_all', $this->cache_group);
            do_action('members_forge_level_created', $wpdb->insert_id, $item);

            return $wpdb->insert_id;
        }

        return false;

    }

    // Return type added to match interface
    public function get_levels(): array{
        $cache_key = 'members_forge_levels_all';

        // Cache Check
        $cached = wp_cache_get( $cache_key, $this->cache_group );
        if( $cached !== false ){
            return $cached;
        }

        global $wpdb;
        $sql = "SELECT * FROM {$this->table} ORDER BY priority DESC, id ASC";
        $levels = $wpdb->get_results($sql);

        // 2. Filter: অন্য plugin levels array modify করতে পারবে
        $levels = apply_filters('members_forge_levels', $levels);

        // Store cache for 1 hour
        wp_cache_set( $cache_key, $levels, $this->cache_group, HOUR_IN_SECONDS );

        return $levels;
    }

    /**
     * Update an existing level
     * 
     * @param int $id Level ID to update
     * @param array $data Updated data
     * @return bool True on success, false on failure
     */
    public function update( int $id, array $data ): bool {
        $data = apply_filters('members_forge_pre_update_level', $data, $id );

        global $wpdb;
        $result = false;

        $format = $this->get_format($data);
        if( !empty($id) && is_array($format) && !empty($format) ){
            $result  = $wpdb->update( $this->table, $data, ['id' => $id], $format, ['%d'] );
        }

        if( $result !== false ){
            wp_cache_delete('members_forge_levels_all', $this->cache_group);
            wp_cache_delete("members_forge_level_{$id}", $this->cache_group);

            do_action( 'members_forge_level_updated', $id, $data );
        }
        
        return $result !== false;
    }

    /**
     * Get a level by Id
     * @param int $id Level I
     * @return mixed
     */
    public function get_by_id(int $id){
        $cache_key = "members_forge_level_{$id}";
        $cached = wp_cache_get($cache_key, $this->cache_group);
        if( $cached !== false ){
            return $cached;
        }

        global $wpdb;

        // Use prepare to SQL injection safe
        $sql = $wpdb->prepare(
            "SELECT * FROM {$this->table} WHERE id = %d LIMIT 1",
            $id
        );
        $level = $wpdb->get_row($sql);

        if( $level ){
            $level = apply_filters('members_forge_level', $level, $id);
            wp_cache_set($cache_key, $level, $this->cache_group);
        }

        return $level;
    }

    /**
     * Delete a level by ID
     * @param int $id Level ID
     * @return bool
     */
    public function delete(int $id): bool {
        do_action('members_forge_before_level_deleted', $id);

        global $wpdb;
        // id ভিত্তিক delete, format %d মানে integer binding
        $resutl = $wpdb->delete(
            $this->table,
            ['id' => $id],
            ['%d']
        );

        if( $resutl !== false ){
            wp_cache_delete('members_forge_levels_all', 'members_forge');
            wp_cache_delete("members_forge_level_{$id}", 'members_forge');

            do_action('members_forge_level_deleted', $id);
        }

        // wpdb false দিলে query fail, অন্যথায় success হিসেবে true
        return $resutl !== false;
    }

    /**
     * %s = string, %d = integer, %f = float
     */
    private function get_format( $data ) {
        $format = [];
        foreach ( $data as $value ) {
            if ( is_int( $value ) ) {
                $format[] = '%d';
            } elseif ( is_float( $value ) ) {
                $format[] = '%f';
            } else {
                $format[] = '%s';
            }
        }
        return $format;
    }

    /**
     * Generate a unique slug from level name
     * যদি একই slug আগে থেকে থাকে, তাহলে -2, -3 suffix যোগ করবে
     */
    private function generate_unique_slug( string $name ): string {
        global $wpdb;

        // base slug:: "Gold Plan" => "gold-plan"
        $base_slug = sanitize_title( $name );

        // If name empty then fallback slug
        if( empty( $base_slug ) ){
            $base_slug = 'level';
        }

        $slug = $base_slug;
        $counter = 2;

        // যতক্ষণ current slug already exists, ততক্ষণ নতুন suffix দিয়ে retry
        while ( $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM {$this->table} WHERE slug = %s LIMIT 1",
                $slug
            )
        ) ) {
            $slug = $base_slug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}