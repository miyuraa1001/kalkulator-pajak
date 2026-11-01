Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg')
$w = $img.Width
$h = $img.Height
Write-Output "Image size: $w x $h"

# Find bounds of non-white pixels
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0

for ($y = 0; $y -lt $h; $y += 2) {
    for ($x = 0; $x -lt $w; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $isNotWhite = ($c.R -lt 248 -or $c.G -lt 248 -or $c.B -lt 248)
        if ($isNotWhite) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Subject bounds (threshold 248): X: $minX to $maxX, Y: $minY to $maxY"

# Check corners
Write-Output "Corner (0,0): $($img.GetPixel(0,0))"
Write-Output "Corner (w-1,0): $($img.GetPixel($w-1,0))"
Write-Output "Corner (0,h-1): $($img.GetPixel(0,$h-1))"
Write-Output "Corner (w-1,h-1): $($img.GetPixel($w-1,$h-1))"

# Check bottom rows for any shadow
for ($y = 560; $y -le 660; $y += 10) {
    $dark = 0
    for ($x = 200; $x -le 800; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) { $dark++ }
    }
    Write-Output "Y=$($y): non-white pixels = $dark"
}

$img.Dispose()

