<?php
/**
 * Create User Action
 *
 * Creates a WordPress user account from form submission data.
 * Handles username/email/password generation with sensible fallbacks.
 *
 * @package MembersForge\Forms\Actions
 * @since 1.0.0
 */

namespace MembersForge\Forms\Actions;

class CreateUserAction implements FormActionInterface {

    /**
     * Create a WordPress user from the submission data.
     *
     * Expected submission keys:
     * - email       (string) User email address.
     * - username    (string) Optional. Falls back to email.
     * - password    (string) Optional. Auto-generated if empty.
     * - first_name  (string) Optional.
     * - last_name   (string) Optional.
     *
     * @param array $form       The form configuration.
     * @param array $submission Key-value pairs of submitted field values.
     * @return void
     */
    public function execute( array $form, array $submission ): void {
        $email    = sanitize_email( $submission['email'] ?? '' );
        $username = ! empty( $submission['username'] )
            ? sanitize_user( $submission['username'], true )
            : $email;

        if ( empty( $email ) ) {
            return;
        }

        $password = ! empty( $submission['password'] )
            ? $submission['password']
            : wp_generate_password( 16, true );

        $user_data = [
            'user_login'   => $username,
            'user_email'   => $email,
            'user_pass'    => $password,
            'display_name' => sanitize_text_field( $submission['first_name'] ?? '' )
                . ' ' . sanitize_text_field( $submission['last_name'] ?? '' ),
            'first_name'   => sanitize_text_field( $submission['first_name'] ?? '' ),
            'last_name'    => sanitize_text_field( $submission['last_name'] ?? '' ),
        ];

        $user_data = array_filter( $user_data );

        $user_id = wp_insert_user( $user_data );

        if ( is_wp_error( $user_id ) ) {
            do_action(
                'members_forge_create_user_failed',
                $user_id->get_error_message(),
                $submission
            );

            return;
        }

        do_action( 'members_forge_user_created', $user_id, $form, $submission );
    }
}
