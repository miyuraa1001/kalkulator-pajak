Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# 1. Big blue gear hole
Write-Output "1. Big blue gear hole at (660, 220): $($img.GetPixel(660, 220))"

# 2. Small blue gear hole on left
Write-Output "2. Small blue gear sampling around (350..370, 210..240):"
for ($y = 200; $y -le 250; $y += 10) {
    $c = $img.GetPixel(356, $y)
    Write-Output "  (356, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# 3. Yellow gear on left
Write-Output "3. Yellow gear sampling around (240..270, 520..580):"
for ($y = 520; $y -le 580; $y += 10) {
    $c = $img.GetPixel(250, $y)
    Write-Output "  (250, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# 4. Handle gap
# Between the briefcase handle arch and the briefcase body
Write-Output "4. Handle gap sampling along X=500, Y=260..320:"
for ($y = 260; $y -le 320; $y += 5) {
    $c = $img.GetPixel(500, $y)
    Write-Output "  (500, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check handle arch width and position:
# Where is the top of the handle arch?
Write-Output "Handle arch search at Y=240..280:"
for ($y = 240; $y -le 280; $y += 5) {
    $c = $img.GetPixel(500, $y)
    Write-Output "  (500, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

