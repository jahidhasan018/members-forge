<?php
/**
 * PHPUnit Bootstrap File
 */

// ১. কম্পোজার অটোলৌডার লোড করা
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

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
        
        public function get_param( $key ) {
            return $this->params[$key] ?? null;
        }
        
        public function set_param( $key, $value ) {
            $this->params[$key] = $value;
        }
    }
}