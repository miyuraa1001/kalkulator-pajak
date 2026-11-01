Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')

Write-Output "--- Candidate at (371, 477) ---"
for ($y = 450; $y -le 490; $y += 10) {
    $c = $img.GetPixel(370, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}

Write-Output "--- Candidate at (648, 467) ---"
for ($y = 450; $y -le 490; $y += 10) {
    $c = $img.GetPixel(648, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}

Write-Output "--- Candidate at (394, 608) ---"
for ($y = 600; $y -le 615; $y += 5) {
    $c = $img.GetPixel(394, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}

$img.Dispose()
