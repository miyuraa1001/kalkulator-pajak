Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793464739297_f84f5d5d.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
$w = $bmp.Width
$h = $bmp.Height

Write-Output "Sampling pixels for green content to locate '11%':"
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0

for ($y = 0; $y -lt $h; $y += 5) {
    for ($x = 0; $x -lt $w; $x += 5) {
        $c = $bmp.GetPixel($x, $y)
        # Green pixels (arrows and numbers)
        if ($c.G -gt $c.R + 20 -and $c.G -gt $c.B + 10 -and $c.G -gt 100) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Green element bounds: X=($minX to $maxX), Y=($minY to $maxY)"
$bmp.Dispose()

