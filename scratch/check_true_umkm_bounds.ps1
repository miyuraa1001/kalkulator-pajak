Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

Write-Output "Sampling top border (Y=0..5, X=0, 200, 500, 800, 1023):"
foreach ($x in @(0, 200, 500, 800, 1023)) {
    $c = $img.GetPixel($x, 0)
    Write-Output "($x, 0): R=$($c.R) G=$($c.G) B=$($c.B)"
}

Write-Output "Sampling left border (X=0..5, Y=100, 300, 500, 700):"
foreach ($y in @(100, 300, 500, 700)) {
    $c = $img.GetPixel(0, $y)
    Write-Output "(0, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Find true subject bounds by checking diff > 15 or R < 235:
$minX = $img.Width; $maxX = 0; $minY = $img.Height; $maxY = 0
for ($y = 0; $y -lt $img.Height; $y += 2) {
    for ($x = 0; $x -lt $img.Width; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 235 -or $diff -gt 15) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Output "True subject bounds (R < 235 or diff > 15): X: $minX to $maxX, Y: $minY to $maxY"

$img.Dispose()

