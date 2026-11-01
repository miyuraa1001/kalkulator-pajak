Add-Type -AssemblyName System.Drawing

$file = "assets\images\kpi\ppn11-hero.png"
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

        # That white horizontal bottom bar at y >= 430 and x between 420 and 555
        if ($y -ge 435 -and $x -ge 425 -and $x -le 555) {
            $r = [int]$c.R
            $g = [int]$c.G
            $b = [int]$c.B
            # If not coin (coin is gold: r > 160, g > 110, b < 100) and not teal calculator (g > 140, b > 130, r < 140)
            $isGold = ($r -gt 160) -and ($g -gt 110) -and ($b -lt 105)
            $isMint = ($g -gt 135) -and ($b -gt 125) -and ($r -lt 140)
            if (-not $isGold -and -not $isMint) {
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
                continue
            }
        }
        
        $out.SetPixel($x, $y, $c)
    }
}

$bmp.Dispose()
$dest = "assets\images\kpi\ppn11-hero.png"
$out.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
Write-Output "Cleaned horizontal bar in assets\images\kpi\ppn11-hero.png"

