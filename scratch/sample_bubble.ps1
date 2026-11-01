Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793469995990_3410d8c9.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)

Write-Output "Sampling inside big bubble (x: 280..380, y: 470..570):"
for ($y = 470; $y -le 570; $y += 20) {
    for ($x = 280; $x -le 380; $x += 20) {
        $c = $bmp.GetPixel($x, $y)
        Write-Output "($x,$y): R=$($c.R), G=$($c.G), B=$($c.B)"
    }
}

$bmp.Dispose()

