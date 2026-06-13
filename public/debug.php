<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Yuri-HomeStay Debugger</h1>";
echo "<p>PHP Version: " . PHP_VERSION . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

echo "<h2>Testing Autoloader...</h2>";
try {
    $autoloaderPath = __DIR__.'/../vendor/autoload.php';
    if (!file_exists($autoloaderPath)) {
        throw new Exception("vendor/autoload.php not found at target path: " . $autoloaderPath);
    }
    require $autoloaderPath;
    echo "<p style='color: green;'>✓ Autoloader loaded successfully!</p>";
} catch (Throwable $e) {
    echo "<p style='color: red;'>✗ Autoloader failed: " . $e->getMessage() . "</p>";
    echo "<p>File: " . $e->getFile() . " on line " . $e->getLine() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    exit;
}

echo "<h2>Testing Laravel Bootstrapping...</h2>";
try {
    $bootstrapPath = __DIR__.'/../bootstrap/app.php';
    if (!file_exists($bootstrapPath)) {
        throw new Exception("bootstrap/app.php not found at target path: " . $bootstrapPath);
    }
    $app = require_once $bootstrapPath;
    echo "<p style='color: green;'>✓ Laravel App instance created successfully!</p>";
    
    echo "<h2>Testing Kernel resolution...</h2>";
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    echo "<p style='color: green;'>✓ Kernel resolved successfully!</p>";
} catch (Throwable $e) {
    echo "<p style='color: red;'>✗ Bootstrapping failed: " . $e->getMessage() . "</p>";
    echo "<p>File: " . $e->getFile() . " on line " . $e->getLine() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
