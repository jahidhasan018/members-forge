<?php

namespace MembersForge\Forms;

use MembersForge\Interfaces\FormRepositoryInterface;

class ShortcodeRenderer {

    private FormService $form_service;
    private FormRepositoryInterface $repository;
    private FieldRegistry $registry;

    public function __construct(
        FormService $form_service,
        FormRepositoryInterface $repository,
        FieldRegistry $registry
    ) {
        $this->form_service = $form_service;
        $this->repository   = $repository;
        $this->registry     = $registry;
    }

    public function init(): void {
        add_shortcode( 'mf_form', [ $this, 'render' ] );
        add_action( 'template_redirect', [ $this, 'handle_submission' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ] );
    }

    public function enqueue_styles(): void {
        wp_enqueue_style(
            'members-forge-frontend',
            plugins_url( 'assets/src/frontend.css', MF_PLUGIN_FILE ),
            [],
            '1.0.0'
        );
    }

    public function handle_submission(): void {
        if ( empty( $_POST['mf_submit'] ) || empty( $_POST['mf_form_key'] ) ) {
            return;
        }

        $key = sanitize_title( $_POST['mf_form_key'] );

        if ( empty( $_POST['mf_nonce'] ) || ! wp_verify_nonce( $_POST['mf_nonce'], 'mf_submit_' . $key ) ) {
            return;
        }

        $form = $this->repository->get_by_key( $key );

        if ( ! $form || ( $form['status'] ?? '' ) !== 'active' ) {
            return;
        }

        $fields          = json_decode( $form['fields'] ?? '[]', true ) ?: [];
        $settings        = json_decode( $form['settings'] ?? '{}', true ) ?: [];
        $form['fields']  = $fields;
        $form['settings'] = $settings;

        $submission = [];

        foreach ( $fields as $field ) {
            $name = $field['name'] ?? '';

            if ( '' === $name ) {
                continue;
            }

            if ( ( $field['type'] ?? '' ) === 'checkbox' && ! empty( $field['options'] ) ) {
                $submission[ $name ] = isset( $_POST[ $name ] ) && is_array( $_POST[ $name ] )
                    ? array_map( 'sanitize_text_field', $_POST[ $name ] )
                    : [];
            } elseif ( ( $field['type'] ?? '' ) === 'terms' ) {
                $submission[ $name ] = ! empty( $_POST[ $name ] ) ? '1' : '0';
            } else {
                $raw = $_POST[ $name ] ?? '';

                if ( is_string( $raw ) ) {
                    $submission[ $name ] = sanitize_text_field( wp_unslash( $raw ) );
                } else {
                    $submission[ $name ] = '';
                }
            }
        }

        do_action( 'members_forge_before_handle_submission', $form, $submission );

        $this->form_service->execute_actions( $form, $submission );

        $redirect_url = wp_get_referer() ?: home_url();
        $redirect_url = add_query_arg( 'mf_success', $key, remove_query_arg( 'mf_success', $redirect_url ) );

        wp_safe_redirect( $redirect_url );
        exit;
    }

    public function render( $atts ): string {
        $atts = shortcode_atts( [ 'key' => '' ], $atts, 'mf_form' );
        $key  = sanitize_title( $atts['key'] );

        if ( '' === $key ) {
            return '';
        }

        $form = $this->repository->get_by_key( $key );

        if ( ! $form || ( $form['status'] ?? '' ) !== 'active' ) {
            return '';
        }

        $fields   = json_decode( $form['fields'] ?? '[]', true ) ?: [];
        $settings = json_decode( $form['settings'] ?? '{}', true ) ?: [];

        ob_start();

        $submitted_key = sanitize_title( $_GET['mf_success'] ?? '' );
        $show_success  = '' !== $submitted_key && $submitted_key === $key;

        if ( $show_success ) {
            $message = $settings['success_message'] ?? __( 'Form submitted successfully!', 'members-forge' );
            $this->render_success( $message );

            if ( ! empty( $settings['hide_after_submit'] ) ) {
                return ob_get_clean();
            }
        }

        $this->render_form( $form, $fields, $settings, $key );

        return ob_get_clean();
    }

