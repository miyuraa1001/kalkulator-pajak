Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path 'scratch/test_pph23_clean.png'))
$w = $img.Width
$h = $img.Height

Write-Output "Image size: $w x $h"

# Check corners: should be completely transparent (A=0)
Write-Output "Top-left (0,0): $($img.GetPixel(0,0))"
Write-Output "Top-right (w-1,0): $($img.GetPixel($w-1,0))"
Write-Output "Bottom-left (0,h-1): $($img.GetPixel(0,$h-1))"
Write-Output "Bottom-right (w-1,h-1): $($img.GetPixel($w-1,$h-1))"

# Check the blue gear hole center (relative coordinates):
# Original was (660, 220), bounds minX was 164-12=152, minY was 74-12=62.
# So relative is X = 660 - 152 = 508, Y = 220 - 62 = 158.
Write-Output "Blue gear hole relative (508, 158): $($img.GetPixel(508, 158))"

# Check handle gap relative: (500-152, 260-62) = (348, 198)
Write-Output "Handle gap relative (348, 198): $($img.GetPixel(348, 198))"

# Count transparent vs opaque pixels
$transparent = 0
$semi = 0
$opaque = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $a = $img.GetPixel($x, $y).A
        if ($a -eq 0) { $transparent++ }
        elseif ($a -lt 255) { $semi++ }
        else { $opaque++ }
    }
}
$total = $w * $h
Write-Output "Pixel breakdown: Total=$total, Transparent=$transparent, Semi-transparent (AA)=$semi, Opaque=$opaque"

$img.Dispose()

