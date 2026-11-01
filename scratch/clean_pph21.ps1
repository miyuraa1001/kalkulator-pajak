Add-Type -AssemblyName System.Drawing

$file = "assets\images\kpi\pph21-hero.png"
$bmp = New-Object System.Drawing.Bitmap($file)
$w = $bmp.Width
$h = $bmp.Height

# Check where the employee and chart are
# Employee is on the left (x < 150), Chart is on the right (x >= 120)
# Look at grey floor pixels: grey is characterized by R approx G approx B (saturation low) and brightness between 120 and 220
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
        
        # Check if it's a grey floor line or shadow at bottom (y > 175)
        # The employee shirt is purple (B > R, B > G, high diff), coins are gold/yellow (R > 180, G > 140, B < 80)
        # Chart bars are green, yellow, pink/red
        $isGrey = ($maxDiff -lt 25) -and ($r -gt 100) -and ($r -lt 230)
        $isVeryDarkShadow = ($r -lt 80) -and ($g -lt 80) -and ($b -lt 80) -and ($maxDiff -lt 15)
        
        if ($y -gt 170 -and ($isGrey -or $isVeryDarkShadow)) {
            # Floor line or shadow! Set to transparent
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } elseif ($y -gt 215) {
            # Everything below 215 is ground residue
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
        } else {
            $out.SetPixel($x, $y, $c)
        }
    }
}

$out.Save("scratch\pph21_cleaned_test.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$out.Dispose()
Write-Output "Cleaned test saved to scratch\pph21_cleaned_test.png"

