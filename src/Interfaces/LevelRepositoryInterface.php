<?php
namespace MembersForge\Interfaces;

interface LevelRepositoryInterface {
    public function create( array $data ): int|false;
    public function get_levels(): array;
}