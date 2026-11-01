Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

# Document on right is roughly X: 660..770, Y: 230..400
# Let's check max border pixel brightness around the perimeter of the document:
$borderMax = 0
$borderMaxPt = ""

# Check every pixel that separates the document from the background:
for ($y = 230; $y -le 400; $y++) {
    for ($x = 650; $x -le 770; $x++) {
        $c = $img.GetPixel($x, $y)
        # Check if adjacent to background:
        # Background is R >= 248, G >= 248, B >= 248
        $isBg = ($c.R -ge 248 -and $c.G -ge 248 -and $c.B -ge 248)
        if (!$isBg) {
            # Check 4 neighbors
            $hasBgNeighbor = $false
            foreach ($d in @(@(1,0), @(-1,0), @(0,1), @(0,-1))) {
                $nc = $img.GetPixel($x + $d[0], $y + $d[1])
                if ($nc.R -ge 248 -and $nc.G -ge 248 -and $nc.B -ge 248) {
                    $hasBgNeighbor = $true
                    break
                }
            }
            if ($hasBgNeighbor) {
                if ($c.R -gt $borderMax) {
                    $borderMax = $c.R
                    $borderMaxPt = "($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
                }
            }
        }
    }
}
Write-Output "Document border max brightness: $borderMax at $borderMaxPt"

$img.Dispose()

