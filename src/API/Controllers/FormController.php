<?php
/**
 * Form Controller — REST API endpoints for form management
 *
 * Handles CRUD operations for forms, field type listing,
 * and form publishing via the members-forge/v1 REST namespace.
 *
 * @package MembersForge\API\Controllers
 * @since 1.0.0
 */

namespace MembersForge\API\Controllers;

use MembersForge\API\AbstractController;
use MembersForge\Forms\FormService;
use WP_REST_Request;
use WP_REST_Response;

class FormController extends AbstractController {

    /**
     * Form service instance.
     *
     * @var FormService
     */
    private FormService $form_service;

    /**
     * Constructor.
     *
     * @param FormService $form_service Form business logic layer.
     */
    public function __construct( FormService $form_service ) {
        $this->form_service = $form_service;
    }

    /**
     * GET /forms — List all forms.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_items( WP_REST_Request $request ): WP_REST_Response {
        $forms = $this->form_service->get_all_forms();

        return $this->success_response( $forms );
    }

    /**
     * GET /forms/{id} — Get a single form with fields.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_item( WP_REST_Request $request ): WP_REST_Response {
        $id   = (int) $request->get_param( 'id' );
        $form = $this->form_service->get_form( $id );

        if ( null === $form ) {
            return $this->error_response( 'Form not found.', 404 );
        }

        return $this->success_response( $form );
    }

    /**
     * POST /forms — Create a new form.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function create_item( WP_REST_Request $request ): WP_REST_Response {
        $data = $request->get_json_params();

        if ( empty( $data ) ) {
            $data = $request->get_body_params();
        }

        $form_id = $this->form_service->save_form( $data );

        if ( false === $form_id ) {
            return $this->error_response( 'Failed to create form. Name is required and field types must be valid.', 400 );
        }

        return $this->success_response(
            [ 'id' => $form_id ],
            201
        );
    }

    /**
     * PUT /forms/{id} — Update an existing form.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function update_item( WP_REST_Request $request ): WP_REST_Response {
        $id   = (int) $request->get_param( 'id' );

        if ( $id <= 0 ) {
            return $this->error_response( 'Invalid form ID.', 400 );
        }

        $existing = $this->form_service->get_form( $id );

        if ( null === $existing ) {
            return $this->error_response( 'Form not found.', 404 );
        }

        $data          = $request->get_json_params();
        $data['id']    = $id;

        if ( empty( $data ) ) {
            $data = $request->get_body_params();
            $data['id'] = $id;
        }

        $updated = $this->form_service->save_form( $data );

        if ( false === $updated ) {
            return $this->error_response( 'Failed to update form.', 500 );
        }

        return $this->success_response( [ 'id' => $updated ] );
    }

    /**
     * DELETE /forms/{id} — Delete a form.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function delete_item( WP_REST_Request $request ): WP_REST_Response {
        $id = (int) $request->get_param( 'id' );

        if ( $id <= 0 ) {
            return $this->error_response( 'Invalid form ID.', 400 );
        }

        $existing = $this->form_service->get_form( $id );

        if ( null === $existing ) {
            return $this->error_response( 'Form not found.', 404 );
        }

        $deleted = $this->form_service->delete_form( $id );

        if ( ! $deleted ) {
            return $this->error_response( 'Failed to delete form.', 500 );
        }

        return $this->success_response(
            [ 'deleted' => true, 'id' => $id ]
        );
    }

    /**
     * GET /field-types — List available field types.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_field_types( WP_REST_Request $request ): WP_REST_Response {
        $types = $this->form_service->get_field_types();

        return $this->success_response( $types );
    }

    /**
     * POST /forms/{id}/publish — Publish a form (draft → active).
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function publish_item( WP_REST_Request $request ): WP_REST_Response {
        $id = (int) $request->get_param( 'id' );

        if ( $id <= 0 ) {
            return $this->error_response( 'Invalid form ID.', 400 );
        }

        $existing = $this->form_service->get_form( $id );

        if ( null === $existing ) {
            return $this->error_response( 'Form not found.', 404 );
        }

        $published = $this->form_service->publish_form( $id );

        if ( ! $published ) {
            return $this->error_response( 'Failed to publish form.', 500 );
        }

        return $this->success_response(
            [ 'id' => $id, 'status' => 'active' ]
        );
    }
}
