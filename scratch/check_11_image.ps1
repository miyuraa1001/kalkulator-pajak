Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793464739297_f84f5d5d.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
Write-Output "Corner (0,0): $($bmp.GetPixel(0,0))"
Write-Output "Corner (W-1, H-1): $($bmp.GetPixel($bmp.Width-1, $bmp.Height-1))"

# Check color of 11% (center around W/2, H/2)
Write-Output "Center (W/2, H/2): $($bmp.GetPixel([int]($bmp.Width/2), [int]($bmp.Height/2)))"
Write-Output "Top arrow (W/2, H/4): $($bmp.GetPixel([int]($bmp.Width/2), [int]($bmp.Height*0.25)))"

$bmp.Dispose()

