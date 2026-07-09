<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

$file = __DIR__.'/../storage/app/public/receipts/stYxp5xxBZtkYCpLlgk33T3uhsTOhDZO0anWmkGx.jpg';

if (file_exists($file)) {
    header('Content-Type: image/jpeg');
    readfile($file);
    exit;
} else {
    echo '<h1>Image Not Found</h1>';
    echo "<p>Looked at path: <code>$file</code></p>";

    // Scan the receipts directory to list files
    $dir = __DIR__.'/../storage/app/public/receipts';
    if (is_dir($dir)) {
        echo '<p>Actual files in receipts folder:</p><ul>';
        $files = scandir($dir);
        foreach ($files as $f) {
            if ($f === '.' || $f === '..') {
                continue;
            }
            echo "<li>$f</li>";
        }
        echo '</ul>';
    } else {
        echo '<p>Receipts folder does not exist!</p>';
    }
}
