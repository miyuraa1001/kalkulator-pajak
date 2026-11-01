Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg')

for ($y = 525; $y -le 553; $y += 3) {
    for ($x = 290; $x -le 350; $x += 10) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        Write-Output "X=$($x), Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B), diff=$diff"
    }
}
$img.Dispose()

