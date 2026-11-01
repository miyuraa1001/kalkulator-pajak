Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg')

for ($y = 520; $y -le 585; $y += 5) {
    $colored = 0
    $dark = 0
    $light = 0
    for ($x = 240; $x -le 765; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($diff -gt 15) { $colored++ }
        elseif ($c.R -lt 210) { $dark++ }
        elseif ($c.R -lt 245) { $light++ }
    }
    Write-Output "Y=$($y): Colored=$colored, DarkShadow=$dark, LightShadow=$light"
}
$img.Dispose()
