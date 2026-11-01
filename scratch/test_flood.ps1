Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile('C:/Users/ASUS/.gemini/antigravity/brain/25d705b4-cebe-4143-a193-8bb1bc40357d/.user_uploaded/media_1793510244086_d7aa53bb.jpg')
$w = $img.Width
$h = $img.Height

$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Enqueue border
for ($x = 0; $x -lt $w; $x++) {
    $visited[$x, 0] = $true; $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $visited[$x, $h - 1] = $true; $queue.Enqueue((New-Object System.Drawing.Point($x, $h - 1)))
}
for ($y = 0; $y -lt $h; $y++) {
    $visited[0, $y] = $true; $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $visited[$w - 1, $y] = $true; $queue.Enqueue((New-Object System.Drawing.Point($w - 1, $y)))
}

# Fast check function
# Let's see what is considered background:
# R >= 244, G >= 244, B >= 244, maxDiff <= 12

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $px = $pt.X
    $py = $pt.Y

    # 4 neighbors
    $neighbors = @(
        (New-Object System.Drawing.Point($px + 1, $py)),
        (New-Object System.Drawing.Point($px - 1, $py)),
        (New-Object System.Drawing.Point($px, $py + 1)),
        (New-Object System.Drawing.Point($px, $py - 1))
    )

    foreach ($n in $neighbors) {
        if ($n.X -ge 0 -and $n.X -lt $w -and $n.Y -ge 0 -and $n.Y -lt $h) {
            if (-not $visited[$n.X, $n.Y]) {
                $c = $img.GetPixel($n.X, $n.Y)
                $r = $c.R; $g = $c.G; $b = $c.B
                $maxDiff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
                
                # Check background condition
                $isBg = ($r -ge 245 -and $g -ge 245 -and $b -ge 245 -and $maxDiff -le 12) -or ($r -ge 250 -and $g -ge 250 -and $b -ge 250)
                
                # Floor shadow below plaque
                if (-not $isBg -and $py -ge 710 -and $maxDiff -le 15 -and $r -ge 210) {
                    $isBg = $true
                }

                if ($isBg) {
                    $visited[$n.X, $n.Y] = $true
                    $queue.Enqueue($n)
                }
            }
        }
    }
}

# Now find unvisited near-white pixels (R >= 248, G >= 248, B >= 248)
$unvisitedWhite = @()
for ($y = 0; $y -lt $h; $y += 5) {
    for ($x = 0; $x -lt $w; $x += 5) {
        if (-not $visited[$x, $y]) {
            $c = $img.GetPixel($x, $y)
            $r = $c.R; $g = $c.G; $b = $c.B
            $maxDiff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))
            if ($r -ge 248 -and $g -ge 248 -and $b -ge 248 -and $maxDiff -le 6) {
                $unvisitedWhite += [PSCustomObject]@{X=$x; Y=$y; R=$r; G=$g; B=$b}
            }
        }
    }
}

Write-Output "Unvisited pure white pixels found: $($unvisitedWhite.Count)"
# Group them roughly by region
$unvisitedWhite | Group-Object { [Math]::Floor($_.X / 100) * 100 }, { [Math]::Floor($_.Y / 100) * 100 } | ForEach-Object {
    Write-Output "Region X~$($_.Values[0]), Y~$($_.Values[1]): Count $($_.Count)"
}

$img.Dispose()

