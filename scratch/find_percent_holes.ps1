Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg')

# Find center of upper circle of %:
# Look for blue pixels of %: R in 80..160, G in 140..200, B in 210..255
# Upper circle is roughly in X: 370..470, Y: 220..340
Write-Output "Searching upper circle hole of % (X=390..450, Y=240..300):"
for ($y = 240; $y -le 300; $y += 5) {
    for ($x = 390; $x -le 450; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -ge 245 -and $c.G -ge 245 -and $c.B -ge 245) {
            Write-Output "  White at ($x, $y): $($c.R), $($c.G), $($c.B)"
        }
    }
}

# Find center of lower circle of %:
# Lower circle is roughly in X: 480..580, Y: 400..500
Write-Output "Searching lower circle hole of % (X=490..560, Y=430..500):"
for ($y = 430; $y -le 500; $y += 5) {
    for ($x = 490; $x -le 560; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -ge 245 -and $c.G -ge 245 -and $c.B -ge 245) {
            Write-Output "  White at ($x, $y): $($c.R), $($c.G), $($c.B)"
        }
    }
}

# Check speech bubble: X: 600..700, Y: 180..260
Write-Output "Searching speech bubble (X=600..700, Y=180..260):"
for ($y = 190; $y -le 250; $y += 10) {
    for ($x = 610; $x -le 690; $x += 10) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 240) {
            Write-Output "  Non-white at ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
        }
    }
}

# Check bar chart bars: X: 480..650, Y: 500..580
Write-Output "Searching bar chart bottom area (X=480..650, Y=500..580):"
for ($y = 520; $y -le 570; $y += 10) {
    for ($x = 490; $x -le 640; $x += 20) {
        $c = $img.GetPixel($x, $y)
        Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

$img.Dispose()

