Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path 'scratch/test_pph25_clean.png'))
$w = $img.Width
$h = $img.Height

Write-Output "Image size: $w x $h"

# Check bottom 15 rows of coin stack:
# Coin stack is around X = 600..730 relative to original, in cropped image let's find it:
# Original minX was 160-12=148. So coin stack is around X = 600-148 = 452 to 730-148 = 582.
# Let's check non-transparent pixels in the bottom 15 rows (Y = h-15 to h-1):
Write-Output "Bottom 15 rows inspection around coin stack (X=480..600, Y=$($h-15)..$($h-1)):"
for ($y = $h - 15; $y -lt $h; $y += 2) {
    for ($x = 480; $x -le 600; $x += 20) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 0) {
            $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
            Write-Output "  ($x, $y): A=$($c.A) R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
        }
    }
}

$img.Dispose()

