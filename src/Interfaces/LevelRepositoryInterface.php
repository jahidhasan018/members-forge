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
}