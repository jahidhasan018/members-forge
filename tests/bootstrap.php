<?php
/**
 * PHPUnit Bootstrap File
 */

// ১. কম্পোজার অটোলৌডার লোড করা
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// WordPress Constants
if ( ! defined( 'HOUR_IN_SECONDS' ) ) {
    define( 'HOUR_IN_SECONDS', 3600 );
}

// ২. Brain Monkey সেটআপ (WordPress ফাংশন মক করার জন্য)
Brain\Monkey\setUp();

/**
 * ৩. Mock WordPress Classes (যা unit test এ available না)
 * 
 * WP_REST_Response class WordPress এ define করা আছে।
 * Unit test এ WordPress load হয় না, তাই mock বানাতে হয়।
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

        // WP-like helper: route params set করার জন্য
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