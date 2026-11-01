$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class PercentProcessor
{
    public static void Process(string srcPath, string destPath)
    {
        using (Bitmap src = new Bitmap(srcPath))
        {
            int w = src.Width;
            int h = src.Height;

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = srcData.Stride;
            byte[] raw = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, raw, 0, raw.Length);
            src.UnlockBits(srcData);

            byte[] outRaw = new byte[stride * h];

            int minX = w, maxX = 0, minY = h, maxY = 0;

            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int idx = y * stride + x * 4;
                    byte b = raw[idx];
                    byte g = raw[idx + 1];
                    byte r = raw[idx + 2];

                    int minVal = Math.Min(r, Math.Min(g, b));
                    int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                    // Pure white background
                    if (r >= 246 && g >= 246 && b >= 244)
                    {
                        outRaw[idx] = 0;
                        outRaw[idx + 1] = 0;
                        outRaw[idx + 2] = 0;
                        outRaw[idx + 3] = 0;
                    }
                    // Edge pixels fading to white
                    else if (minVal >= 222 && maxDiff < 18)
                    {
                        double aFactor = 1.0 - ((double)(minVal - 222) / (246.0 - 222.0));
                        if (aFactor < 0.05)
                        {
                            outRaw[idx] = 0;
                            outRaw[idx + 1] = 0;
                            outRaw[idx + 2] = 0;
                            outRaw[idx + 3] = 0;
                        }
                        else
                        {
                            byte alpha = (byte)(aFactor * 255.0);
                            
                            // Unmultiply white
                            int unR = (int)Math.Max(0, Math.Min(255, (r - (1.0 - aFactor) * 255.0) / aFactor));
                            int unG = (int)Math.Max(0, Math.Min(255, (g - (1.0 - aFactor) * 255.0) / aFactor));
                            int unB = (int)Math.Max(0, Math.Min(255, (b - (1.0 - aFactor) * 255.0) / aFactor));

                            outRaw[idx] = (byte)unB;
                            outRaw[idx + 1] = (byte)unG;
                            outRaw[idx + 2] = (byte)unR;
                            outRaw[idx + 3] = alpha;

                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                    // Solid foreground object
                    else
                    {
                        outRaw[idx] = b;
                        outRaw[idx + 1] = g;
                        outRaw[idx + 2] = r;
                        outRaw[idx + 3] = 255;

                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            int pad = 10;
            minX = Math.Max(0, minX - pad);
            minY = Math.Max(0, minY - pad);
            maxX = Math.Min(w - 1, maxX + pad);
            maxY = Math.Min(h - 1, maxY + pad);

            int outW = maxX - minX + 1;
            int outH = maxY - minY + 1;

            using (Bitmap dest = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
            {
                BitmapData destData = dest.LockBits(new Rectangle(0, 0, outW, outH), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                int destStride = destData.Stride;
                byte[] destRaw = new byte[destStride * outH];

                for (int y = 0; y < outH; y++)
                {
                    int srcY = minY + y;
                    for (int x = 0; x < outW; x++)
                    {
                        int srcX = minX + x;
                        int srcIdx = srcY * stride + srcX * 4;
                        int destIdx = y * destStride + x * 4;

                        destRaw[destIdx] = outRaw[srcIdx];
                        destRaw[destIdx + 1] = outRaw[srcIdx + 1];
                        destRaw[destIdx + 2] = outRaw[srcIdx + 2];
                        destRaw[destIdx + 3] = outRaw[srcIdx + 3];
                    }
                }

                System.Runtime.InteropServices.Marshal.Copy(destRaw, 0, destData.Scan0, destRaw.Length);
                dest.UnlockBits(destData);
                dest.Save(destPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793464739297_f84f5d5d.jpg"
$dest = "scratch\ppn11_badge_3d_clean.png"

[PercentProcessor]::Process($src, $dest)
Write-Output "Successfully processed 11% 3D badge!"

