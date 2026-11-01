Add-Type -AssemblyName System.Drawing

$file = "assets\images\kpi\pph21-hero.png"
$bmp = New-Object System.Drawing.Bitmap($file)
$w = $bmp.Width
$h = $bmp.Height

$out = New-Object System.Drawing.Bitmap($w, $h)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -lt 15) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
            continue
        }
        
        $r = [int]$c.R
        $g = [int]$c.G
        $b = [int]$c.B
        $maxDiff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
        
        # Grey floor or shadow lines:
        # In the right region (x > 150) or bottom region (y > 160)
        $isGrey = ($maxDiff -lt 28) -and ($r -gt 85) -and ($r -lt 240)
        $isShadow = ($maxDiff -lt 20) -and ($r -lt 140)
        
        # Don't delete yellow/gold coins (R > 180, G > 140, B < 90) or purple shirt (B > R) or green bar (G > R, G > B) or red bar (R > G, R > B)
        $isGold = ($r -gt 160) -and ($g -gt 120) -and ($b -lt 120)
        $isPurple = ($b -gt 100) -and ($r -gt 60) -and ($g -lt 100)
        $isGreen = ($g -gt $r + 15) -and ($g -gt $b + 15)
        $isRed = ($r -gt $g + 20) -and ($r -gt $b + 20)
        $isWhiteCollar = ($r -gt 220) -and ($g -gt 220) -and ($b -gt 220) -and ($y -lt 170)
        
        if ($isGold -or $isPurple -or $isGreen -or $isRed -or $isWhiteCollar) {
            $out.SetPixel($x, $y, $c)
        } elseif ($y -gt 160 -and ($isGrey -or $isShadow)) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } elseif ($y -gt 212) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } else {
            $out.SetPixel($x, $y, $c)
        }
    }
}

$out.Save("scratch\pph21_perfect_hero.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$out.Dispose()
Write-Output "Perfect PPh 21 hero saved to scratch\pph21_perfect_hero.png"

