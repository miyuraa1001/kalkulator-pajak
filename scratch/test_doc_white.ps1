Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

# Check document area: X: 570..760, Y: 370..640
$whiteInDoc = 0
for ($y = 370; $y -le 640; $y++) {
    for ($x = 570; $x -le 760; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -ge 246 -and $c.G -ge 246 -and $c.B -ge 246 -and $diff -le 12) {
            $whiteInDoc++
        }
    }
}
Write-Output "White pixels matching background criteria strictly inside document (X=570..760, Y=370..640): $whiteInDoc"

$img.Dispose()