    private function render_success( string $message ): void {
        ?>
        <div class="mf-form-success" role="alert">
            <?php echo wp_kses_post( wpautop( $message ) ); ?>
        </div>
        <?php
    }

    private function render_form( array $form, array $fields, array $settings, string $key ): void {
        ?>
        <form method="post" class="mf-form mf-form-<?php echo esc_attr( $key ); ?>">
            <?php wp_nonce_field( 'mf_submit_' . $key, 'mf_nonce' ); ?>
            <input type="hidden" name="mf_form_key" value="<?php echo esc_attr( $key ); ?>">

            <?php
            foreach ( $fields as $field ) {
                $type = $field['type'] ?? 'text';

                if ( method_exists( $this, 'render_' . $type . '_field' ) ) {
                    $this->{'render_' . $type . '_field'}( $field );
                } else {
                    $this->render_text_field( $field );
                }
            }
            ?>

            <div class="mf-form-actions">
                <?php
                $submit_label = $settings['submit_label'] ?? __( 'Submit', 'members-forge' );
                ?>
                <button type="submit" name="mf_submit" class="mf-submit-button">
                    <?php echo esc_html( $submit_label ); ?>
                </button>
            </div>
        </form>
        <?php
    }

    private function render_text_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            ?>
            <input
                type="text"
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-text"
                value="<?php echo esc_attr( $this->submitted_value( $field ) ); ?>"
                placeholder="<?php echo esc_attr( $field['placeholder'] ?? '' ); ?>"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            >
            <?php
        } );
    }

    private function render_email_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            ?>
            <input
                type="email"
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-email"
                value="<?php echo esc_attr( $this->submitted_value( $field ) ); ?>"
                placeholder="<?php echo esc_attr( $field['placeholder'] ?? '' ); ?>"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            >
            <?php
        } );
    }

    private function render_password_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            ?>
            <input
                type="password"
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-password"
                placeholder="<?php echo esc_attr( $field['placeholder'] ?? '' ); ?>"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            >
            <?php
        } );
    }

    private function render_number_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            ?>
            <input
                type="number"
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-number"
                value="<?php echo esc_attr( $this->submitted_value( $field ) ); ?>"
                placeholder="<?php echo esc_attr( $field['placeholder'] ?? '' ); ?>"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            >
            <?php
        } );
    }

    private function render_textarea_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            ?>
            <textarea
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-textarea"
                placeholder="<?php echo esc_attr( $field['placeholder'] ?? '' ); ?>"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            ><?php echo esc_textarea( $this->submitted_value( $field ) ); ?></textarea>
            <?php
        } );
    }

    private function render_date_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            ?>
            <input
                type="date"
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-date"
                value="<?php echo esc_attr( $this->submitted_value( $field ) ); ?>"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            >
            <?php
        } );
    }

    private function render_select_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            $options = $field['options'] ?? [];
            $selected = $this->submitted_value( $field );
            ?>
            <select
                id="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                name="<?php echo esc_attr( $field['name'] ?? '' ); ?>"
                class="mf-input mf-input-select"
                <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
            >
                <option value=""><?php esc_html_e( 'Select...', 'members-forge' ); ?></option>
                <?php foreach ( $options as $option ) : ?>
                    <option value="<?php echo esc_attr( $option ); ?>" <?php selected( $selected, $option ); ?>>
                        <?php echo esc_html( $option ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <?php
        } );
    }

    private function render_radio_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            $options  = $field['options'] ?? [];
            $selected = $this->submitted_value( $field );
            $name     = esc_attr( $field['name'] ?? '' );
            ?>
            <div class="mf-radio-group">
                <?php foreach ( $options as $option ) : ?>
                    <label class="mf-radio-label">
                        <input
                            type="radio"
                            name="<?php echo $name; ?>"
                            value="<?php echo esc_attr( $option ); ?>"
                            class="mf-input mf-input-radio"
                            <?php checked( $selected, $option ); ?>
                            <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
                        >
                        <span><?php echo esc_html( $option ); ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
            <?php
        } );
    }

    private function render_checkbox_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            $options = $field['options'] ?? [];
            $name    = esc_attr( $field['name'] ?? '' );
            ?>
            <div class="mf-checkbox-group">
                <?php foreach ( $options as $option ) : ?>
                    <label class="mf-checkbox-label">
                        <input
                            type="checkbox"
                            name="<?php echo $name; ?>[]"
                            value="<?php echo esc_attr( $option ); ?>"
                            class="mf-input mf-input-checkbox"
                            <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
                        >
                        <span><?php echo esc_html( $option ); ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
            <?php
        } );
    }

    private function render_terms_field( array $field ): void {
        $this->field_wrapper( $field, function () use ( $field ) {
            $label = $field['label'] ?? __( 'I agree to the terms and conditions', 'members-forge' );
            ?>
            <label class="mf-checkbox-label mf-terms-label">
                <input
                    type="checkbox"
                    name="<?php echo esc_attr( $field['name'] ?? 'terms' ); ?>"
                    value="1"
                    class="mf-input mf-input-checkbox"
                    <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
                >
                <span><?php echo wp_kses_post( $label ); ?></span>
            </label>
            <?php
        } );
    }

    private function render_level_selector_field( array $field ): void {
        $levels = $this->get_membership_levels();
        $this->field_wrapper( $field, function () use ( $field, $levels ) {
            $selected = $this->submitted_value( $field );
            ?>
            <div class="mf-level-selector">
                <?php foreach ( $levels as $level ) : ?>
                    <label class="mf-level-option">
                        <input
                            type="radio"
                            name="<?php echo esc_attr( $field['name'] ?? 'level_id' ); ?>"
                            value="<?php echo esc_attr( $level->id ); ?>"
                            class="mf-input mf-input-radio"
                            <?php checked( $selected, (string) $level->id ); ?>
                            <?php echo ! empty( $field['required'] ) ? 'required' : ''; ?>
                        >
                        <span class="mf-level-name"><?php echo esc_html( $level->name ); ?></span>
                        <?php if ( ! empty( $level->price ) ) : ?>
                            <span class="mf-level-price">
                                <?php echo esc_html( sprintf( '$%s', $level->price ) ); ?>
                            </span>
                        <?php endif; ?>
                    </label>
                <?php endforeach; ?>
            </div>
            <?php
        } );
    }

    private function field_wrapper( array $field, callable $render ): void {
        $type     = $field['type'] ?? 'text';
        $required = ! empty( $field['required'] );
        $classes  = 'mf-field mf-field-type-' . esc_attr( $type );

        if ( $required ) {
            $classes .= ' mf-field-required';
        }
        ?>
        <div class="<?php echo $classes; ?>">
            <?php if ( 'terms' !== $type ) : ?>
                <label class="mf-label" for="mf-field-<?php echo esc_attr( $field['name'] ?? '' ); ?>">
                    <?php echo esc_html( $field['label'] ?? '' ); ?>
                    <?php if ( $required ) : ?>
                        <span class="mf-required">*</span>
                    <?php endif; ?>
                </label>
            <?php endif; ?>

            <?php $render(); ?>
        </div>
        <?php
    }

    private function submitted_value( array $field ): string {
        $name = $field['name'] ?? '';

        return isset( $_POST[ $name ] ) && is_string( $_POST[ $name ] )
            ? sanitize_text_field( wp_unslash( $_POST[ $name ] ) )
            : '';
    }

    private function get_membership_levels(): array {
        global $wpdb;

        $table = $wpdb->prefix . 'members_forge_levels';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id, name, price FROM {$table} WHERE status = %s ORDER BY priority ASC, name ASC",
                'active'
            )
        );

        return is_array( $results ) ? $results : [];
    }
}
