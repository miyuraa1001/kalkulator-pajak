Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

# Document bounds (X in 150..310, Y in 350..500):
$dMinX = 1000; $dMaxX = 0; $dMinY = 1000; $dMaxY = 0
for ($y = 350; $y -le 500; $y++) {
    for ($x = 150; $x -le 310; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            if ($x -lt $dMinX) { $dMinX = $x }
            if ($x -gt $dMaxX) { $dMaxX = $x }
            if ($y -lt $dMinY) { $dMinY = $y }
            if ($y -gt $dMaxY) { $dMaxY = $y }
        }
    }
}
Write-Output "Document true bounds: X: $dMinX to $dMaxX, Y: $dMinY to $dMaxY"

# Chart card bounds (X in 660..860, Y in 450..550):
$cMinX = 1000; $cMaxX = 0; $cMinY = 1000; $cMaxY = 0
for ($y = 450; $y -le 550; $y++) {
    for ($x = 660; $x -le 860; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            if ($x -lt $cMinX) { $cMinX = $x }
            if ($x -gt $cMaxX) { $cMaxX = $x }
            if ($y -lt $cMinY) { $cMinY = $y }
            if ($y -gt $cMaxY) { $cMaxY = $y }
        }
    }
}
Write-Output "Chart card true bounds: X: $cMinX to $cMaxX, Y: $cMinY to $cMaxY"

$img.Dispose()

