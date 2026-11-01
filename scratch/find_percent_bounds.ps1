Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg')

# Find blue pixels in the whole % symbol:
# Blue color of %: R in 80..180, G in 130..210, B in 200..255, and B > R + 40
Write-Output "Finding blue bounds of % symbol:"
$pMinX = 1024; $pMaxX = 0; $pMinY = 764; $pMaxY = 0

for ($y = 150; $y -le 600; $y += 2) {
    for ($x = 300; $x -le 700; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.B -gt 190 -and $c.B -gt ($c.R + 40) -and $c.G -gt 120 -and $c.G -lt 220) {
            if ($x -lt $pMinX) { $pMinX = $x }
            if ($x -gt $pMaxX) { $pMaxX = $x }
            if ($y -lt $pMinY) { $pMinY = $y }
            if ($y -gt $pMaxY) { $pMaxY = $y }
        }
    }
}

Write-Output "% symbol blue bounds: X: $pMinX to $pMaxX, Y: $pMinY to $pMaxY"

# Let's find the two circles of %:
# Circle 1 (upper):
$c1MinX = 1024; $c1MaxX = 0; $c1MinY = 764; $c1MaxY = 0
for ($y = 200; $y -le 350; $y += 2) {
    for ($x = 350; $x -le 480; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.B -gt 190 -and $c.B -gt ($c.R + 40) -and $c.G -gt 120 -and $c.G -lt 220) {
            if ($x -lt $c1MinX) { $c1MinX = $x }
            if ($x -gt $c1MaxX) { $c1MaxX = $x }
            if ($y -lt $c1MinY) { $c1MinY = $y }
            if ($y -gt $c1MaxY) { $c1MaxY = $y }
        }
    }
}
Write-Output "Upper circle of %: X: $c1MinX to $c1MaxX, Y: $c1MinY to $c1MaxY"

# Circle 2 (lower):
$c2MinX = 1024; $c2MaxX = 0; $c2MinY = 764; $c2MaxY = 0
for ($y = 350; $y -le 520; $y += 2) {
    for ($x = 450; $x -le 600; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.B -gt 190 -and $c.B -gt ($c.R + 40) -and $c.G -gt 120 -and $c.G -lt 220) {
            if ($x -lt $c2MinX) { $c2MinX = $x }
            if ($x -gt $c2MaxX) { $c2MaxX = $x }
            if ($y -lt $c2MinY) { $c2MinY = $y }
            if ($y -gt $c2MaxY) { $c2MaxY = $y }
        }
    }
}
Write-Output "Lower circle of %: X: $c2MinX to $c2MaxX, Y: $c2MinY to $c2MaxY"

$img.Dispose()

