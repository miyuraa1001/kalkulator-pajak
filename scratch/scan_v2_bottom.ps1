Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('c:/Users/ASUS/OneDrive/Dokumen/GitHub/kalkulator-pajak/scratch/pph42_rate_v2.png')
$w = $img.Width
$h = $img.Height

Write-Output "Scanning bottom 40 rows for any neutral gray (maxDiff <= 12):"
$neutralCount = 0
for ($y = $h - 40; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 0) {
            $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
            if ($diff -le 12) {
                $neutralCount++
                if ($neutralCount -le 10) {
                    Write-Output "Neutral at X=$x, Y=$y (orig $($x+235), $($y+145)): R=$($c.R), G=$($c.G), B=$($c.B), diff=$diff"
                }
            }
        }
    }
}
Write-Output "Total neutral pixels in bottom 40 rows: $neutralCount"
$img.Dispose()
