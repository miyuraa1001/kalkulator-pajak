Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793461721388_a3c6ab00.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)

# Sample the paper sheet (around top right, e.g. x=600, y=200)
Write-Output "Sampling paper sheet:"
for ($y = 150; $y -le 350; $y += 50) {
    for ($x = 550; $x -le 700; $x += 50) {
        $c = $bmp.GetPixel($x, $y)
        Write-Output "($x,$y): R=$($c.R), G=$($c.G), B=$($c.B)"
    }
}

$bmp.Dispose()

