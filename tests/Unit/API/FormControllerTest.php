<?php
namespace MembersForge\Tests\Unit\API;

use PHPUnit\Framework\TestCase;

class FormControllerTest extends TestCase {

    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
}