Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')

# Check key area
$pts = @()
for ($y = 230; $y -lt 300; $y += 2) {
    for ($x = 140; $x -lt 210; $x += 2) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            $pts += [PSCustomObject]@{X=$x; Y=$y}
        }
    }
}
Write-Output "Key hole points count: $($pts.Count)"
if ($pts.Count -gt 0) {
    $minX = ($pts | Measure-Object -Property X -Minimum).Minimum
    $maxX = ($pts | Measure-Object -Property X -Maximum).Maximum
    $minY = ($pts | Measure-Object -Property Y -Minimum).Minimum
    $maxY = ($pts | Measure-Object -Property Y -Maximum).Maximum
    Write-Output "Key hole bounds: X=$minX..$maxX, Y=$minY..$maxY, Center: X=$([int](($minX+$maxX)/2)), Y=$([int](($minY+$maxY)/2))"
}

# Also check scaffolding between X: 400..600, Y: 450..660
# Are there enclosed white regions or is scaffolding connected to the background?
$img.Dispose()

