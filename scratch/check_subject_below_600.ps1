Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793506229955_1b54136b.jpg')

Write-Output "Checking for any colored pixels below Y=600:"
$found = 0
for ($y = 601; $y -le 700; $y++) {
    for ($x = 100; $x -le 900; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 240 -and $diff -gt 15) {
            Write-Output "Colored pixel at ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
            $found++
            if ($found -ge 5) { break }
        }
    }
    if ($found -ge 5) { break }
}
if ($found -eq 0) {
    Write-Output "ZERO colored subject pixels below Y=600! The entire subject completely terminates by Y=600!"
}

$img.Dispose()

