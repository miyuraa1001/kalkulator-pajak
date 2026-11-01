Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

# Check white document on left (X=150..300, Y=350..620)
$docMaxY = 0
for ($y = 350; $y -le 620; $y++) {
    for ($x = 150; $x -le 300; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            if ($y -gt $docMaxY) { $docMaxY = $y }
        }
    }
}
Write-Output "Document on left max Y: $docMaxY"

# Check chart card on right (X=660..860, Y=450..620)
$chartMaxY = 0
for ($y = 450; $y -le 620; $y++) {
    for ($x = 660; $x -le 860; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            if ($y -gt $chartMaxY) { $chartMaxY = $y }
        }
    }
}
Write-Output "Chart card on right max Y: $chartMaxY"

# Check calendar bottom (around X=500..650, behind laptop/character)
# Does calendar touch Y=600?
Write-Output "Checking calendar bottom X=580..650, Y=560..605:"
for ($y = 560; $y -le 605; $y += 5) {
    $c = $img.GetPixel(600, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

