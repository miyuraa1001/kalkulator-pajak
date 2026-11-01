Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793506229955_1b54136b.jpg')

# Check document core: X=350..600, Y=180..500
$docBright = 0
for ($y = 180; $y -le 500; $y += 2) {
    for ($x = 350; $x -le 600; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -ge 245 -and $c.G -ge 245 -and $c.B -ge 245 -and $diff -le 12) {
            $docBright++
        }
    }
}
Write-Output "Document core white pixels matching background: $docBright"

# Check calendar white page: X=640..780, Y=400..540
$calBright = 0
for ($y = 400; $y -le 540; $y += 2) {
    for ($x = 640; $x -le 780; $x += 2) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -ge 245 -and $c.G -ge 245 -and $c.B -ge 245 -and $diff -le 12) {
            $calBright++
        }
    }
}
Write-Output "Calendar white page pixels matching background: $calBright"

$img.Dispose()

