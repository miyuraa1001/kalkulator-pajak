Add-Type -AssemblyName System.Drawing

$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510318714_8be3a23d.jpg"
$img = [System.Drawing.Bitmap]::FromFile($src)

Write-Output "Finding paper roll bottom lip across X=325..575:"
for ($x = 330; $x -le 570; $x += 20) {
    # Scan from Y=500 down
    # Inside the paper roll, it's either the front face or the inner roll (R < 210 with diff > 10).
    # Then there is the bottom edge of the paper roll.
    # Below the paper roll, the shadow has R < 240 and diff <= 6.
    $edgeY = -1
    for ($y = 510; $y -le 555; $y++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        # Let's inspect each step
    }
}

# Let's print out exact Y coordinates where the paper ends:
for ($x = 330; $x -le 570; $x += 30) {
    Write-Output "Column X=$($x):"
    for ($y = 515; $y -le 555; $y += 3) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        Write-Output "  Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
    }
}

$img.Dispose()
