Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

Write-Output "Checking pixels with Y >= 604 and R >= 170 and maxDiff <= 12:"
$count = 0
for ($y = 604; $y -le 612; $y++) {
    for ($x = 100; $x -le 900; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -ge 170 -and $diff -le 12) {
            # Let's see what is around this pixel: is it subject or shadow?
            $count++
        }
    }
}
Write-Output "Total light-gray pixels at Y=604..612: $count"

$img.Dispose()

