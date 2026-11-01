Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

Write-Output "Sampling first 20 white pixels in X=570..760, Y=370..640:"
$count = 0
for ($y = 370; $y -le 640; $y += 5) {
    for ($x = 570; $x -le 760; $x += 5) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -ge 246 -and $c.G -ge 246 -and $c.B -ge 246 -and $diff -le 12) {
            Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
            $count++
            if ($count -ge 20) { break }
        }
    }
    if ($count -ge 20) { break }
}

# Now let's check pixels strictly inside the text area "JASA & SEWA" (X=600..700, Y=430..530)
$whiteInCore = 0
for ($y = 430; $y -le 530; $y++) {
    for ($x = 600; $x -le 700; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -ge 246 -and $c.G -ge 246 -and $c.B -ge 246 -and $diff -le 12) {
            $whiteInCore++
        }
    }
}
Write-Output "White pixels inside CORE document (X=600..700, Y=430..530): $whiteInCore"

$img.Dispose()

