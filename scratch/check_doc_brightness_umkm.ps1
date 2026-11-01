Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

Write-Output "Sampling document X=720, Y=260..380:"
for ($y = 260; $y -le 380; $y += 20) {
    $c = $img.GetPixel(720, $y)
    Write-Output "Y=$($y): R=$($c.R) G=$($c.G) B=$($c.B)"
}

# Let's check max brightness inside the document:
$maxMin = 0
$maxPt = ""
for ($y = 250; $y -le 380; $y += 2) {
    for ($x = 680; $x -le 780; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $m = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        if ($m -gt $maxMin) {
            $maxMin = $m
            $maxPt = "($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
        }
    }
}
Write-Output "Max brightness in document: $maxMin at $maxPt"

$img.Dispose()

