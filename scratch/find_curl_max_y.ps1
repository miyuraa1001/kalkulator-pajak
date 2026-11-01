Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793506229955_1b54136b.jpg')

$maxY = 0
$maxCoord = ""
for ($y = 595; $y -le 630; $y++) {
    for ($x = 350; $x -le 550; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 240 -and $diff -gt 15) {
            if ($y -gt $maxY) {
                $maxY = $y
                $maxCoord = "($x, $y): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
            }
        }
    }
}
Write-Output "Max Y of document curl: $maxY -> $maxCoord"

$img.Dispose()

