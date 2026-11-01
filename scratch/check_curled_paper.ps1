Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg')

Write-Output "Sampling curled paper at bottom:"
for ($y = 510; $y -le 545; $y += 10) {
    for ($x = 350; $x -le 550; $x += 50) {
        $c = $img.GetPixel($x, $y)
        Write-Output "X=$($x), Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
    }
}
$img.Dispose()
