Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Document region is roughly X: 550 to 800, Y: 430 to 650
$maxBright = 0
$brightestPixel = ""
$brightPixelsCount = 0

for ($y = 430; $y -le 650; $y++) {
    for ($x = 550; $x -le 780; $x++) {
        $c = $img.GetPixel($x, $y)
        $minChannel = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        if ($minChannel -gt $maxBright) {
            $maxBright = $minChannel
            $brightestPixel = "($x, $y): R=$($c.R), G=$($c.G), B=$($c.B)"
        }
        if ($c.R -ge 245 -and $c.G -ge 245 -and $c.B -ge 245) {
            $brightPixelsCount++
        }
    }
}

Write-Output "Document area max min-channel: $maxBright"
Write-Output "Brightest pixel in document: $brightestPixel"
Write-Output "Count of pixels with R>=245 and G>=245 and B>=245 in document area: $brightPixelsCount"

$img.Dispose()

