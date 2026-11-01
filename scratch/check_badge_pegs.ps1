Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793506229955_1b54136b.jpg')

# Small calendar is X: 630..800, Y: 360..550
# The pegs are on top of purple header: Y: 330..390
Write-Output "Sampling small calendar pegs (X=650..780, Y=335..380):"
for ($y = 335; $y -le 380; $y += 5) {
    for ($x = 650; $x -le 780; $x += 10) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            # Check if this white pixel is surrounded by peg color
            Write-Output "  White at ($x, $y): $($c.R) $($c.G) $($c.B)"
        }
    }
}

$img.Dispose()

