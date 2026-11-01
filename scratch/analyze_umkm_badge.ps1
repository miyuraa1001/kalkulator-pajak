Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508084250_ca5439a2.jpg')
$w = $img.Width
$h = $img.Height
Write-Output "Image size: $w x $h"

# Check corners
Write-Output "Corner (0,0): $($img.GetPixel(0,0))"
Write-Output "Corner (w-1,0): $($img.GetPixel($w-1,0))"
Write-Output "Corner (0,h-1): $($img.GetPixel(0,$h-1))"
Write-Output "Corner (w-1,h-1): $($img.GetPixel($w-1,$h-1))"

# Check border sampling
Write-Output "Border sampling:"
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

# Check bottom rows for floor shadow (Y from 540 to 760)
Write-Output "Checking bottom rows Y 540..740 for shadow vs subjects:"
for ($y = 540; $y -lt 740; $y += 20) {
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

$img.Dispose()

