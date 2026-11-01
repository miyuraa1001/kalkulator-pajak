Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')
for ($y = 500; $y -le 700; $y += 50) {
    for ($x = 650; $x -le 750; $x += 50) {
        $c = $img.GetPixel($x, $y)
        Write-Output "Doc paper at X=$($x), Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
    }
}
$img.Dispose()

