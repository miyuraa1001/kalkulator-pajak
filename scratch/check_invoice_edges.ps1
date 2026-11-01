Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793463744092_560cbaf0.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)

Write-Output "Sampling edges of the paper invoice:"
# Invoice is roughly from x=520 to 800, y=370 to 750
# Top edge of invoice: y=370..400, x=550..750
for ($x = 550; $x -le 750; $x += 40) {
    for ($y = 360; $y -le 400; $y += 10) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 250) {
            Write-Output "Top edge ($x, $y): R=$($c.R), G=$($c.G), B=$($c.B)"
            break
        }
    }
}

# Right edge of invoice: x=750..820, y=450..650
for ($y = 450; $y -le 650; $y += 50) {
    for ($x = 810; $x -ge 760; $x -= 10) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 250) {
            Write-Output "Right edge ($x, $y): R=$($c.R), G=$($c.G), B=$($c.B)"
            break
        }
    }
}

$bmp.Dispose()

