<?php
namespace MembersForge\Tests\Unit;

use PHPUnit\Framework\TestCase;
use MembersForge\Plugin;

class PluginTest extends TestCase {
    protected function setUp(): void {
        parent::setUp();
        \Brain\Monkey\setUp();
    }

    protected function tearDown(): void {
        \Brain\Monkey\tearDown();
        parent::tearDown();
    }

    /** @test */
    public function it_can_be_instantiated(){
        $this->assertTrue( class_exists( Plugin::class ) );
    }
}