<?php
/**
 * Plugin Name: MembersForge
 * Plugin URI:  https://membersforge.com
 * Description: An enterprise-grade membership plugin.
 * Version:     1.0.0
 * Author:      MembersForge Team
 * Author URI:  https://membersforge.com
 * Text Domain: members-forge
 * Domain Path: /languages
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

// 1. Load Composer Autoloader
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
    require_once __DIR__ . '/vendor/autoload.php';
}

register_activation_hook( __FILE__, [ \MembersForge\Plugin::class, 'activate' ] );

/**
 * 2. Initialize Plugin
 */
function members_forge_init() {
    $plugin = new \MembersForge\Plugin();
    $plugin->run();
}
add_action( 'plugins_loaded', 'members_forge_init' );