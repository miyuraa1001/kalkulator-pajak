Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path 'scratch/test_pph25_clean.png'))
$w = $img.Width
$h = $img.Height

Write-Output "Finding all non-transparent pixels in bottom rows Y = 500..$($h-1):"
for ($y = 500; $y -lt $h; $y += 2) {
    $nonTrans = 0
    $minX = $w; $maxX = 0
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 0) {
            $nonTrans++
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
        }
    }
    if ($nonTrans -gt 0) {
        Write-Output "Y=$($y): count=$nonTrans, X range=$minX..$maxX"
    }
}

$img.Dispose()

