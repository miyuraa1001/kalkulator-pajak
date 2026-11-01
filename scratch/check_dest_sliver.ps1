Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('c:/Users/ASUS/OneDrive/Dokumen/GitHub/kalkulator-pajak/scratch/pph42_rate_v2.png')
# Destination image: minX=235, minY=145
# So original (320, 540) is dest (320 - 235, 540 - 145) = (85, 395)
Write-Output "Sampling destination image around X=70..130, Y=375..415:"
for ($y = 380; $y -le 415; $y += 5) {
    for ($x = 75; $x -le 125; $x += 10) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 0) {
            Write-Output "Dest ($x, $y) [orig $($x+235), $($y+145)]: A=$($c.A), R=$($c.R), G=$($c.G), B=$($c.B)"
        }
    }
}
$img.Dispose()

