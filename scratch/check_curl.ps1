Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')
for ($y = 660; $y -le 740; $y += 10) {
    for ($x = 710; $x -le 790; $x += 10) {
        $c = $img.GetPixel($x, $y)
        Write-Output "X=$($x), Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
    }
}
$img.Dispose()

