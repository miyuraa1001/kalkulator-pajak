Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('c:/Users/ASUS/OneDrive/Dokumen/GitHub/kalkulator-pajak/scratch/pph42_rate_v2.png')
$w = $img.Width
$h = $img.Height

for ($y = $h - 40; $y -lt $h; $y += 2) {
    $count = 0
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 0) {
            $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
            if ($diff -le 12) { $count++ }
        }
    }
    Write-Output "Y=$y (orig $($y+145)): Count=$count"
}
$img.Dispose()

