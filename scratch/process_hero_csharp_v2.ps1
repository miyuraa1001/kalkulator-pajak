$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class ImageProcessor
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

            bool[,] isBg = new bool[w, h];
            Queue<Point> queue = new Queue<Point>();

            // Enqueue all border pixels
            for (int x = 0; x < w; x++)
            {
                isBg[x, 0] = true;
                queue.Enqueue(new Point(x, 0));
                isBg[x, h - 1] = true;
                queue.Enqueue(new Point(x, h - 1));
            }
            for (int y = 0; y < h; y++)
            {
                isBg[0, y] = true;
                queue.Enqueue(new Point(0, y));
                isBg[w - 1, y] = true;
                queue.Enqueue(new Point(w - 1, y));
            }

            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };

            while (queue.Count > 0)
            {
                Point pt = queue.Dequeue();
                for (int i = 0; i < 4; i++)
                {
                    int nx = pt.X + dx[i];
                    int ny = pt.Y + dy[i];

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && !isBg[nx, ny])
                    {
                        int idx = ny * stride + nx * 4;
                        byte b = raw[idx];
                        byte g = raw[idx + 1];
                        byte r = raw[idx + 2];

                        int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                        // Pure white background
                        bool isWhite = (r >= 242 && g >= 242 && b >= 240);

                        // Floor shadow at bottom: y > 530, grey shadow
                        bool isFloorShadow = (ny >= 530 && maxDiff <= 25 && r >= 110);

                        // Protect gold coins: R > 165, G > 115, B < 120, high saturation
                        bool isGold = (r >= 165 && g >= 115 && b <= 120 && (r - b) >= 35);
                        // Protect mint calculator: G >= 135, B >= 125, R <= 140
                        bool isMint = (g >= 135 && b >= 125 && r <= 140);
                        // Protect small floating confetti
                        bool isConfetti = (maxDiff >= 20 && (r < 240 || g < 240 || b < 240));

                        if ((isWhite || isFloorShadow) && !isGold && !isMint && !isConfetti)
                        {
                            isBg[nx, ny] = true;
                            queue.Enqueue(new Point(nx, ny));
                        }
                    }
                }
            }

            // Also directly eliminate any trapped grey floor shadows at y >= 535
            for (int y = 535; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (!isBg[x, y])
                    {
                        int idx = y * stride + x * 4;
                        byte b = raw[idx];
                        byte g = raw[idx + 1];
                        byte r = raw[idx + 2];

                        int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));
                        bool isGold = (r >= 165 && g >= 115 && b <= 120 && (r - b) >= 35);
                        bool isMint = (g >= 135 && b >= 125 && r <= 140);
                        
                        // Anything below y = 612 is outside the coins/calculator
                        if (y >= 612)
                        {
                            isBg[x, y] = true;
                        }
                        // Trapped grey shadow between calculator and coins
                        else if (maxDiff <= 25 && r >= 100 && !isGold && !isMint)
                        {
                            isBg[x, y] = true;
                        }
                    }
                }
            }

            // Find foreground bounds
            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (!isBg[x, y])
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            int pad = 12;
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
                        int destIdx = y * destStride + x * 4;

                        if (isBg[srcX, srcY])
                        {
                            destRaw[destIdx] = 0;
                            destRaw[destIdx + 1] = 0;
                            destRaw[destIdx + 2] = 0;
                            destRaw[destIdx + 3] = 0;
                        }
                        else
                        {
                            int srcIdx = srcY * stride + srcX * 4;
                            byte b = raw[srcIdx];
                            byte g = raw[srcIdx + 1];
                            byte r = raw[srcIdx + 2];

                            // Soft edge anti-aliasing
                            int bgCount = 0;
                            if (srcX > 0 && isBg[srcX - 1, srcY]) bgCount++;
                            if (srcX < w - 1 && isBg[srcX + 1, srcY]) bgCount++;
                            if (srcY > 0 && isBg[srcX, srcY - 1]) bgCount++;
                            if (srcY < h - 1 && isBg[srcX, srcY + 1]) bgCount++;

                            byte alpha = 255;
                            if (bgCount > 0 && r >= 220 && g >= 220 && b >= 220)
                            {
                                int a = 255 - (bgCount * 45);
                                if (a < 40) a = 40;
                                alpha = (byte)a;
                            }

                            destRaw[destIdx] = b;
                            destRaw[destIdx + 1] = g;
                            destRaw[destIdx + 2] = r;
                            destRaw[destIdx + 3] = alpha;
                        }
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

$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793461721388_a3c6ab00.jpg"
$dest = "scratch\new_ppn_hero_clean.png"

[ImageProcessor]::Process($src, $dest)
Write-Output "Successfully processed image in native C# with zero floor shadow!"

