Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793508043802_4cd7ef26.jpg')

Write-Output "Sampling row Y=300 from X=750 to 780:"
for ($x = 750; $x -le 780; $x += 2) {
    $c = $img.GetPixel($x, 300)
    Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

