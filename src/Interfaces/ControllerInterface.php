<?php
namespace MembersForge\Interfaces;

use WP_REST_Response;

interface ControllerInterface{

    /**
     * Format successful response
     * @param mixed $data Response data
     * @param $status_code HTTP status code
     * @return WP_REST_Response
     */
    public function success_response( $data, int $status_code = 200 ): WP_REST_Response;

    /**
     * Format error response
     * 
     * @param string $message Error message
     * @param int $status_code HTTP status code
     * @return WP_REST_Response
     */
    public function error_response( string $message, int $status_code = 400 ): WP_REST_Response;
}