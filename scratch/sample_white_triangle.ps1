Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap("scratch\new_ppn_hero_clean.png")

Write-Output "Sampling region between calculator and small coins (bottom right):"
for ($y = $bmp.Height - 60; $y -lt $bmp.Height - 10; $y += 10) {
    for ($x = [int]($bmp.Width * 0.55); $x -lt [int]($bmp.Width * 0.70); $x += 20) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 0) {
            Write-Output "($x,$y): A=$($c.A) R=$($c.R) G=$($c.G) B=$($c.B)"
        }
    }
}
$bmp.Dispose()

