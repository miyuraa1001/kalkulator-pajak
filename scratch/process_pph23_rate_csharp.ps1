$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class RateProcessor
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
                isBg[x, 0] = true; queue.Enqueue(new Point(x, 0));
                isBg[x, h - 1] = true; queue.Enqueue(new Point(x, h - 1));
            }
            for (int y = 0; y < h; y++)
            {
                isBg[0, y] = true; queue.Enqueue(new Point(0, y));
                isBg[w - 1, y] = true; queue.Enqueue(new Point(w - 1, y));
            }

            // Enqueue enclosed hole seeds:
            // 1. Upper circle hole of %
            if (!isBg[430, 285]) { isBg[430, 285] = true; queue.Enqueue(new Point(430, 285)); }
            // 2. Lower circle hole of %
            if (!isBg[530, 440]) { isBg[530, 440] = true; queue.Enqueue(new Point(530, 440)); }

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

                        bool isWhite = (r >= 244 && g >= 244 && b >= 244 && maxDiff <= 12) || (r >= 250 && g >= 250 && b >= 250);

                        if (isWhite)
                        {
                            isBg[nx, ny] = true;
                            queue.Enqueue(new Point(nx, ny));
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
                            if (bgCount > 0 && r >= 225 && g >= 225 && b >= 225)
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

$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793473503814_d52e11af.jpg"
$dest = "scratch\pph23_rate_clean.png"

[RateProcessor]::Process($src, $dest)
Write-Output "Successfully processed PPh 23 rate image!"

