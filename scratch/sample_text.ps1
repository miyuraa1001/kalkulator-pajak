Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')
$whiteInside = @()
for ($y = 100; $y -le 145; $y++) {
    for ($x = 220; $x -le 360; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            # white pixel in text region
        }
    }
}
Write-Output "Done sampling text region"
$img.Dispose()

