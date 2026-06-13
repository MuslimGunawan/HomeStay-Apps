<?php
// Disable output buffering to ensure every echo is sent immediately
while (ob_get_level()) {
    ob_end_clean();
}
ob_implicit_flush(true);

header('Content-Type: text/plain');

echo "Step 1: Starting test-kernel.php\n";
flush();

require __DIR__.'/../vendor/autoload.php';
echo "Step 2: Autoloader loaded successfully!\n";
flush();

$app = require_once __DIR__.'/../bootstrap/app.php';
echo "Step 3: bootstrap/app.php loaded successfully!\n";
flush();

// We will register a shutdown function to see if we can catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null) {
        echo "\nSHUTDOWN ERROR: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line'] . "\n";
    } else {
        echo "\nScript ended during kernel testing.\n";
    }
});

echo "Step 4: Attempting to resolve HTTP Kernel...\n";
flush();
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
echo "Step 5: HTTP Kernel resolved successfully!\n";
flush();

echo "Step 6: Attempting to handle request (booting providers & routing)...\n";
flush();
$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);
echo "Step 7: Request handled successfully! HTTP Status: " . $response->getStatusCode() . "\n";
echo "\n--- RESPONSE CONTENT START ---\n";
$content = $response->getContent();
// Strip huge CSS style tags and SVGs to make the output human-readable
$contentClean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '[STYLE BLOCKED FOR CLARITY]', $content);
$contentClean = preg_replace('/<svg\b[^>]*>(.*?)<\/svg>/is', '[SVG BLOCKED]', $contentClean);
echo $contentClean;
echo "\n--- RESPONSE CONTENT END ---\n";
flush();
