<?php
namespace MembersForge\API\Controllers;

use MembersForge\Core\LevelRepository;
use WP_REST_Request;

class LevelsController {

    /**
     * @var LevelRepository
     */
    private $repository;

    /**
     * * @param LevelRepository $repository
     */
    public function __construct( LevelRepository $repository ){
        $this->repository = $repository;
    }

    /**
     * API Endpoint: GET /levels
     */
    public function get_items( WP_REST_Request $request ){
        $levels = $this->repository->get_levels();

        return rest_ensure_response( $levels );
    }
}