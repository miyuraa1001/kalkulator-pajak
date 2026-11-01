Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

# Check document on left (X=150..300)
# Look for document border:
Write-Output "Document bottom search (X=200, Y=500..600):"
for ($y = 500; $y -le 600; $y += 5) {
    $c = $img.GetPixel(200, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check chart card on right (X=750, Y=550..620):
Write-Output "Chart card bottom search (X=750, Y=550..620):"
for ($y = 550; $y -le 620; $y += 5) {
    $c = $img.GetPixel(750, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

