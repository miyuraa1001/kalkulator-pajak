Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')
$w = $img.Width
$h = $img.Height
Write-Output "Image size: $w x $h"

# Check corners
Write-Output "Corner (0,0): $($img.GetPixel(0,0))"
Write-Output "Corner (w-1,0): $($img.GetPixel($w-1,0))"
Write-Output "Corner (0,h-1): $($img.GetPixel(0,$h-1))"
Write-Output "Corner (w-1,h-1): $($img.GetPixel($w-1,$h-1))"

# Overall bounds (threshold 248)
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 0; $y -lt $h; $y += 2) {
    for ($x = 0; $x -lt $w; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 248 -or $c.G -lt 248 -or $c.B -lt 248) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Output "Subject bounds (threshold 248): X: $minX to $maxX, Y: $minY to $maxY"

# Check bottom rows for floor shadow (Y from 580 to 760)
Write-Output "Checking bottom rows Y 560..760 for shadow vs subjects:"
for ($y = 560; $y -lt 760; $y += 20) {
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

# Inspect the binder loops at the top of the calendar:
# Where is the top of the calendar?
# Purple header of calendar has strong purple color: R in 100..180, G in 50..120, B in 170..240
$calMinX = $w; $calMaxX = 0; $calMinY = $h; $calMaxY = 0
for ($y = 0; $y -lt $h; $y += 4) {
    for ($x = 0; $x -lt $w; $x += 4) {
        $c = $img.GetPixel($x, $y)
        if ($c.B -gt 160 -and $c.R -gt 90 -and $c.R -lt 190 -and $c.G -lt 120 -and ($c.B - $c.G) -gt 60) {
            if ($x -lt $calMinX) { $calMinX = $x }
            if ($x -gt $calMaxX) { $calMaxX = $x }
            if ($y -lt $calMinY) { $calMinY = $y }
            if ($y -gt $calMaxY) { $calMaxY = $y }
        }
    }
}
Write-Output "Purple calendar header bounds: X: $calMinX to $calMaxX, Y: $calMinY to $calMaxY"

$img.Dispose()

