Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg')

Write-Output "Sampling small document on left (X=270..330, Y=510..590):"
for ($y = 510; $y -le 590; $y += 10) {
    for ($x = 270; $x -le 330; $x += 10) {
        $c = $img.GetPixel($x, $y)
        $minC = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        $maxDiff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            Write-Output "  Doc pixel at ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B) minC=$minC maxDiff=$maxDiff"
        }
    }
}

$img.Dispose()

