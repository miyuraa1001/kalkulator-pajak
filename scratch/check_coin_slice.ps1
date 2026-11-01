Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg')
Write-Output "--- Vertical slice at X=280 (bottom-left coin) ---"
for ($y = 515; $y -le 555; $y += 2) {
    $c = $img.GetPixel(280, $y)
    Write-Output "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}
$img.Dispose()

