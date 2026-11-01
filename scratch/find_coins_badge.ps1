Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793506229955_1b54136b.jpg')

# Gold coin colors: R in 180..245, G in 130..200, B in 40..110, (R - B) > 60
$cMinX = 1000; $cMaxX = 0; $cMinY = 1000; $cMaxY = 0
for ($y = 0; $y -lt $img.Height; $y += 2) {
    for ($x = 0; $x -lt 400; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -gt 130 -and $c.B -lt 120 -and ($c.R - $c.B) -gt 70) {
            if ($x -lt $cMinX) { $cMinX = $x }
            if ($x -gt $cMaxX) { $cMaxX = $x }
            if ($y -lt $cMinY) { $cMinY = $y }
            if ($y -gt $cMaxY) { $cMaxY = $y }
        }
    }
}
Write-Output "Left gold coin bounds: X: $cMinX to $cMaxX, Y: $cMinY to $cMaxY"

# Right gold coin bounds:
$rMinX = 1000; $rMaxX = 0; $rMinY = 1000; $rMaxY = 0
for ($y = 0; $y -lt $img.Height; $y += 2) {
    for ($x = 600; $x -lt $img.Width; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -gt 130 -and $c.B -lt 120 -and ($c.R - $c.B) -gt 70) {
            if ($x -lt $rMinX) { $rMinX = $x }
            if ($x -gt $rMaxX) { $rMaxX = $x }
            if ($y -lt $rMinY) { $rMinY = $y }
            if ($y -gt $rMaxY) { $rMaxY = $y }
        }
    }
}
Write-Output "Right gold coin bounds: X: $rMinX to $rMaxX, Y: $rMinY to $rMaxY"

$img.Dispose()

