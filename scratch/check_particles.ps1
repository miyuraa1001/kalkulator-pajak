Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793469995990_3410d8c9.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)
Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
Write-Output "Corner (0,0): $($bmp.GetPixel(0,0))"
Write-Output "Corner (W-1, H-1): $($bmp.GetPixel($bmp.Width-1, $bmp.Height-1))"

# Sample big iridescent bubble around (320, 680)
Write-Output "Big Bubble (320, 680): $($bmp.GetPixel(320, 680))"
Write-Output "Big Bubble (300, 650): $($bmp.GetPixel(300, 650))"

# Sample gold coin around (450, 530)
Write-Output "Gold Coin (450, 530): $($bmp.GetPixel(450, 530))"

# Sample small blue bubble around (350, 260)
Write-Output "Small Blue Bubble (350, 260): $($bmp.GetPixel(350, 260))"

$bmp.Dispose()

