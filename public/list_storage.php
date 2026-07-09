<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo '<h1>Storage Diagnostics</h1>';

$dirs = [
    'storage' => __DIR__.'/../storage',
    'storage/app' => __DIR__.'/../storage/app',
    'storage/app/public' => __DIR__.'/../storage/app/public',
    'storage/app/public/receipts' => __DIR__.'/../storage/app/public/receipts',
];

foreach ($dirs as $name => $path) {
    echo "<h3>Checking $name ($path):</h3>";
    if (! file_exists($path)) {
        echo "<p style='color:red;'>✗ Does not exist!</p>";

        continue;
    }
    echo "<p style='color:green;'>✓ Exists</p>";
    echo '<p>Permissions: '.substr(sprintf('%o', fileperms($path)), -4).'</p>';
    echo '<p>Writable: '.(is_writable($path) ? 'Yes' : 'No').'</p>';

    if (is_dir($path)) {
        $files = scandir($path);
        echo '<p>Contents ('.(count($files) - 2).' items):</p><ul>';
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            $filePath = $path.'/'.$file;
            $size = filesize($filePath);
            echo "<li>$file (".number_format($size).' bytes) - Writable: '.(is_writable($filePath) ? 'Yes' : 'No').'</li>';
        }
        echo '</ul>';
    }
}
