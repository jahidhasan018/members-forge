<?php
/**
 * Field Registry — Central registry for form field types
 *
 * Manages all available field types that can be used in forms.
 * Third-party plugins can register custom field types via the
 * `members_forge_register_fields` action hook.
 *
 * @package MembersForge\Forms
 * @since 1.0.0
 */

namespace MembersForge\Forms;

class FieldRegistry {

    /**
     * Registered field type configurations.
     *
     * @var array<string, array{label: string, icon: string, render: string, validate: string}>
     */
    private array $fields = [];

    /**
     * Register a new field type.
     *
     * @param string $type   Unique field type identifier (e.g., 'text', 'email').
     * @param array  $config Field type configuration with keys:
     *                       - label:    string  Display name.
     *                       - icon:     string  Dashicon or emoji identifier.
     *                       - render:   string  Renderer class name (FQCN).
     *                       - validate: string  Validator class name (FQCN).
     * @return void
     */
    public function register( string $type, array $config ): void {
        $this->fields[ $type ] = $config;
    }

    /**
     * Get all registered field types.
     *
     * @return array<string, array{label: string, icon: string, render: string, validate: string}>
     */
    public function get_all(): array {
        return $this->fields;
    }

    /**
     * Get a single field type configuration by type key.
     *
     * @param string $type Field type identifier.
     * @return array|null Configuration array or null if not registered.
     */
    public function get( string $type ): ?array {
        return $this->fields[ $type ] ?? null;
    }

    /**
     * Check if a field type is registered.
     *
     * @param string $type Field type identifier.
     * @return bool True if registered, false otherwise.
     */
    public function has( string $type ): bool {
        return isset( $this->fields[ $type ] );
    }

    /**
     * Get field type labels as a flat array for API responses.
     *
     * @return array<int, array{type: string, label: string, icon: string}>
     */
    public function get_all_for_api(): array {
        $list = [];

        foreach ( $this->fields as $type => $config ) {
            $list[] = [
                'type'  => $type,
                'label' => $config['label'],
                'icon'  => $config['icon'],
            ];
        }

        return $list;
    }
}
