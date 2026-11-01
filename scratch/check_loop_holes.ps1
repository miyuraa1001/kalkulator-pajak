Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

Write-Output "Sampling inside left loop (X=520..560, Y=160..210):"
for ($y = 165; $y -le 210; $y += 5) {
    for ($x = 525; $x -le 555; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            Write-Output "  White at ($x, $y): $($c.R) $($c.G) $($c.B)"
        }
    }
}

Write-Output "Sampling inside right loop (X=700..740, Y=160..210):"
for ($y = 165; $y -le 210; $y += 5) {
    for ($x = 700; $x -le 740; $x += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            Write-Output "  White at ($x, $y): $($c.R) $($c.G) $($c.B)"
        }
    }
}

$img.Dispose()

