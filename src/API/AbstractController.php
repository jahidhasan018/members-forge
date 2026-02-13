<?php
namespace MembersForge\API;

use MembersForge\Interfaces\ControllerInterface;
use WP_REST_Response;

abstract class AbstractController implements ControllerInterface {
    /**
     * Format successful response
     * 
     * @param mixed $data Response data
     * @param int $status_code HTTP status code
     * @return WP_REST_Response
     */
    public function success_response( $data, int $status_code = 200 ): WP_REST_Response  {
        return new WP_REST_Response([
            'success'   => true,
            'data'      => $data
        ], $status_code);
    }

    /**
     * Format error response
     * 
     * @param string $message Error message
     * @param int $status_code HTTP status code  
     * @return WP_REST_Response
     */
    public function error_response(string $message, int $status_code = 400): WP_REST_Response {
        return new WP_REST_Response([
            'success' => false,
            'error'   => [
                'message' => $message,
                'code'    => $status_code
            ]
        ], $status_code );
    }

    /**
     * Format paginated response
     * 
     * @param array $items Items to paginate
     * @param int $total Total items count
     * @param int $page Current page
     * @param int $per_page Items per page
     * @return WP_REST_Response
     */
    public function paginated_response( array $items, int $total, int $page = 1, int $per_page = 10 ): WP_REST_Response {
        return new WP_REST_Response([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'total'       => $total,
                'page'        => $page,
                'per_page'    => $per_page,
                'total_pages' => ceil( $total / $per_page )
            ]
        ], 200 );
    }
}