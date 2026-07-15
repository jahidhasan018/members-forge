<?php
namespace MembersForge\Interfaces;

interface FormRepositoryInterface {
    /**
     * Get all forms
     * @return array
     */
    public function get_all(): array;

    /**
     * Get a form by id
     * @param int $id
     * @return ?array
     */
    public function get_by_id( int $id ): ?array;

    /**
     * Get a form by key name
     * @param string $key
     * @return ?array
     */
    public function get_by_key( string $key ): ?array;

    /**
     * Create a form
     * @param array $data
     * @return int|false
     */
    public function create( array $data ): int|false;

    /**
     * Update a form
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update( int $id, array $data ): bool;

    /**
     * Delete a form
     * @param int $id
     * @return bool
     */
    public function delete( int $id ): bool;
}