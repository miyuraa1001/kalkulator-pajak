Add-Type -AssemblyName System.Drawing

$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793510318714_8be3a23d.jpg"
$img = [System.Drawing.Bitmap]::FromFile($src)
$w = $img.Width
$h = $img.Height

Write-Output "Image size: $w x $h"
Write-Output "Corner (0,0): $($img.GetPixel(0,0))"
Write-Output "Corner (w-1,0): $($img.GetPixel($w-1,0))"
Write-Output "Corner (0,h-1): $($img.GetPixel(0,$h-1))"
Write-Output "Corner (w-1,h-1): $($img.GetPixel($w-1,$h-1))"

# Check borders
Write-Output "Top border samples:"
for ($x = 0; $x -lt $w; $x += 200) {
    $c = $img.GetPixel($x, 0)
    Write-Output "($x, 0): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Find bounds of subject (R < 242 or maxDiff > 12)
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)
        $r = $c.R; $g = $c.G; $b = $c.B
        $diff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
        if ($r -lt 242 -or $g -lt 242 -or $b -lt 242 -or $diff -gt 12) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Output "Subject bounds (R < 242 or diff > 12): X: $minX to $maxX, Y: $minY to $maxY"

# Check bottom rows Y=580..760 for shadow vs subjects
Write-Output "Checking bottom rows Y 580..760:"
for ($y = 580; $y -le 760; $y += 10) {
    $grayCount = 0
    $colorCount = 0
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)
        $r = $c.R; $g = $c.G; $b = $c.B
        $diff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
        if ($r -lt 244 -and $diff -le 14) { $grayCount++ }
        if ($diff -gt 15) { $colorCount++ }
    }
    Write-Output "Y=$($y): Neutral/Gray (Shadow)=$grayCount, Colored/Subject=$colorCount"
}

$img.Dispose()
