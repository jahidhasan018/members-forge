<?php
namespace MembersForge\API\Controllers;

use MembersForge\API\AbstractController;
use MembersForge\Interfaces\MembershipRepositoryInterface;
use WP_REST_Request;

class MembershipsController extends AbstractController {

    private MembershipRepositoryInterface $repository;

    public function __construct( MembershipRepositoryInterface $repository ) {
        $this->repository = $repository;
    }

    /**
     * POST /memberships — Create a new membership for current user
     */
    public function create_item( WP_REST_Request $request ) {
        $level_id = (int) $request->get_param('level_id');

        if( $level_id <= 0 ){
            return $this->error_response( 'Level ID is required.', 400 );
        }

        $user_id = (int) get_current_user_id();

        $amount_paid     = $request->get_param('amount_paid');
        $currency        = $request->get_param('currency');
        $payment_gateway = $request->get_param('payment_gateway');
        $transaction_id  = $request->get_param('transaction_id');
        $expires_at      = $request->get_param('expires_at');

        $data = [
            'amount_paid'     => $amount_paid !== null ? (float) $amount_paid : 0.00,
            'currency'        => sanitize_text_field($currency ?? 'USD'),
            'payment_gateway' => sanitize_text_field($payment_gateway ?? ''),
            'transaction_id'  => sanitize_text_field($transaction_id ?? ''),
            'expires_at'      => $expires_at !== null ? sanitize_text_field($expires_at) : null,
        ];

        $id = $this->repository->create( $user_id, $level_id, $data );

        if( ! $id ){
            return $this->error_response( 'Failed to create membership.', 500 );
        }

        return $this->success_response( ['id' => (int) $id], 201 );
    }

    /**
     * GET /memberships/user/{user_id} - Get all memberships for a user
     */
    public function get_user_memberships( WP_REST_Request $request ) {
        $user_id = (int) $request->get_param('user_id');

        if( $user_id <= 0 ){
            return $this->error_response( 'Invalid user ID.', 400 );
        }

        $memberships = $this->repository->get_by_user( $user_id );

        return $this->success_response( $memberships );
    }

    /**
     * PUT /memberships/{id}/status — Update membership status
     */
    public function update_status( WP_REST_Request $request ) {
        $id = (int) $request->get_param('id');

        if ( $id <= 0 ) {
            return $this->error_response( 'Invalid membership ID.', 400 );
        }

        // Check if there is membership with the id
        $existing = $this->repository->get_by_id( $id );
        if ( ! $existing ) {
            return $this->error_response( 'Membership not found.', 404 );
        }

        $status = sanitize_text_field( $request->get_param('status') );
        $allowed = [ 'active', 'expired', 'cancelled', 'pending', 'paused' ];

        if( ! in_array($status, $allowed, true) ){
            return $this->error_response( 'Invalid status value.', 400 );
        }

        $updated = $this->repository->update_status( $id, $status );
        if ( ! $updated ) {
            return $this->error_response( 'Failed to update membership status.', 500 );
        }

        return $this->success_response( [ 'id' => $id ], 200 );
    }

    /**
     * Delete /memberships/{id} - Delete a membership
     */
    public function delete_item( WP_REST_Request $request ) {
        $id = (int) $request->get_param('id');
        if ( $id <= 0 ) {
            return $this->error_response( 'Invalid membership ID.', 400 );
        }

        $existing = $this->repository->get_by_id( $id );
        if( ! $existing ){
            return $this->error_response( 'Membership not found.', 404 );
        }

        $deleted = $this->repository->delete( $id );
        if ( ! $deleted ) {
            return $this->error_response( 'Failed to delete membership.', 500 );
        }

        return $this->success_response( ['deleted' => true, 'id' => $id], 200);
    }

    /**
     * GET /memberships — Admin: list all memberships
     * Includes user and level info via JOIN query
     */
    public function get_all_memberships( WP_REST_Request $request ) {
        $memberships = $this->repository->get_all();
        return $this->success_response( $memberships );
    }
}