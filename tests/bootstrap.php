<?php
/**
 * PHPUnit Bootstrap File
 */

// 1. Load Composer autoloader
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// WordPress Constants
if ( ! defined( 'HOUR_IN_SECONDS' ) ) {
    define( 'HOUR_IN_SECONDS', 3600 );
}

// 2. Set up Brain Monkey (mock WordPress functions)
Brain\Monkey\setUp();

/**
 * 3. Mock WordPress Classes (not available in unit test environment)
 * 
 * WP_REST_Response is defined in WordPress core.
 * Since WordPress isn't loaded in unit tests, we provide mock implementations.
 */
if ( ! class_exists( 'WP_REST_Response' ) ) {
    class WP_REST_Response {
        public $data;
        public $status;
        
        public function __construct( $data = null, $status = 200 ) {
            $this->data = $data;
            $this->status = $status;
        }
        
        public function get_data() {
            return $this->data;
        }
        
        public function get_status() {
            return $this->status;
        }
    }
}
/**
 * Mock WP_REST_Request class
 */
if ( ! class_exists( 'WP_REST_Request' ) ) {
    class WP_REST_Request {
        private $params = [];
        private $body_params = [];
        private $json_params = [];
        private $method = [];
        private $route = [];

        public function __construct( $method = 'GET', $route = ''){
            $this->method = $method;
            $this->route  = $route;
        }
        
                // Generic param getter (URL + body + json fallback)
        public function get_param( $key ) {
            if ( array_key_exists( $key, $this->params ) ) {
                return $this->params[ $key ];
            }

            if ( array_key_exists( $key, $this->body_params ) ) {
                return $this->body_params[ $key ];
            }

            if ( array_key_exists( $key, $this->json_params ) ) {
                return $this->json_params[ $key ];
            }

            return null;
        }
        
        // Single param setter (id etc)
        public function set_param( $key, $value ) {
            $this->params[ $key ] = $value;
        }

        // WP-like helper: set route URL params
        public function set_url_params( array $params ) {
            foreach ( $params as $key => $value ) {
                $this->params[ $key ] = $value;
            }
        }

        // Body params support (form/body payload)
        public function set_body_params( array $params ) {
            $this->body_params = $params;
        }

        public function get_body_params() {
            return $this->body_params;
        }

        // JSON params support (if any test/controller uses it)
        public function set_json_params( array $params ) {
            $this->json_params = $params;
        }

        public function get_json_params() {
            return $this->json_params;
        }
    }
}