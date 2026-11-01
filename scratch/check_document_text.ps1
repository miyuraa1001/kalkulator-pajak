Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Let's find "JASA & SEWA" text bounds
# The text is dark blue/slate: R < 70, G < 80, B < 120
$tMinX = 1024; $tMaxX = 0; $tMinY = 764; $tMaxY = 0
for ($y = 400; $y -le 600; $y++) {
    for ($x = 550; $x -le 780; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 70 -and $c.G -lt 80 -and $c.B -lt 120) {
            if ($x -lt $tMinX) { $tMinX = $x }
            if ($x -gt $tMaxX) { $tMaxX = $x }
            if ($y -lt $tMinY) { $tMinY = $y }
            if ($y -gt $tMaxY) { $tMaxY = $y }
        }
    }
}
Write-Output "Text 'JASA & SEWA' bounds: X: $tMinX to $tMaxX, Y: $tMinY to $tMaxY"

# Sample 10px above the text:
$aboveY = $tMinY - 10
Write-Output "Sampling row 10px above text: Y=$aboveY for X=$($tMinX - 20) .. $($tMaxX + 20):"
for ($x = $tMinX - 20; $x -le $tMaxX + 20; $x += 10) {
    $c = $img.GetPixel($x, $aboveY)
    Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Sample top curl of the paper:
Write-Output "Top curl of paper: check Y from $($tMinY - 80) to $tMinY at X=$([int](($tMinX + $tMaxX)/2)):"
$midX = [int](($tMinX + $tMaxX)/2)
for ($y = $tMinY - 80; $y -le $tMinY; $y += 5) {
    $c = $img.GetPixel($midX, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

