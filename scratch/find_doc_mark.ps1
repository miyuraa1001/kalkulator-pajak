Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

Write-Output "Finding orange mark on document (X=650..780, Y=220..350):"
for ($y = 220; $y -le 350; $y++) {
    for ($x = 650; $x -le 780; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 210 -and $c.G -gt 130 -and $c.G -lt 190 -and $c.B -lt 100) {
            Write-Output "Orange mark at ($x, $y): R=$($c.R) G=$($c.G) B=$($c.B)"
            break
        }
    }
}

$img.Dispose()

