<?php
namespace MembersForge\API\Controllers;

use MembersForge\API\AbstractController;
use MembersForge\Interfaces\LevelRepositoryInterface;
use WP_REST_Request;

/**
 * Levels REST API Controller
 * 
 * Handles all membership level related API endpoints.
 */
class LevelsController extends AbstractController {

    /**
     * @var LevelRepositoryInterface
     */
    private $repository;

    /**
     * * @param LevelRepository $repository
     */
    public function __construct( LevelRepositoryInterface $repository ){
        $this->repository = $repository;
    }

    /**
     * GET /levels - Retrieve all membership levels
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_items( WP_REST_Request $request ){
        $levels = $this->repository->get_levels();

        return $this->success_response( $levels );
    }

    /**
     * POST /levels - Create a new membership level
     * 
     * Get data from request body and crea new level
     */
    public function create_item( WP_REST_Request $request ) {
        // Get request body data
        $raw = $this->get_raw_params( $request );

        // Minimal validation: if name not exist return error message
        if( empty($raw['name']) ){
            return $this->error_response( 'Level name is required', 400 );
        }

        // Sanitize and prepare data
        $data = $this->parse_level_data( $raw );
        $data = apply_filters('members_forge_rest_create_level_data', $data, $request);

        // Call repository to insert the level
        $level_id = $this->repository->create( $data );

        // If fail to insert then give error response
        if( ! $level_id ){
            return $this->error_response('Failed to create level.', 500 );
        }

        // Return success with code: 201 (created)
        return $this->success_response(
            [ 'id' => (int) $level_id ],
            201
        );
    }

    /**
     * PUT /levles/{id} - Update existing level
     * 
     * Validate id + existence check + update
     */
    public function update_item( WP_REST_Request $request ) {
        // Get id from url param
        $id = (int) $request->get_param('id');

        // If id invaild then return error response
        if( $id <= 0 ){
            return $this->error_response( 'Invalid level id', 400 );
        } 

        // Check if level is exist if not exist give error response
        $existing = $this->repository->get_by_id( $id );
        if( ! $existing ){
            return $this->error_response('Level not found.', 404 ); 
        }

        // Get update payload from request body
        $raw = $this->get_raw_params( $request );
        
        // Only DB-allowed fields
        $data = $this->parse_level_data( $raw );

        // Call repository update
        $updated = $this->repository->update( $id, $data );

        // If fail to update give a server-side error 
        if( ! $updated ){
            return $this->error_response( "Failed to update level.", 500 );
        }

        // Success response
        return $this->success_response(
            [ 'id'  => $id ],
            200
        );
    }

    /**
     * DELETE /levels/{id} - Delete level
     * 
     * Validate id + existence check + delete
     */
    public function delete_item( WP_REST_Request $request ) {
        // Get id from url params
        $id = (int) $request->get_param('id');

        // Validate id
        if( $id <= 0 ){
            return $this->error_response( 'Invalid level id.', 400 );
        }

        // Check if level exist. if not then return error response
        $existing = $this->repository->get_by_id($id);
        if( ! $existing ){
            return $this->error_response( 'Level not found.', 404 );
        }

        // Delete the level
        $deleted = $this->repository->delete( $id );

        // If fail to delete return error response with code: 500
        if( ! $deleted ){
            return $this->error_response( 'Failed to delete level.', 500 );
        }

        // Success response
        return $this->success_response(
            [ 'deleted' => true, 'id' => $id ],
            200
        );
    }

    /**
     * Build sanitized level data from request body
     * Reusable between create and update
     */
    private function parse_level_data( array $raw ): array {
        return [
            'name'             => isset($raw['name']) ? sanitize_text_field($raw['name']) : '',
            'description'      => isset($raw['description']) ? sanitize_textarea_field($raw['description']) : '',
            'price'            => isset($raw['price']) ? (float) $raw['price'] : 0,
            'billing_interval' => isset($raw['billing_interval']) ? sanitize_text_field($raw['billing_interval']) : 'month',
            'trial_days'       => isset($raw['trial_days']) && $raw['trial_days'] !== '' ? (int) $raw['trial_days'] : 0,
            'is_free'          => ! empty($raw['is_free']) ? 1 : 0,
            'max_members'      => isset($raw['max_members']) && $raw['max_members'] !== '' ? (int) $raw['max_members'] : 0,
            'features'         => isset($raw['features']) ? sanitize_textarea_field($raw['features']) : '',
            'status'           => isset($raw['status']) ? sanitize_text_field($raw['status']) : 'active',
        ];
    }

    /**
     * Normalize request params — JSON or form body
     */
    private function get_raw_params( WP_REST_Request $request ): array {
        $raw = $request->get_json_params();
        if ( empty( $raw ) ) {
            $raw = $request->get_body_params();
        }
        return $raw ?: [];
    }
}