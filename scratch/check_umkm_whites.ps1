Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

# 1. Awning white stripes: X ~ 420, 500, 580, Y ~ 380..480
Write-Output "Sampling awning white stripe (X=500, Y=390..470):"
for ($y = 390; $y -le 470; $y += 20) {
    $c = $img.GetPixel(500, $y)
    Write-Output "  ($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# 2. Document on right: X ~ 680..780, Y ~ 240..380
Write-Output "Sampling document on right (X=720, Y=260..360):"
for ($y = 260; $y -le 360; $y += 25) {
    $c = $img.GetPixel(720, $y)
    Write-Output "  ($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# 3. Receipt on right: X ~ 670..780, Y ~ 470..550
Write-Output "Sampling receipt on right (X=720, Y=480..540):"
for ($y = 480; $y -le 540; $y += 20) {
    $c = $img.GetPixel(720, $y)
    Write-Output "  ($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# 4. Check if border of document is distinct from background:
Write-Output "Sampling top edge of document (X=710, Y=230..255):"
for ($y = 230; $y -le 255; $y += 5) {
    $c = $img.GetPixel(710, $y)
    Write-Output "  ($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

