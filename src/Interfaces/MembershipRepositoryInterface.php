<?php

namespace MembersForge\Interfaces;

interface MembershipRepositoryInterface {
    /**
     * Create a membership for a user
     * @param int $user_id
     * @param int $level_id
     * @param array $data (amount_paid, curency, payment_gateway, transaction_id, expires_at)
     * @return int|false New membership ID or false
     */
    public function create( int $user_id, int $level_id, array $data): int|false;

    /**
     * Get all memberships for a user
     * @param int $user_id
     * @return array
     */
    public function get_by_user(int $user_id): array;

    /**
     * Get a single membership by ID
     * @param int $id
     * @return object|null
     */
    public function get_by_id(int $id): object|null;

    /**
     * Update membership status
     * @param int $id
     * @param string $status active|expired|cancelled|pending|paused
     * @return bool
     */
    public function update_status(int $id, string $status): bool;

    /**
     * Delete a membership
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Get all memberships with user and level info (JOIN) for full members list
     * @return array
     */
    public function get_all(): array;
}