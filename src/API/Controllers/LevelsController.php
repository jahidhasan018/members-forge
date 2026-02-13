<?php
namespace MembersForge\API\Controllers;

use MembersForge\API\AbstractController;
use MembersForge\Interfaces\LevelRepositoryInterface;
use WP_REST_Request;

/**
 * Levels REST API Controller
 * 
 * Handles all membership level related API endpoints.
 */
class LevelsController extends AbstractController {

    /**
     * @var LevelRepositoryInterface
     */
    private $repository;

    /**
     * * @param LevelRepository $repository
     */
    public function __construct( LevelRepositoryInterface $repository ){
        $this->repository = $repository;
    }

    /**
     * GET /levels - Retrieve all membership levels
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_items( WP_REST_Request $request ){
        $levels = $this->repository->get_levels();

        return $this->success_response( $levels );
    }
}