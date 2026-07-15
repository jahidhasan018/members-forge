<?php

namespace MembersForge;

use MembersForge\API\ApiRouter;
use MembersForge\Core\ModuleManager;
use MembersForge\Modules\Admin\AdminMenu;
use MembersForge\API\Controllers\StatsController;
use MembersForge\API\Controllers\LevelsController;
use MembersForge\API\Controllers\MembershipsController;
use MembersForge\API\Controllers\SettingsController;
use MembersForge\API\Controllers\FormController;
use MembersForge\Repositories\LevelRepository;
use MembersForge\Repositories\MembershipRepository;
use MembersForge\Repositories\FormRepository;
use MembersForge\Forms\FieldRegistry;
use MembersForge\Forms\FormService;
use MembersForge\Forms\Actions\CreateUserAction;
use MembersForge\Forms\Actions\SendEmailAction;
use MembersForge\Forms\ShortcodeRenderer;
use MembersForge\Database\Migrator;

class Plugin
{

    /**
     * @var ModuleManager
     */
    protected $module_manager;

    public function __construct()
    {
        $this->module_manager = new ModuleManager();
    }

    public function run()
    {

        $this->module_manager->register(new AdminMenu());

        // Pass Api Router
        $stats_controller = new StatsController();

        // Lelve Repository And Controller
        $level_repository = new LevelRepository();
        $levels_controller = new LevelsController($level_repository);

        // Membership Repository And Controller
        $membership_repository = new MembershipRepository();
        $memberships_controller = new MembershipsController($membership_repository);

        // Settings controller
        $settings_controller = new SettingsController();

        // ============================================================
        // Form Builder Wiring
        // ============================================================

        global $wpdb;

        // 1. Set up Field Registry and register default field types
        $field_registry = new FieldRegistry();

        $field_registry->register( 'text', [
            'label'    => 'Text',
            'icon'     => 'text',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'email', [
            'label'    => 'Email',
            'icon'     => 'email',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'password', [
            'label'    => 'Password',
            'icon'     => 'password',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'number', [
            'label'    => 'Number',
            'icon'     => 'number',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'select', [
            'label'    => 'Select',
            'icon'     => 'select',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'radio', [
            'label'    => 'Radio',
            'icon'     => 'radio',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'checkbox', [
            'label'    => 'Checkbox',
            'icon'     => 'checkbox',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'textarea', [
            'label'    => 'Textarea',
            'icon'     => 'textarea',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'date', [
            'label'    => 'Date',
            'icon'     => 'date',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'level_selector', [
            'label'    => 'Level Selector',
            'icon'     => 'level_selector',
            'render'   => '',
            'validate' => '',
        ] );

        $field_registry->register( 'terms', [
            'label'    => 'Terms & Conditions',
            'icon'     => 'terms',
            'render'   => '',
            'validate' => '',
        ] );

        // Allow third-party plugins to register custom field types
        do_action( 'members_forge_register_fields', $field_registry );

        // 2. Set up Form Service
        $form_repository = new FormRepository( $wpdb );
        $form_service    = new FormService( $form_repository, $field_registry );

        // 3. Register default actions
        $form_service->register_action( 'create_user', new CreateUserAction() );
        $form_service->register_action( 'send_email', new SendEmailAction() );

        // 4. Form Controller
        $form_controller = new FormController( $form_service );

        // 5. Shortcode Renderer (frontend form display)
        $shortcode_renderer = new ShortcodeRenderer( $form_service, $form_repository, $field_registry );
        $shortcode_renderer->init();

        $this->module_manager->register(new ApiRouter(
            $stats_controller, 
            $levels_controller, 
            $memberships_controller,
            $settings_controller,
            $form_controller
        ));

        $this->module_manager->boot();
    }

    // Migrate/Create tables
    public static function activate(){
        Migrator::migrate();

        flush_rewrite_rules();
    }
}
