Add-Type -AssemblyName System.Drawing

$srcFile = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793461721388_a3c6ab00.jpg"
$bmp = New-Object System.Drawing.Bitmap($srcFile)
$w = $bmp.Width
$h = $bmp.Height

Write-Output "Processing image: ${w}x${h}..."

# Flood fill / BFS from borders to identify outer background
$isBg = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Enqueue all border pixels
for ($x = 0; $x -lt $w; $x++) {
    $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $queue.Enqueue((New-Object System.Drawing.Point($x, $h - 1)))
    $isBg[$x, 0] = $true
    $isBg[$x, $h - 1] = $true
}
for ($y = 0; $y -lt $h; $y++) {
    $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $queue.Enqueue((New-Object System.Drawing.Point($w - 1, $y)))
    $isBg[0, $y] = $true
    $isBg[$w - 1, $y] = $true
}

# BFS: expand into white or light grey floor shadow
# Background threshold:
# Near white: R > 240, G > 240, B > 240
# Floor shadow at bottom: y > 560, grey shadow (maxDiff < 18, R > 150)
while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $cx = $pt.X
    $cy = $pt.Y
    
    # 4 neighbors
    $neighbors = @(
        (New-Object System.Drawing.Point($cx + 1, $cy)),
        (New-Object System.Drawing.Point($cx - 1, $cy)),
        (New-Object System.Drawing.Point($cx, $cy + 1)),
        (New-Object System.Drawing.Point($cx, $cy - 1))
    )
    
    foreach ($n in $neighbors) {
        $nx = $n.X
        $ny = $n.Y
        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
            if (-not $isBg[$nx, $ny]) {
                $c = $bmp.GetPixel($nx, $ny)
                $r = [int]$c.R
                $g = [int]$c.G
                $b = [int]$c.B
                $maxDiff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
                
                # Check if this pixel is background
                $isWhite = ($r -gt 242) -and ($g -gt 242) -and ($b -gt 240)
                # Check if it's floor shadow: at bottom (y > 560), low saturation, grey
                $isFloorShadow = ($ny -gt 565) -and ($maxDiff -lt 20) -and ($r -gt 130)
                
                # Protect coins and confetti:
                # Gold coins have high R and G, lower B (R > 180, G > 140, B < 120, maxDiff > 40)
                # Mint calculator has G > 140, B > 130
                $isGold = ($r -gt 180) -and ($g -gt 130) -and ($b -lt 110)
                $isMint = ($g -gt 145) -and ($b -gt 135) -and ($r -lt 130)
                
                if (($isWhite -or $isFloorShadow) -and (-not $isGold) -and (-not $isMint)) {
                    $isBg[$nx, $ny] = $true
                    $queue.Enqueue($n)
                }
            }
        }
    }
}

Write-Output "BFS complete. Creating transparent output image..."

# Create transparent bitmap
$outBmp = New-Object System.Drawing.Bitmap($w, $h)

# Find bounding box of foreground
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        if ($isBg[$x, $y]) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $c = $bmp.GetPixel($x, $y)
            $r = [int]$c.R
            $g = [int]$c.G
            $b = [int]$c.B
            
            # Anti-aliasing edge softening for pixels next to background
            $bgNeighbors = 0
            if ($x -gt 0 -and $isBg[$x - 1, $y]) { $bgNeighbors++ }
            if ($x -lt $w - 1 -and $isBg[$x + 1, $y]) { $bgNeighbors++ }
            if ($y -gt 0 -and $isBg[$x, $y - 1]) { $bgNeighbors++ }
            if ($y -lt $h - 1 -and $isBg[$x, $y + 1]) { $bgNeighbors++ }
            
            if ($bgNeighbors -gt 0 -and ($r -gt 220 -and $g -gt 220 -and $b -gt 220)) {
                # Edge pixel with high brightness: soften alpha
                $alpha = [int](255 * (1.0 - ($bgNeighbors * 0.2)))
                if ($alpha -lt 50) { $alpha = 50 }
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
            }
            
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Foreground bounds: X=($minX to $maxX), Y=($minY to $maxY)"
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1

# Crop to foreground bounding box with 10px margin
$pad = 10
$finalMinX = [Math]::Max(0, $minX - $pad)
$finalMinY = [Math]::Max(0, $minY - $pad)
$finalMaxX = [Math]::Min($w - 1, $maxX + $pad)
$finalMaxY = [Math]::Min($h - 1, $maxY + $pad)
$finalW = $finalMaxX - $finalMinX + 1
$finalH = $finalMaxY - $finalMinY + 1

$cropped = New-Object System.Drawing.Bitmap($finalW, $finalH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$srcRect = New-Object System.Drawing.Rectangle($finalMinX, $finalMinY, $finalW, $finalH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $finalW, $finalH)
$g.DrawImage($outBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$cropped.Save("scratch\new_ppn_hero_clean.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved cropped clean PNG: ${finalW}x${finalH} to scratch\new_ppn_hero_clean.png"

$bmp.Dispose()
$outBmp.Dispose()
$cropped.Dispose()

