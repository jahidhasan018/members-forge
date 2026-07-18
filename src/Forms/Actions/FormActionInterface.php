<?php
/**
 * Form Action Interface
 *
 * Defines the contract for form submission actions such as
 * creating a user or sending an email. Each action is executed
 * after a form submission is validated.
 *
 * @package MembersForge\Forms\Actions
 * @since 1.0.0
 */

namespace MembersForge\Forms\Actions;

interface FormActionInterface {

    /**
     * Execute the action with form and submission data.
     *
     * @param array $form       The form configuration (fields, settings, etc.).
     * @param array $submission Key-value pairs of submitted field values.
     * @return void
     */
    public function execute( array $form, array $submission ): void;
}
