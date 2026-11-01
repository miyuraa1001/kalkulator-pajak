Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg')

for ($y = 450; $y -le 570; $y += 5) {
    for ($x = 260; $x -le 350; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            Write-Output "Found non-white at ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
        }
    }
}

$img.Dispose()

