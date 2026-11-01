Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg')

for ($y = 540; $y -le 552; $y += 2) {
    $coloredX = @()
    for ($x = 240; $x -le 765; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($diff -gt 15) { $coloredX += $x }
    }
    if ($coloredX.Count -gt 0) {
        $min = ($coloredX | Measure-Object -Minimum).Minimum
        $max = ($coloredX | Measure-Object -Maximum).Maximum
        Write-Output "Y=$($y): Colored count=$($coloredX.Count), X=$min..$max"
    } else {
        Write-Output "Y=$($y): No colored pixels"
    }
}
$img.Dispose()
