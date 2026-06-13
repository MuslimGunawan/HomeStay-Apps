<?php
// Disable output buffering to ensure every echo is sent immediately
while (ob_get_level()) {
    ob_end_clean();
}
ob_implicit_flush(true);

header('Content-Type: text/plain');

echo "Step 1: Starting test-bootstrap.php\n";
flush();

require __DIR__.'/../vendor/autoload.php';
echo "Step 2: Autoloader loaded successfully!\n";
flush();

echo "Step 3: Attempting to load bootstrap/app.php...\n";
flush();

// We will register a shutdown function to see if we can catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null) {
        echo "\nSHUTDOWN ERROR: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line'] . "\n";
    } else {
        echo "\nScript ended during bootstrap.\n";
    }
});

$app = require_once __DIR__.'/../bootstrap/app.php';
echo "Step 4: bootstrap/app.php loaded successfully!\n";
flush();
