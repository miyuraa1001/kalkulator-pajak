Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793461721388_a3c6ab00.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
$w = $bmp.Width
$h = $bmp.Height

Write-Output "Sampling rows for min R,G,B to detect where objects and shadows are:"
for ($y = 450; $y -lt $h; $y += 20) {
    $minR = 255; $minG = 255; $minB = 255; $hasColor = 0; $darkCount = 0
    for ($x = 0; $x -lt $w; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt $minR) { $minR = $c.R }
        if ($c.G -lt $minG) { $minG = $c.G }
        if ($c.B -lt $minB) { $minB = $c.B }
        # Check saturation
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Abs($c.R - $c.B))
        if ($diff -gt 30) { $hasColor++ }
        if ($c.R -lt 240) { $darkCount++ }
    }
    Write-Output "Row ${y} : min=($minR,$minG,$minB), colored_pixels=$hasColor, non_white=$darkCount"
}

$bmp.Dispose()

