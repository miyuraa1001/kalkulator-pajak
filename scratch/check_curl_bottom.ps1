Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473119766_29c0843e.jpg')

Write-Output "Checking below document curl (X=600..750, Y=640..680):"
for ($y = 640; $y -le 675; $y += 5) {
    $nonWhite = 0
    $avgR = 0; $avgG = 0; $avgB = 0;
    for ($x = 600; $x -le 750; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            $nonWhite++
            $avgR += $c.R; $avgG += $c.G; $avgB += $c.B
        }
    }
    if ($nonWhite -gt 0) {
        $avgR = [int]($avgR / $nonWhite); $avgG = [int]($avgG / $nonWhite); $avgB = [int]($avgB / $nonWhite)
        Write-Output "Y=$($y): non-white count=$nonWhite, avg color=($avgR, $avgG, $avgB)"
    } else {
        Write-Output "Y=$($y): completely white"
    }
}

$img.Dispose()

