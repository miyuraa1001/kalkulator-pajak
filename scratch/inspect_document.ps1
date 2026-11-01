Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Where is the white document?
# Look for text "JASA & SEWA" or the colored pie chart or purple badge.
# Let's search for "JASA & SEWA" dark text or document lines:
# Around X=550..820, Y=400..650
Write-Output "Sampling document area X=650, Y=440..640:"
for ($y = 440; $y -le 640; $y += 20) {
    $c = $img.GetPixel(650, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check document borders:
# What separates the document from the background?
# Top-left of document is in front of the brown briefcase!
# Right edge of document is adjacent to what? White background, or yellow gear?
Write-Output "Sampling document right edge along Y=500, X=700..800:"
for ($x = 700; $x -le 800; $x += 10) {
    $c = $img.GetPixel($x, 500)
    Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Check bottom curl of document:
# Along Y=620..660, X=650
Write-Output "Bottom curl sampling X=650, Y=620..660:"
for ($y = 620; $y -le 660; $y += 5) {
    $c = $img.GetPixel(650, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

