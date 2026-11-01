Add-Type -AssemblyName System.Drawing

$file = "scratch\pph21_perfect_hero.png"
$bmp = New-Object System.Drawing.Bitmap($file)
$w = $bmp.Width
$h = $bmp.Height

$out = New-Object System.Drawing.Bitmap($w, $h)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -lt 20) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
            continue
        }
        
        # Clean stray specks to the right of the coin stack (x > 244) or left (x < 20 and y > 150)
        if ($x -gt 244 -and $y -gt 130) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } elseif ($x -lt 25 -and $y -gt 170) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } elseif ($y -gt 210) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } else {
            $out.SetPixel($x, $y, $c)
        }
    }
}

$dest = "assets\images\kpi\pph21-hero.png"
$out.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$out.Dispose()
Write-Output "Successfully updated assets\images\kpi\pph21-hero.png"

