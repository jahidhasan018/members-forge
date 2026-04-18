<?php
namespace MembersForge\Repositories;

use MembersForge\Interfaces\LevelRepositoryInterface;

class LevelRepository implements LevelRepositoryInterface {
    private $table;

    public function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'members_forge_levels';
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
            return $wpdb->insert_id;
        }

        return false;

    }

    // Return type added to match interface
    public function get_levels(): array{
        global $wpdb;

        $sql = "SELECT * FROM {$this->table} ORDER BY priority DESC, id ASC";

        return $wpdb->get_results($sql);
    }

    /**
     * Update an existing level
     * 
     * @param int $id Level ID to update
     * @param array $data Updated data
     * @return bool True on success, false on failure
     */
    public function update( int $id, array $data ): bool {
        global $wpdb;
        $result = false;

        $format = $this->get_format($data);
        if( !empty($id) && is_array($format) && !empty($format) ){
            $result  = $wpdb->update( $this->table, $data, ['id' => $id], $format, ['%d'] );
        }

        if( $result === false ){
            error_log( "MF update error: " . $wpdb->last_error );
        }
        
        return $result !== false;
    }

    /**
     * Get a level by Id
     * @param int $id Level I
     * @return mixed
     */
    public function get_by_id(int $id){
        global $wpdb;

        // Use prepare to SQL injection safe
        $sql = $wpdb->prepare(
            "SELECT * FROM {$this->table} WHERE id = %d LIMIT 1",
            $id
        );

        return $wpdb->get_row($sql);
    }

    /**
     * Delete a level by ID
     * @param int $id Level ID
     * @return bool
     */
    public function delete(int $id): bool {
        global $wpdb;
        // id ভিত্তিক delete, format %d মানে integer binding
        $resutl = $wpdb->delete(
            $this->table,
            ['id' => $id],
            ['%d']
        );

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