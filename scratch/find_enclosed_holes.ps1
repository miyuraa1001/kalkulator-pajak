Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg')

Write-Output "Finding white pixels surrounded by blue in lower circle (X=480..580, Y=370..480):"
for ($y = 390; $y -le 460; $y += 5) {
    for ($x = 490; $x -le 560; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            # Check if this pixel has blue pixels to its left, right, top, bottom:
            $hasBlueL = $false; $hasBlueR = $false; $hasBlueU = $false; $hasBlueD = $false
            for ($d = 5; $d -le 60; $d += 5) {
                if ($img.GetPixel($x - $d, $y).B -gt 190) { $hasBlueL = $true }
                if ($img.GetPixel($x + $d, $y).B -gt 190) { $hasBlueR = $true }
                if ($img.GetPixel($x, $y - $d).B -gt 190) { $hasBlueU = $true }
                if ($img.GetPixel($x, $y + $d).B -gt 190) { $hasBlueD = $true }
            }
            if ($hasBlueL -and $hasBlueR -and $hasBlueU -and $hasBlueD) {
                Write-Output "Enclosed white pixel in lower circle: ($x, $y)"
            }
        }
    }
}

Write-Output "Finding white pixels surrounded by blue in upper circle (X=390..450, Y=250..320):"
for ($y = 250; $y -le 320; $y += 5) {
    for ($x = 390; $x -le 450; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            $hasBlueL = $false; $hasBlueR = $false; $hasBlueU = $false; $hasBlueD = $false
            for ($d = 5; $d -le 60; $d += 5) {
                if ($img.GetPixel($x - $d, $y).B -gt 190) { $hasBlueL = $true }
                if ($img.GetPixel($x + $d, $y).B -gt 190) { $hasBlueR = $true }
                if ($img.GetPixel($x, $y - $d).B -gt 190) { $hasBlueU = $true }
                if ($img.GetPixel($x, $y + $d).B -gt 190) { $hasBlueD = $true }
            }
            if ($hasBlueL -and $hasBlueR -and $hasBlueU -and $hasBlueD) {
                Write-Output "Enclosed white pixel in upper circle: ($x, $y)"
            }
        }
    }
}

$img.Dispose()

