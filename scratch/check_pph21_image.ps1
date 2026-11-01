Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793468247702_91d9b16f.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
Write-Output "Corner (0,0): $($bmp.GetPixel(0,0))"
Write-Output "Corner (W-1, H-1): $($bmp.GetPixel($bmp.Width-1, $bmp.Height-1))"
Write-Output "Center (W/2, H/2): $($bmp.GetPixel([int]($bmp.Width/2), [int]($bmp.Height/2)))"

# Sample the employee shirt (blue/purple) around (550, 600)
Write-Output "Shirt (550, 600): $($bmp.GetPixel(550, 600))"

# Sample the paper document around (320, 500)
Write-Output "Paper (320, 500): $($bmp.GetPixel(320, 500))"

# Sample the pencil around (620, 500)
Write-Output "Pencil (620, 500): $($bmp.GetPixel(620, 500))"

# Sample the coins around (700, 700)
Write-Output "Coins (700, 700): $($bmp.GetPixel(700, 700))"

$bmp.Dispose()

