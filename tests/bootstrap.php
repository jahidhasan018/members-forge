<?php
/**
 * PHPUnit Bootstrap File
 */

// ১. কম্পোজার অটোলৌডার লোড করা
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// ২. Brain Monkey সেটআপ (WordPress ফাংশন মক করার জন্য)
Brain\Monkey\setUp();