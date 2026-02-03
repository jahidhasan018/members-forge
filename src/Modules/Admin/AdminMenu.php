<?php
namespace MembersForge\Modules\Admin;

use MembersForge\Interfaces\ModuleInterface;

class AdminMenu implements ModuleInterface{
    
    public function init(): void{
        add_action('admin_menu', [$this, 'add_admin_menu']);
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

    public function render_page() {
        echo '<div class="wrap"><h1>Welcome to MembersForge</h1><div id="members-forge-app"></div></div>';
    }
}