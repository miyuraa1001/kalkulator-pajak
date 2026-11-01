Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Check bounds of pixels with any color or darkness
$w = $img.Width
$h = $img.Height

$minX = $w; $maxX = 0; $minY = $h; $maxY = 0

for ($y = 0; $y -lt $h; $y += 2) {
    for ($x = 0; $x -lt $w; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        $isNotWhite = ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245)
        if ($isNotWhite) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Overall bounds (threshold 245): X: $minX to $maxX, Y: $minY to $maxY"

# Let's inspect the gear centers and handle
# Where is the blue gear? Let's find blue pixels (B > R + 40 and B > G + 20)
$blueMinX = $w; $blueMaxX = 0; $blueMinY = $h; $blueMaxY = 0
for ($y = 0; $y -lt $h; $y += 4) {
    for ($x = 0; $x -lt $w; $x += 4) {
        $c = $img.GetPixel($x, $y)
        if ($c.B -gt ($c.R + 40) -and $c.B -gt ($c.G + 15)) {
            if ($x -lt $blueMinX) { $blueMinX = $x }
            if ($x -gt $blueMaxX) { $blueMaxX = $x }
            if ($y -lt $blueMinY) { $blueMinY = $y }
            if ($y -gt $blueMaxY) { $blueMaxY = $y }
        }
    }
}
Write-Output "Blue gear bounds: X: $blueMinX to $blueMaxX, Y: $blueMinY to $blueMaxY"
$blueCenterX = [int](($blueMinX + $blueMaxX) / 2)
$blueCenterY = [int](($blueMinY + $blueMaxY) / 2)
Write-Output "Blue gear center sample ($blueCenterX, $blueCenterY): $($img.GetPixel($blueCenterX, $blueCenterY))"

# Check briefcase handle
# Briefcase top is around Y ~ 350? Let's check brown pixels
$brownMinX = $w; $brownMaxX = 0; $brownMinY = $h; $brownMaxY = 0
for ($y = 0; $y -lt $h; $y += 4) {
    for ($x = 0; $x -lt $w; $x += 4) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 100 -and $c.R -lt 200 -and $c.G -gt 50 -and $c.G -lt 140 -and $c.B -gt 40 -and $c.B -lt 110 -and ($c.R - $c.B) -gt 30) {
            if ($x -lt $brownMinX) { $brownMinX = $x }
            if ($x -gt $brownMaxX) { $brownMaxX = $x }
            if ($y -lt $brownMinY) { $brownMinY = $y }
            if ($y -gt $brownMaxY) { $brownMaxY = $y }
        }
    }
}
Write-Output "Briefcase bounds: X: $brownMinX to $brownMaxX, Y: $brownMinY to $brownMaxY"

# Check bottom rows for floor shadow (Y from 600 to 763)
Write-Output "Checking bottom rows Y 580..760 for shadow vs subjects:"
for ($y = 580; $y -lt 760; $y += 20) {
    $darkCount = 0
    $colorCount = 0
    for ($x = 100; $x -lt 900; $x += 5) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 240) {
            if ($diff -lt 15) { $darkCount++ } else { $colorCount++ }
        }
    }
    Write-Output "Y=$($y): Neutral/Gray (Shadow)=$darkCount, Colored/Subject=$colorCount"
}

$img.Dispose()
