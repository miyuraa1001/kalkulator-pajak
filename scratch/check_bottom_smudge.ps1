Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('c:/Users/ASUS/OneDrive/Dokumen/GitHub/kalkulator-pajak/scratch/pph42_rate_clean.png')
$w = $img.Width
$h = $img.Height

Write-Output "Image size: $w x $h"
for ($y = $h - 40; $y -lt $h; $y += 5) {
    $opaque = 0
    $dark = 0
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 0) {
            $opaque++
            $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
            if ($diff -le 15 -and $c.R -lt 240) { $dark++ }
        }
    }
    Write-Output "Y=$($y): Opaque=$opaque, NeutralGray=$dark"
}
$img.Dispose()

