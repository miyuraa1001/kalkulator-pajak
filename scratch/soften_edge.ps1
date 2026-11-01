Add-Type -AssemblyName System.Drawing

$file = "scratch\new_ppn_hero_final.png"
$bmp = New-Object System.Drawing.Bitmap($file)
$w = $bmp.Width
$h = $bmp.Height

$out = New-Object System.Drawing.Bitmap($w, $h)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -eq 0) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
            continue
        }

        # That bottom paper edge in the gap (x: 410 to 480, y > 440)
        # If it's near the cut edge, soften it
        if ($x -ge 415 -and $x -le 480 -and $y -ge 443 -and $y -le 448) {
            # Check if pixel below is transparent
            if ($y + 1 -ge $h -or $bmp.GetPixel($x, $y + 1).A -eq 0) {
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb([int]($c.A * 0.4), $c.R, $c.G, $c.B))
                continue
            }
        }
        
        $out.SetPixel($x, $y, $c)
    }
}

$dest = "assets\images\kpi\ppn11-hero.png"
$out.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Save("scratch\new_ppn_hero_final.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$out.Dispose()
Write-Output "Softened bottom edge in assets\images\kpi\ppn11-hero.png"

