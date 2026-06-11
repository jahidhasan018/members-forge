<?php
namespace MembersForge\Services;

use MembersForge\Interfaces\FormRepositoryInterface;

class FormService {
    private FormRepositoryInterface $repository;
    public function __construct( FormRepositoryInterface $repository){
        $this->repository = $repository;
    }

    /**
     * Return all forms from the database
     * @return array
     */
    public function get_all_forms(): array {
        $forms = $this->repository->get_all();
        $data = $this->normalize_forms($forms);
        return $data;
    }

    /**
     * Get a form by id
     * @param int $id
     * @return ?array
     */
    public function get_form_by_id( int $id ): ?array {
        if( !empty( $id )){
            $form = $this->repository->get_by_id($id);
            return $form;
        }
        return [];
    }

    public function validate_form_payload( array $payload ): array {
        $errors = [];

        foreach( $payload as $key => $value ){
            if( !in_array($key, $this->repository::ALLOWED_COLUMNS, true)){
                $errors[] = "{$key} is not allowed";
            }
        }

        return [
            'valide'    => empty($errors),
            'errors'    => $errors
        ];
    }

    /**
     * Normalize forms.
     *
     * @param array $forms
     * @return array
     */
    private function normalize_forms( array $forms ): array {
        $json_fields = [ 'fields', 'settings' ];

        foreach ( $forms as &$form ) {
            foreach ( $json_fields as $field ) {
                if ( isset( $form[ $field ] ) && is_string( $form[ $field ] ) ) {
                    $form[ $field ] = json_decode( $form[ $field ], true );
                }
            }
        }

        return $forms;
    }
}