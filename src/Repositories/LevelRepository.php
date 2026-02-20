<?php
namespace MembersForge\Repositories;

use MembersForge\Interfaces\LevelRepositoryInterface;

class LevelRepository implements LevelRepositoryInterface{
    private $table;

    public function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'members_forge_levels';
    }

    /**
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

        $format = $this->get_format($data);
        if( !empty($id) && is_array($format) && !empty($format) ){
            $result  = $wpdb->update( $this->table, $data, ['id' => $id], $format, ['%d'] );
            return $result;
        }
        
        return false;
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
}