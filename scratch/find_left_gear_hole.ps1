Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

Write-Output "Finding hole inside left blue gear (X=320..420, Y=200..270):"
for ($y = 210; $y -le 260; $y += 5) {
    for ($x = 350; $x -le 420; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
            Write-Output "White hole pixel at ($x, $y): $($c.R), $($c.G), $($c.B)"
        }
    }
}

$img.Dispose()

