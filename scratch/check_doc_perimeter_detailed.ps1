Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

# Check along top edge of document: Y=240, X=660..780
Write-Output "Sampling top edge Y=240, X=680..780:"
for ($x = 680; $x -le 780; $x += 10) {
    $c = $img.GetPixel($x, 240)
    Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check along right edge of document: X=780, Y=250..380
Write-Output "Sampling right edge X=780, Y=250..380:"
for ($y = 250; $y -le 380; $y += 20) {
    $c = $img.GetPixel(780, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check along bottom edge of document: Y=390, X=680..780
Write-Output "Sampling bottom edge Y=390, X=680..780:"
for ($x = 680; $x -le 780; $x += 10) {
    $c = $img.GetPixel($x, 390)
    Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check along left edge of document: X=670, Y=250..380
Write-Output "Sampling left edge X=670, Y=250..380:"
for ($y = 250; $y -le 380; $y += 20) {
    $c = $img.GetPixel(670, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

