<?php
namespace MembersForge\Interfaces;

interface LevelRepositoryInterface {
    /**
     * Create a new level
     * 
     * @param array $data Level Data
     * @return int|false
     */
    public function create( array $data ): int|false;

    /**
     * Update an existing level
     * 
     * @param int $id Level ID to update
     * @param array $data Updated data
     * @return bool True on success, false on failure
     */
    public function update( int $id, array $data): bool;

    /**
     * Get a level details
     * 
     * @return array Return details of a level
     */
    public function get_levels(): array;

    /**
     * Get a level
     * 
     * @param int $id Level ID to get
     * @return bool True on success, false on failure
     */
    public function get_by_id(int $id);

       /**
     * Delete a level
     * 
     * @param int $id Level ID to delete
     * @return bool True on success, false on failure
     */
    public function delete(int $id): bool;
}
