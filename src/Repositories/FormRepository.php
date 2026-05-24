<?php
namespace MembersForge\Repositories;

use MembersForge\Interfaces\FormRepositoryInterface;

class FormRepository implements FormRepositoryInterface {

    private const ARRAY_OUTPUT = 'ARRAY_A';

    private $wpdb;
    private $table;

    private const ALLOWED_COLUMNS = [
        'name',
        'type',
        'fields',
        'settings',
        'shortcode_key',
        'status',
        'schema_version',
        'created_by',
    ];

    public function __construct($wpdb) {
        $this->wpdb = $wpdb;
        $this->table = $this->wpdb->prefix . 'members_forge_forms';
    }

    /**
     * Get all forms
     * @return array
     */
    public function get_all(): array {
        $sql = "SELECT * FROM {$this->table} ORDER BY id DESC";

        $results = $this->wpdb->get_results( $sql, self::ARRAY_OUTPUT );

        if ( ! is_array( $results ) ) {
            return [];
        }

        return $results;
    }

    /**
     * Get a form by id
     * @param int $id
     * @return ?array
     */
    public function get_by_id( int $id ): ?array {
        $sql = "SELECT * FROM {$this->table} WHERE id = %d";

        // Repository contract array return করে, তাই wpdb result array হিসেবে নাও।
        $result = $this->wpdb->get_row( $this->wpdb->prepare( $sql, $id ), self::ARRAY_OUTPUT );

        return $result;
    }

    /**
     * Get a form by key name
     * @param string $key
     * @return ?array
     */
    public function get_by_key( string $key ): ?array {
        $sql = "SELECT * FROM {$this->table} WHERE shortcode_key = %s";

        // Shortcode lookup frontend render path এ যাবে, তাই stable array shape maintain করি।
        $result = $this->wpdb->get_row( $this->wpdb->prepare( $sql, $key ), self::ARRAY_OUTPUT );

        return $result;
    }

    /**
     * Create a form
     * @param array $data
     * @return int|false
     */
    public function create( array $data ): int|false {
        $data = $this->filter_allowed_columns($data);
        $data = $this->prepare_for_persistence($data);

        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');

        $format = $this->get_format( $data );

        $inserted = $this->wpdb->insert( $this->table, $data, $format );

        if ( false === $inserted ) {
            return false;
        }

        return (int) $this->wpdb->insert_id;
    }

    /**
     * Update a form
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update( int $id, array $data ): bool {
        unset(
            $data['id'],
            $data['created_at'],
            $data['created_by']
        );

        $data = $this->filter_allowed_columns($data);
        $data = $this->prepare_for_persistence($data);

        $data['updated_at'] = current_time( 'mysql' );

        $formated_data = $this->get_format( $data );

        $updated = $this->wpdb->update( 
            $this->table,
            $data,
            [ 'id' => $id ],
            $formated_data,
            [ '%d' ]
        );
        
        return $updated !== false;
    }

    /**
     * Delete a form
     * @param int $id
     * @return bool
     */
    public function delete( int $id ): bool {
        $deleted = $this->wpdb->delete(
            $this->table,
            ['id' => $id],
            ['%d']
        );

        return $deleted !== false;
    }

    /**
     * wpdb format inference insert/update call কে predictable রাখে।
     *
     * @param array $data
     * @return array
     */
    private function get_format( array $data ): array {
        $format = [];

        foreach ( $data as $value ) {
            if ( is_int( $value ) ) {
                $format[] = '%d';
                continue;
            }

            if ( is_float( $value ) ) {
                $format[] = '%f';
                continue;
            }

            $format[] = '%s';
        }

        return $format;
    }

    /**
     * Prepare data before database persistence.
     *
     * @param array $data
     * @return array
     */
    private function prepare_for_persistence( array $data ): array {
        $json_fields = [ 'fields', 'settings' ];

        foreach ( $json_fields as $field ) {
            if ( isset( $data[ $field ] ) && is_array( $data[ $field ] ) ) {
                $data[ $field ] = wp_json_encode( $data[ $field ] );
            }
        }

        return $data;
    }

    /**
     * Filter Allowed columns
     * @param array $data
     * @return array
     */
    private function filter_allowed_columns( array $data ): array {
        return array_intersect_key(
            $data,
            array_flip( self::ALLOWED_COLUMNS )
        );
    }
}