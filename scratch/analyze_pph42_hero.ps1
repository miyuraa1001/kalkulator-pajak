Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793510244086_d7aa53bb.jpg')
$w = $img.Width
$h = $img.Height
Write-Output "Image size: $w x $h"

# Check corners
Write-Output "Corner (0,0): $($img.GetPixel(0,0))"
Write-Output "Corner (w-1,0): $($img.GetPixel($w-1,0))"
Write-Output "Corner (0,h-1): $($img.GetPixel(0,$h-1))"
Write-Output "Corner (w-1,h-1): $($img.GetPixel($w-1,$h-1))"

# Check border sampling
Write-Output "Top border sampling:"
foreach ($x in @(0, 200, 500, 800, 1023)) {
    $c = $img.GetPixel($x, 0)
    Write-Output "($x, 0): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Overall bounds (diff > 15 or R < 240)
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 0; $y -lt $h; $y += 2) {
    for ($x = 0; $x -lt $w; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 240 -or $diff -gt 15) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Output "Subject bounds (R < 240 or diff > 15): X: $minX to $maxX, Y: $minY to $maxY"

# Check bottom rows for floor shadow (Y from 650 to 760)
Write-Output "Checking bottom rows Y 660..760 for shadow vs subjects:"
for ($y = 660; $y -lt 760; $y += 10) {
    $darkCount = 0
    $colorCount = 0
    for ($x = 100; $x -lt 900; $x += 5) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 245) {
            if ($diff -lt 15) { $darkCount++ } else { $colorCount++ }
        }
    }
    Write-Output "Y=$($y): Neutral/Gray (Shadow)=$darkCount, Colored/Subject=$colorCount"
}

# Check key hole on upper-left:
# Key is roughly X: 120..220, Y: 220..360
# Look for gold key pixels and hole:
$kMinX = $w; $kMaxX = 0; $kMinY = $h; $kMaxY = 0
for ($y = 200; $y -le 380; $y += 2) {
    for ($x = 100; $x -le 240; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -gt 130 -and $c.B -lt 100 -and ($c.R - $c.B) -gt 70) {
            if ($x -lt $kMinX) { $kMinX = $x }
            if ($x -gt $kMaxX) { $kMaxX = $x }
            if ($y -lt $kMinY) { $kMinY = $y }
            if ($y -gt $kMaxY) { $kMaxY = $y }
        }
    }
}
Write-Output "Golden key bounds: X: $kMinX to $kMaxX, Y: $kMinY to $kMaxY"

$img.Dispose()

