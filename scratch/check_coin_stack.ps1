Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

Write-Output "Coin stack bottom check (X=600..740, Y=595..615):"
for ($y = 595; $y -le 612; $y += 2) {
    for ($x = 620; $x -le 720; $x += 10) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 245) {
            Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
        }
    }
}

$img.Dispose()

