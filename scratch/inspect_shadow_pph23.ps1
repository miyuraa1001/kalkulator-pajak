Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

Write-Output "Sampling shadow/bottom pixels at Y=600, 610, 620:"
foreach ($y in @(595, 605, 615, 625)) {
    Write-Output "--- Y=$y ---"
    for ($x = 320; $x -le 620; $x += 20) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 250 -or $c.G -lt 250 -or $c.B -lt 250) {
            Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
        }
    }
}

$img.Dispose()

