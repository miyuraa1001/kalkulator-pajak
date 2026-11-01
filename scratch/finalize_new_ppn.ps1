Add-Type -AssemblyName System.Drawing

$file = "scratch\new_ppn_hero_clean.png"
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

        # Check region between calculator and coins (x between 400 and 520, y > 470)
        $r = [int]$c.R
        $g = [int]$c.G
        $b = [int]$c.B
        $maxDiff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
        
        # Floor shadow between objects:
        if ($x -ge 400 -and $x -le 520 -and $y -ge 470) {
            # If not coin (coin is gold/yellow: R > 165, G > 115, B < 110) and not teal calculator (G > 140, B > 130)
            $isGold = ($r -gt 165) -and ($g -gt 115) -and ($b -lt 110)
            $isMint = ($g -gt 135) -and ($b -gt 125) -and ($r -lt 140)
            
            if (-not $isGold -and -not $isMint) {
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
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
Write-Output "Successfully updated assets\images\kpi\ppn11-hero.png and scratch\new_ppn_hero_final.png"

