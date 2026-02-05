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
        // শুধু আমাদের প্লাগিন পেজেই স্ক্রিপ্ট লোড হবে, অন্য কোথাও না (পারফরম্যান্স অপ্টিমাইজেশন)
        if ( 'toplevel_page_members-forge' !== $hook ) {
            return;
        }

        // Plugin root directory খুঁজে বের করা (src/Modules/Admin -> plugin root)
        $plugin_root = dirname( __DIR__, 3 ); // 3 লেভেল উপরে যাওয়া
        
        // অটো-জেনারেটেড অ্যাসেট ফাইল লোড করা
        $asset_file = require $plugin_root . '/assets/build/index.asset.php';

        wp_enqueue_script(
            'members-forge-app',
            plugins_url( 'assets/build/index.js', $plugin_root . '/members-forge.php' ),
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );
        
        // Tailwind CSS লোড করা
        wp_enqueue_style(
            'members-forge-styles',
            plugins_url( 'assets/build/style-index.css', $plugin_root . '/members-forge.php' ),
            [],
            $asset_file['version']
        );
        
        // WordPress Components এর স্টাইল পাওয়ার জন্য
        wp_enqueue_style( 'wp-components' );
    }

    public function render_page() {
        echo '<div class="wrap"><div id="members-forge-app"></div></div>';
    }
}