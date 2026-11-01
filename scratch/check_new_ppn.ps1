Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793461721388_a3c6ab00.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"

# Sample corners to see background color
Write-Output "Top-Left (0,0): $($bmp.GetPixel(0,0))"
Write-Output "Top-Right ($($bmp.Width-1),0): $($bmp.GetPixel($bmp.Width-1,0))"
Write-Output "Bottom-Left (0,$($bmp.Height-1)): $($bmp.GetPixel(0,$bmp.Height-1))"
Write-Output "Bottom-Right ($($bmp.Width-1),$($bmp.Height-1)): $($bmp.GetPixel($bmp.Width-1,$bmp.Height-1))"

$bmp.Dispose()

