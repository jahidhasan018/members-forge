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
        add_shortcode( 'members_forge_form', [ $this, 'render' ] );
        add_action( 'template_redirect', [ $this, 'handle_submission' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ] );
    }

    public function enqueue_styles(): void {
        $handle = apply_filters( 'members_forge_frontend_style_handle', 'members-forge-frontend' );

        wp_enqueue_style(
            $handle,
            plugins_url( 'assets/src/frontend.css', MF_PLUGIN_FILE ),
            apply_filters( 'members_forge_frontend_style_deps', [] ),
            apply_filters( 'members_forge_frontend_style_version', '1.0.0' )
        );

        do_action( 'members_forge_after_enqueue_styles' );
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

        $form['fields']   = json_decode( $form['fields'] ?? '[]', true ) ?: [];
        $form['settings'] = json_decode( $form['settings'] ?? '{}', true ) ?: [];

        $submission = [];

        foreach ( $form['fields'] as $field ) {
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

        $submission = apply_filters( 'members_forge_submission_data', $submission, $form );

        do_action( 'members_forge_before_handle_submission', $form, $submission );

        $this->form_service->execute_actions( $form, $submission );

        do_action( 'members_forge_after_handle_submission', $form, $submission );

        $redirect_url = wp_get_referer() ?: home_url();
        $redirect_url = add_query_arg( 'mf_success', $key, remove_query_arg( 'mf_success', $redirect_url ) );
        $redirect_url = apply_filters( 'members_forge_redirect_url', $redirect_url, $form, $submission );

        wp_safe_redirect( $redirect_url );
        exit;
    }

    public function render( $atts ): string {
        $atts = shortcode_atts(
            apply_filters( 'members_forge_shortcode_defaults', [ 'key' => '', 'class' => '', 'title' => '' ] ),
            $atts,
            'mf_form'
        );

        $key = sanitize_title( $atts['key'] );

        if ( '' === $key ) {
            return '';
        }

        $form = $this->repository->get_by_key( $key );

        if ( ! $form || ( $form['status'] ?? '' ) !== 'active' ) {
            return '';
        }

        $form     = apply_filters( 'members_forge_form_data', $form, $key );
        $fields   = apply_filters( 'members_forge_form_fields', json_decode( $form['fields'] ?? '[]', true ) ?: [], $form );
        $settings = apply_filters( 'members_forge_form_settings', json_decode( $form['settings'] ?? '{}', true ) ?: [], $form );

        $submitted_key = sanitize_title( $_GET['mf_success'] ?? '' );
        $show_success  = '' !== $submitted_key && $submitted_key === $key;

        ob_start();

        do_action( 'members_forge_before_form_render', $form, $fields, $settings );

        if ( $show_success ) {
            $message = $settings['success_message'] ?? __( 'Form submitted successfully!', 'members-forge' );
            $this->render_success( $message );

            if ( ! empty( $settings['hide_after_submit'] ) ) {
                do_action( 'members_forge_after_form_render', $form, $fields, $settings );
                return ob_get_clean();
            }
        }

        $this->render_form( $form, $fields, $settings, $key, $atts );

        do_action( 'members_forge_after_form_render', $form, $fields, $settings );

        $output = ob_get_clean();

        return apply_filters( 'members_forge_form_html', $output, $form, $fields, $settings, $atts );
    }

    private function render_success( string $message ): void {
        $message = apply_filters( 'members_forge_success_message', $message );
        ?>
        <div class="mf-form-success" role="alert">
            <?php echo wp_kses_post( wpautop( $message ) ); ?>
        </div>
        <?php
    }

    private function render_form( array $form, array $fields, array $settings, string $key, array $atts ): void {
        $form_classes = apply_filters( 'members_forge_form_classes', [ 'mf-form', 'mf-form-' . $key ], $form, $settings );

        if ( ! empty( $atts['class'] ) ) {
            $form_classes[] = esc_attr( $atts['class'] );
        }
        ?>
        <form method="post" class="<?php echo esc_attr( implode( ' ', $form_classes ) ); ?>">
            <?php do_action( 'members_forge_form_top', $form, $settings ); ?>

            <?php wp_nonce_field( 'mf_submit_' . $key, 'mf_nonce' ); ?>
            <input type="hidden" name="mf_form_key" value="<?php echo esc_attr( $key ); ?>">

            <?php
            foreach ( $fields as $field ) {
                $field = apply_filters( 'members_forge_field_data', $field, $form );
                $type  = $field['type'] ?? 'text';

                $html = '';

                if ( method_exists( $this, 'render_' . $type . '_field' ) ) {
                    ob_start();
                    $this->{'render_' . $type . '_field'}( $field );
                    $html = ob_get_clean();
                }

                $html = apply_filters( 'members_forge_field_html', $html, $field, $form );

                if ( ! empty( $html ) ) {
                    echo $html;
                }
            }
            ?>

            <?php do_action( 'members_forge_form_before_submit', $form, $settings ); ?>

            <div class="mf-form-actions">
                <?php
                $submit_label = $settings['submit_label'] ?? __( 'Submit', 'members-forge' );
                $submit_html  = sprintf(
                    '<button type="submit" name="mf_submit" class="%s">%s</button>',
                    esc_attr( apply_filters( 'members_forge_submit_button_class', 'mf-submit-button', $form, $settings ) ),
                    esc_html( $submit_label )
                );
                echo apply_filters( 'members_forge_submit_button_html', $submit_html, $form, $settings, $submit_label );
                ?>
            </div>

            <?php do_action( 'members_forge_form_bottom', $form, $settings ); ?>
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
                <?php do_action( 'members_forge_field_attributes', $field, 'text' ); ?>
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
                <?php do_action( 'members_forge_field_attributes', $field, 'email' ); ?>
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
                <?php do_action( 'members_forge_field_attributes', $field, 'password' ); ?>
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
                <?php do_action( 'members_forge_field_attributes', $field, 'number' ); ?>
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
                <?php do_action( 'members_forge_field_attributes', $field, 'textarea' ); ?>
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
                <?php echo ! empty( $field['min_date'] ) ? 'min="' . esc_attr( $field['min_date'] ) . '"' : ''; ?>
                <?php echo ! empty( $field['max_date'] ) ? 'max="' . esc_attr( $field['max_date'] ) . '"' : ''; ?>
                <?php do_action( 'members_forge_field_attributes', $field, 'date' ); ?>
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
                <?php do_action( 'members_forge_field_attributes', $field, 'select' ); ?>
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
                            <?php do_action( 'members_forge_field_attributes', $field, 'radio', $option ); ?>
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
                            <?php do_action( 'members_forge_field_attributes', $field, 'checkbox', $option ); ?>
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
                    <?php do_action( 'members_forge_field_attributes', $field, 'terms' ); ?>
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
                            <?php do_action( 'members_forge_field_attributes', $field, 'level_selector', $level ); ?>
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
        $classes  = apply_filters( 'members_forge_field_classes', [ 'mf-field', 'mf-field-type-' . $type ], $field );

        if ( $required ) {
            $classes[] = 'mf-field-required';
        }
        ?>
        <div class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>">
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

        return apply_filters( 'members_forge_membership_levels', is_array( $results ) ? $results : [] );
    }
}
