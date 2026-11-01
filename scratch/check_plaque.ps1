Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')

# Plaque color is orange (e.g., R ~ 210..245, G ~ 100..150, B ~ 40..70)
$minX = 1024; $maxX = 0; $minY = 764; $maxY = 0;
for ($y = 600; $y -lt 764; $y++) {
    for ($x = 200; $x -lt 800; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -gt 80 -and $c.G -lt 160 -and $c.B -lt 80) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Plaque bounds: X=$minX..$maxX, Y=$minY..$maxY"
$img.Dispose()

