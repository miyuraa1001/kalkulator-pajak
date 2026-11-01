Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')

# Check surrounding of X=343..399, Y=441..514
# Above (Y=435):
Write-Output "Above region at Y=435:"
for ($x = 345; $x -le 395; $x += 10) {
    $c = $img.GetPixel($x, 435)
    Write-Output "  X=$($x): R=$($c.R), G=$($c.G), B=$($c.B)"
}
# Left (X=338):
Write-Output "Left of region at X=338:"
for ($y = 445; $y -le 510; $y += 15) {
    $c = $img.GetPixel(338, $y)
    Write-Output "  Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}
# Right (X=405):
Write-Output "Right of region at X=405:"
for ($y = 445; $y -le 510; $y += 15) {
    $c = $img.GetPixel(405, $y)
    Write-Output "  Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}
# Below (Y=520):
Write-Output "Below region at Y=520:"
for ($x = 345; $x -le 395; $x += 10) {
    $c = $img.GetPixel($x, 520)
    Write-Output "  X=$($x): R=$($c.R), G=$($c.G), B=$($c.B)"
}

$img.Dispose()

