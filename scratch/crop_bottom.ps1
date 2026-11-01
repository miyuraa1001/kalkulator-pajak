Add-Type -AssemblyName System.Drawing

$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793510318714_8be3a23d.jpg"
$img = [System.Drawing.Bitmap]::FromFile($src)
$rect = New-Object System.Drawing.Rectangle(240, 480, 525, 105)
$crop = $img.Clone($rect, $img.PixelFormat)
$crop.Save('scratch/original_bottom.png', [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose()
$img.Dispose()
Write-Output "Saved scratch/original_bottom.png"

