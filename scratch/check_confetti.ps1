Add-Type -AssemblyName System.Drawing

$file = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793463744092_560cbaf0.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)

Write-Output "Sampling confetti papers:"
Write-Output "Top-left paper (230, 260): $($bmp.GetPixel(230, 260))"
Write-Output "Top-right paper (760, 310): $($bmp.GetPixel(760, 310))"
Write-Output "Bottom-left paper (280, 660): $($bmp.GetPixel(280, 660))"
Write-Output "Small sphere 1 (440, 305): $($bmp.GetPixel(440, 305))"
Write-Output "Small sphere 2 (880, 565): $($bmp.GetPixel(880, 565))"

$bmp.Dispose()

