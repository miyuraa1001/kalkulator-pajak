Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

# 1. Inspect top binder loops
# Calendar purple header is X: 450..800, Y: 180..280.
# The loops are on top of the header: Y: 140..220.
# Left loop around X: 520..560
# Right loop around X: 700..740
Write-Output "Left binder loop sampling (X=520..560, Y=140..220):"
for ($y = 150; $y -le 210; $y += 10) {
    for ($x = 525; $x -le 555; $x += 10) {
        $c = $img.GetPixel($x, $y)
        Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

Write-Output "Right binder loop sampling (X=695..735, Y=140..220):"
for ($y = 150; $y -le 210; $y += 10) {
    for ($x = 705; $x -le 730; $x += 10) {
        $c = $img.GetPixel($x, $y)
        Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

# 2. Calendar body (white sheet with "15"):
# Located around X: 480..750, Y: 280..500
Write-Output "Calendar white sheet sampling (X=550..700, Y=300..380):"
for ($y = 300; $y -le 360; $y += 20) {
    for ($x = 580; $x -le 680; $x += 50) {
        $c = $img.GetPixel($x, $y)
        Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

# 3. Document white sheet:
Write-Output "Document white sheet sampling (X=200..250, Y=400..450):"
for ($y = 400; $y -le 440; $y += 20) {
    for ($x = 200; $x -le 240; $x += 20) {
        $c = $img.GetPixel($x, $y)
        Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

# 4. Chart card white sheet:
Write-Output "Chart card white sheet sampling (X=700..750, Y=480..520):"
for ($y = 480; $y -le 520; $y += 20) {
    for ($x = 700; $x -le 740; $x += 20) {
        $c = $img.GetPixel($x, $y)
        Write-Output "  ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

$img.Dispose()

