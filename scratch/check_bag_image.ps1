Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793463744092_560cbaf0.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
Write-Output "Corner (0,0): $($bmp.GetPixel(0,0))"
Write-Output "Corner (W-1, H-1): $($bmp.GetPixel($bmp.Width-1, $bmp.Height-1))"

# Check where the bag and document are (sample center)
Write-Output "Center (W/2, H/2): $($bmp.GetPixel([int]($bmp.Width/2), [int]($bmp.Height/2)))"

# Check document paper color around (600, 500)
Write-Output "Doc area (600, 500): $($bmp.GetPixel(600, 500))"
Write-Output "Doc area (650, 450): $($bmp.GetPixel(650, 450))"

# Check bag area (350, 500)
Write-Output "Bag area (350, 500): $($bmp.GetPixel(350, 500))"

$bmp.Dispose()

