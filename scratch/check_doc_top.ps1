Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')
for ($x = 380; $x -le 580; $x += 20) {
    for ($y = 190; $y -le 240; $y += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            Write-Output "Found non-white at X=$($x), Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
            break
        }
    }
}
$img.Dispose()
