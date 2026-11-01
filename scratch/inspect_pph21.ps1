Add-Type -AssemblyName System.Drawing

$file = "assets\images\kpi\pph21-hero.png"
$bmp = New-Object System.Drawing.Bitmap($file)
Write-Output "Size: $($bmp.Width) x $($bmp.Height)"

# Check pixels at the bottom
$w = $bmp.Width
$h = $bmp.Height
Write-Output "Checking bottom 30 rows..."
for ($y = $h - 30; $y -lt $h; $y += 5) {
    $nonZero = 0
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 10) { $nonZero++ }
    }
    Write-Output "Row ${y} : $nonZero opaque pixels"
}

$bmp.Dispose()
