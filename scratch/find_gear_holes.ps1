Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Check small blue gear area (X=320..420, Y=180..260) for any white pixels:
Write-Output "Searching white pixels inside small blue gear (X=320..420, Y=180..260):"
$whiteFound = 0
for ($y = 180; $y -le 260; $y += 5) {
    for ($x = 320; $x -le 420; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            Write-Output "  White at ($x, $y): $($c.R), $($c.G), $($c.B)"
            $whiteFound++
            if ($whiteFound -ge 5) { break }
        }
    }
    if ($whiteFound -ge 5) { break }
}
if ($whiteFound -eq 0) { Write-Output "  No white pixels inside small blue gear (it is either solid or filled)." }

# Check yellow gear on right (X=780..860, Y=480..650) for hole:
Write-Output "Searching white pixels inside right yellow gear (X=780..860, Y=480..650):"
$whiteFoundR = 0
for ($y = 480; $y -le 650; $y += 5) {
    for ($x = 780; $x -le 860; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            Write-Output "  White at ($x, $y): $($c.R), $($c.G), $($c.B)"
            $whiteFoundR++
            if ($whiteFoundR -ge 5) { break }
        }
    }
    if ($whiteFoundR -ge 5) { break }
}
if ($whiteFoundR -eq 0) { Write-Output "  No white pixels inside right yellow gear." }

$img.Dispose()

