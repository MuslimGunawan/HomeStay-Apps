<?php
// Disable output buffering to ensure every echo is sent immediately
while (ob_get_level()) {
    ob_end_clean();
}
ob_implicit_flush(true);

header('Content-Type: text/plain');

echo "Step 1: Starting test-loader.php\n";
flush();

$autoloaderPath = __DIR__.'/../vendor/autoload.php';
echo "Step 2: Autoloader path is " . $autoloaderPath . "\n";
flush();

if (file_exists($autoloaderPath)) {
    echo "Step 3: Autoloader file exists. Loading it now...\n";
    flush();
    
    // We will register a shutdown function to see if we can catch fatal errors
    register_shutdown_function(function() {
        $error = error_get_last();
        if ($error !== null) {
            echo "\nSHUTDOWN ERROR: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line'] . "\n";
        } else {
            echo "\nScript ended.\n";
        }
    });

    require $autoloaderPath;
    echo "Step 4: Autoloader loaded successfully!\n";
    flush();
} else {
    echo "Step 3: Autoloader file does not exist!\n";
    flush();
}
