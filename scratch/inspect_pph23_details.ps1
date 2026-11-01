Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Let's inspect the blue gear hole:
# The blue gear is on top-right. Let's find white pixels surrounded by blue gear.
# Let's sample along X=640..680, Y=180..320
Write-Output "Sampling X=660, Y=180..320 (Inside blue gear area):"
for ($y = 180; $y -le 320; $y += 15) {
    $c = $img.GetPixel(660, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Inspect yellow gear on left: X=270..310, Y=560..620? Or where is yellow gear?
# Let's find yellow gear bounds:
$yellowMinX = $img.Width; $yellowMaxX = 0; $yellowMinY = $img.Height; $yellowMaxY = 0
for ($y = 0; $y -lt $img.Height; $y += 4) {
    for ($x = 0; $x -lt $img.Width; $x += 4) {
        $c = $img.GetPixel($x, $y)
        # yellow gear is orange-yellow: R > 200, G in 150..210, B < 120
        if ($c.R -gt 200 -and $c.G -gt 150 -and $c.G -lt 210 -and $c.B -lt 120 -and ($c.R - $c.B) -gt 90) {
            if ($x -lt $yellowMinX) { $yellowMinX = $x }
            if ($x -gt $yellowMaxX) { $yellowMaxX = $x }
            if ($y -lt $yellowMinY) { $yellowMinY = $y }
            if ($y -gt $yellowMaxY) { $yellowMaxY = $y }
        }
    }
}
Write-Output "Yellow gear bounds: X: $yellowMinX to $yellowMaxX, Y: $yellowMinY to $yellowMaxY"

# Let's find small blue gear on left bounds:
$smBlueMinX = $img.Width; $smBlueMaxX = 0; $smBlueMinY = $img.Height; $smBlueMaxY = 0
for ($y = 0; $y -lt $img.Height; $y += 4) {
    for ($x = 0; $x -lt 450; $x += 4) {
        $c = $img.GetPixel($x, $y)
        if ($c.B -gt ($c.R + 40) -and $c.B -gt ($c.G + 15)) {
            if ($x -lt $smBlueMinX) { $smBlueMinX = $x }
            if ($x -gt $smBlueMaxX) { $smBlueMaxX = $x }
            if ($y -lt $smBlueMinY) { $smBlueMinY = $y }
            if ($y -gt $smBlueMaxY) { $smBlueMaxY = $y }
        }
    }
}
Write-Output "Small blue gear bounds: X: $smBlueMinX to $smBlueMaxX, Y: $smBlueMinY to $smBlueMaxY"

# Let's check handle: X=450..550, Y=260..360
Write-Output "Handle area sampling X=500, Y=260..360:"
for ($y = 260; $y -le 360; $y += 10) {
    $c = $img.GetPixel(500, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

