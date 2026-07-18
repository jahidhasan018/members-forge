<?php
namespace MembersForge\Modules\Admin;

use MembersForge\Interfaces\ModuleInterface;

class AdminMenu implements ModuleInterface{
    
    public function init(): void{
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    public function add_admin_menu(): void{
        add_menu_page(
            'MembersForge',          // Page Title
            'MembersForge',          // Menu Title
            'manage_options',        // Capability
            'members-forge',         // Menu Slug
            [ $this, 'render_page' ],// Callback function
            'dashicons-groups',      // Icon
            50                       // Position
        );
    }

    public function enqueue_assets( $hook ) {
        // Only load on our plugin page — performance optimization
        if ( 'toplevel_page_members-forge' !== $hook ) {
            return;
        }

        // Resolve plugin root from (src/Modules/Admin -> plugin root)
        $plugin_root = dirname( __DIR__, 3 ); // 3 levels up from src/Modules/Admin
        
        // Load auto-generated asset dependencies file
        $asset_file = require $plugin_root . '/assets/build/index.asset.php';

        wp_enqueue_script(
            'members-forge-app',
            plugins_url( 'assets/build/index.js', $plugin_root . '/members-forge.php' ),
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );
        
        // Load Tailwind CSS
        wp_enqueue_style(
            'members-forge-styles',
            plugins_url( 'assets/build/style-index.css', $plugin_root . '/members-forge.php' ),
            [],
            $asset_file['version']
        );
        
        // Enqueue WordPress Components styles
        wp_enqueue_style( 'wp-components' );
    }

    public function render_page() {
        echo '<div class="wrap"><div id="members-forge-app"></div></div>';
    }
}