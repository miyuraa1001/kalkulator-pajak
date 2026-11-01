Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

Write-Output "Finding all non-white features in X > 600, Y < 400:"
$dMinX = 1000; $dMaxX = 0; $dMinY = 1000; $dMaxY = 0

for ($y = 0; $y -lt 400; $y += 2) {
    for ($x = 600; $x -lt $img.Width; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 240 -or $diff -gt 15) {
            if ($x -lt $dMinX) { $dMinX = $x }
            if ($x -gt $dMaxX) { $dMaxX = $x }
            if ($y -lt $dMinY) { $dMinY = $y }
            if ($y -gt $dMaxY) { $dMaxY = $y }
        }
    }
}
Write-Output "Upper-right features bounds: X: $dMinX to $dMaxX, Y: $dMinY to $dMaxY"

$img.Dispose()

