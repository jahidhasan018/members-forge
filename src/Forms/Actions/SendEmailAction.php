<?php
/**
 * Send Email Action
 *
 * Sends email notifications after form submission.
 * Supports welcome emails and custom email templates
 * defined in the form settings.
 *
 * @package MembersForge\Forms\Actions
 * @since 1.0.0
 */

namespace MembersForge\Forms\Actions;

class SendEmailAction implements FormActionInterface {

    /**
     * Default email subject if none is configured.
     *
     * @var string
     */
    private const DEFAULT_SUBJECT = 'Thank you for your submission';

    /**
     * Send a notification email to the submitter.
     *
     * Uses form settings for custom subject, message, and recipient.
     * Falls back to the submitter's email address from the form data.
     *
     * @param array $form       The form configuration.
     * @param array $submission Key-value pairs of submitted field values.
     * @return void
     */
    public function execute( array $form, array $submission ): void {
        $settings   = $form['settings'] ?? [];
        $to         = ! empty( $settings['notification_email'] )
            ? sanitize_email( $settings['notification_email'] )
            : sanitize_email( $submission['email'] ?? '' );

        if ( empty( $to ) ) {
            return;
        }

        $subject = ! empty( $settings['email_subject'] )
            ? sanitize_text_field( $settings['email_subject'] )
            : self::DEFAULT_SUBJECT;

        $message = $this->build_message( $form, $submission );

        $sent = wp_mail( $to, $subject, $message );

        do_action( 'members_forge_email_sent', $sent, $to, $form, $submission );
    }

    /**
     * Build the email message body from form fields and submission data.
     *
     * @param array $form       The form configuration.
     * @param array $submission Key-value pairs of submitted field values.
     * @return string Plain-text email body.
     */
    private function build_message( array $form, array $submission ): string {
        $settings = $form['settings'] ?? [];
        $fields   = $form['fields'] ?? [];

        if ( ! empty( $settings['email_message'] ) ) {
            return wp_kses_post( $settings['email_message'] );
        }

        $lines = [ sprintf( 'Form: %s', $form['name'] ?? '' ), '' ];

        foreach ( $fields as $field ) {
            $name  = $field['name'] ?? '';
            $label = $field['label'] ?? $name;
            $value = $submission[ $name ] ?? '';

            if ( is_array( $value ) ) {
                $value = implode( ', ', $value );
            }

            $lines[] = sprintf( '%s: %s', $label, $value );
        }

        return implode( "\n", $lines );
    }
}
