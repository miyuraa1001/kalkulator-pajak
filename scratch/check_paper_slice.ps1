Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg')

Write-Output "--- Curled paper bottom contour ---"
for ($x = 320; $x -le 570; $x += 25) {
    # Scan from Y=550 up to find where the paper is
    for ($y = 550; $y -ge 500; $y--) {
        $c = $img.GetPixel($x, $y)
        # Curled paper has shading, but let's see its RGB
        # If it's shadow vs paper:
        # In floor shadow, R=G=B (neutral gray) with diffuse gradient
    }
}

# Let's inspect vertical slice at X=450 (middle of curled paper) from Y=500 to 560
Write-Output "--- Vertical slice at X=450 ---"
for ($y = 500; $y -le 560; $y += 2) {
    $c = $img.GetPixel(450, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}

# Vertical slice at X=360 (curled edge)
Write-Output "--- Vertical slice at X=360 ---"
for ($y = 500; $y -le 560; $y += 2) {
    $c = $img.GetPixel(360, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}

# Vertical slice at X=550 (right curl)
Write-Output "--- Vertical slice at X=550 ---"
for ($y = 500; $y -le 560; $y += 2) {
    $c = $img.GetPixel(550, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}

$img.Dispose()

