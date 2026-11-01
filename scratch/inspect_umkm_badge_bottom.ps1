Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508084250_ca5439a2.jpg')

# 1. Document bottom curl:
Write-Output "Sampling document bottom curl (X=480, Y=570..615):"
for ($y = 570; $y -le 615; $y += 3) {
    $c = $img.GetPixel(480, $y)
    $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
}

# 2. Find max Y of colored pixels in the whole image:
$maxY = 0; $maxPt = ""
for ($y = 590; $y -le 630; $y++) {
    for ($x = 200; $x -le 850; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 240 -and $diff -gt 15) {
            if ($y -gt $maxY) {
                $maxY = $y
                $maxPt = "($x, $y): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
            }
        }
    }
}
Write-Output "Max Y of any colored pixel: $maxY -> $maxPt"

# 3. Document body color:
Write-Output "Sampling document white sheet (X=480, Y=260..380):"
for ($y = 260; $y -le 380; $y += 30) {
    $c = $img.GetPixel(480, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

