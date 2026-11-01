Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

# Green bag handle: roughly X: 620..680, Y: 430..500
Write-Output "Checking green bag handle area (X=620..680, Y=430..500):"
for ($y = 440; $y -le 490; $y += 5) {
    for ($x = 630; $x -le 670; $x += 10) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            Write-Output "  White at ($x, $y): $($c.R) $($c.G) $($c.B)"
        }
    }
}

# Orange bag handle: roughly X: 690..760, Y: 500..550
Write-Output "Checking orange bag handle area (X=690..760, Y=500..550):"
for ($y = 500; $y -le 540; $y += 5) {
    for ($x = 700; $x -le 740; $x += 10) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            Write-Output "  White at ($x, $y): $($c.R) $($c.G) $($c.B)"
        }
    }
}

# Check bottom rows (Y=590..625) for floor shadow vs subject base:
Write-Output "Checking bottom rows Y=595..620:"
for ($y = 595; $y -le 620; $y += 5) {
    Write-Output "--- Y=$y ---"
    for ($x = 260; $x -le 780; $x += 40) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 248 -or $diff -gt 10) {
            Write-Output "  X=$($x): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
        }
    }
}

$img.Dispose()

