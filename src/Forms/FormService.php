<?php
/**
 * Form Service — Business logic layer for form operations
 *
 * Handles form validation, shortcode key generation, field type
 * validation against the FieldRegistry, and action execution.
 *
 * @package MembersForge\Forms
 * @since 1.0.0
 */

namespace MembersForge\Forms;

use MembersForge\Interfaces\FormRepositoryInterface;
use MembersForge\Forms\Actions\FormActionInterface;

class FormService {

    /**
     * Form repository instance.
     *
     * @var FormRepositoryInterface
     */
    private FormRepositoryInterface $repository;

    /**
     * Field registry instance.
     *
     * @var FieldRegistry
     */
    private FieldRegistry $registry;

    /**
     * Registered action handlers.
     *
     * @var array<string, FormActionInterface>
     */
    private array $actions = [];

    /**
     * Constructor.
     *
     * @param FormRepositoryInterface $repository Form data access.
     * @param FieldRegistry           $registry   Field type registry.
     */
    public function __construct(
        FormRepositoryInterface $repository,
        FieldRegistry $registry
    ) {
        $this->repository = $repository;
        $this->registry   = $registry;
    }

    /**
     * Register a form submission action handler.
     *
     * @param string             $key    Action identifier (e.g., 'create_user').
     * @param FormActionInterface $action Action handler instance.
     * @return void
     */
    public function register_action( string $key, FormActionInterface $action ): void {
        $this->actions[ $key ] = $action;
    }

    /**
     * Get a single form with decoded JSON fields and settings.
     *
     * @param int $id Form ID.
     * @return array|null Form data or null if not found.
     */
    public function get_form( int $id ): ?array {
        $form = $this->repository->get_by_id( $id );

        if ( null === $form ) {
            return null;
        }

        $form['fields']   = $this->decode_json_field( $form, 'fields', [] );
        $form['settings'] = $this->decode_json_field( $form, 'settings', [] );

        return $form;
    }

    /**
     * Get all forms with decoded JSON fields.
     *
     * @return array<int, array>
     */
    public function get_all_forms(): array {
        $forms = $this->repository->get_all();

        foreach ( $forms as &$form ) {
            $form['fields']   = $this->decode_json_field( $form, 'fields', [] );
            $form['settings'] = $this->decode_json_field( $form, 'settings', [] );
        }

        return $forms;
    }

    /**
     * Create or update a form.
     *
     * If the data contains an 'id', it performs an update.
     * Otherwise, it creates a new form.
     *
     * @param array $data Form data (name, type, fields, settings, etc.).
     * @return int|false Form ID on success, false on failure.
     */
    public function save_form( array $data ): int|false {
        $data = $this->sanitize_form_data( $data );

        if ( empty( $data['name'] ) ) {
            return false;
        }

        $is_update = ! empty( $data['id'] );

        if ( ! $is_update ) {
            if ( empty( $data['shortcode_key'] ) ) {
                $data['shortcode_key'] = $this->generate_shortcode_key( $data['type'] ?? 'form' );
            }

            $data['schema_version'] = 1;
            $data['created_by']     = get_current_user_id();
        }

        if ( isset( $data['fields'] ) && is_array( $data['fields'] ) ) {
            $valid = $this->validate_field_types( $data['fields'] );

            if ( ! $valid ) {
                return false;
            }
        }

        if ( $is_update ) {
            $id  = (int) $data['id'];
            unset( $data['id'] );

            $updated = $this->repository->update( $id, $data );

            return $updated ? $id : false;
        }

        return $this->repository->create( $data );
    }

    /**
     * Publish a form by changing its status to 'active'.
     *
     * @param int $id Form ID.
     * @return bool True on success, false on failure.
     */
    public function publish_form( int $id ): bool {
        return $this->repository->update( $id, [ 'status' => 'active' ] );
    }

    /**
     * Delete a form.
     *
     * @param int $id Form ID.
     * @return bool True on success, false on failure.
     */
    public function delete_form( int $id ): bool {
        return $this->repository->delete( $id );
    }

    /**
     * Execute registered actions for a form submission.
     *
     * Reads the 'actions' setting from the form and runs each
     * registered action handler in sequence.
     *
     * @param array $form       The form configuration.
     * @param array $submission Key-value pairs of submitted field values.
     * @return void
     */
    public function execute_actions( array $form, array $submission ): void {
        $settings    = $form['settings'] ?? [];
        $action_keys = $settings['actions'] ?? [];

        do_action( 'members_forge_before_form_submit', $form, $submission );

        foreach ( $action_keys as $key ) {
            if ( isset( $this->actions[ $key ] ) ) {
                $this->actions[ $key ]->execute( $form, $submission );
            }
        }

        do_action( 'members_forge_after_form_submit', $form, $submission );
    }

    /**
     * Get all registered field types formatted for API response.
     *
     * @return array<int, array{type: string, label: string, icon: string}>
     */
    public function get_field_types(): array {
        return $this->registry->get_all_for_api();
    }

    /**
     * Validate that all field types in the fields array are registered.
     *
     * @param array $fields Array of field definitions.
     * @return bool True if all field types are valid, false otherwise.
     */
    public function validate_field_types( array $fields ): bool {
        foreach ( $fields as $field ) {
            $type = $field['type'] ?? '';

            if ( ! $this->registry->has( $type ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generate a unique shortcode key from form type.
     *
     * @param string $type Form type (e.g., 'registration', 'login').
     * @return string Unique shortcode key like "registration-form-1".
     */
    private function generate_shortcode_key( string $type ): string {
        global $wpdb;

        $table   = $wpdb->prefix . 'members_forge_forms';
        $base    = sanitize_title( $type ) . '-form';
        $count   = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE shortcode_key LIKE %s",
                $wpdb->esc_like( $base ) . '%'
            )
        );

        return $base . '-' . ( $count + 1 );
    }

    /**
     * Decode a JSON field from form data.
     *
     * @param array  $form     Form data array.
     * @param string $key      The key to decode ('fields' or 'settings').
     * @param mixed  $default  Default value if key is missing or invalid.
     * @return mixed Decoded data.
     */
    private function decode_json_field( array $form, string $key, mixed $default = [] ): mixed {
        if ( ! isset( $form[ $key ] ) ) {
            return $default;
        }

        if ( is_array( $form[ $key ] ) ) {
            return $form[ $key ];
        }

        $decoded = json_decode( $form[ $key ], true );

        return is_array( $decoded ) ? $decoded : $default;
    }

    /**
     * Sanitize form data before persistence.
     *
     * @param array $data Raw form data.
     * @return array Sanitized form data.
     */
    private function sanitize_form_data( array $data ): array {
        if ( isset( $data['name'] ) ) {
            $data['name'] = sanitize_text_field( $data['name'] );
        }

        if ( isset( $data['type'] ) ) {
            $data['type'] = sanitize_key( $data['type'] );
        }

        if ( isset( $data['shortcode_key'] ) ) {
            $data['shortcode_key'] = sanitize_title( $data['shortcode_key'] );
        }

        if ( isset( $data['status'] ) ) {
            $data['status'] = in_array( $data['status'], [ 'active', 'draft' ], true )
                ? $data['status']
                : 'draft';
        }

        return $data;
    }
}
