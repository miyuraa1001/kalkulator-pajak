Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793504903873_c1b2112d.jpg')

Write-Output "Sampling bottom area Y=590..630 across X=200..750:"
foreach ($y in @(595, 605, 612, 618, 625)) {
    Write-Output "--- Y=$y ---"
    for ($x = 220; $x -le 740; $x += 40) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        if ($c.R -lt 250 -or $c.G -lt 250 -or $c.B -lt 250) {
            Write-Output "X=$($x): R=$($c.R) G=$($c.G) B=$($c.B) diff=$diff"
        }
    }
}

# Inspect the binder loops at the top of the calendar:
# Two white loops:
# Around X=530 and X=710, Y=140..250?
Write-Output "Searching top loops:"
for ($y = 140; $y -le 240; $y += 10) {
    for ($x = 480; $x -le 760; $x += 20) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            # Write if non-white
        }
    }
}

$img.Dispose()

