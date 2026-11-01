$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class HoleFinder
{
    public static void Find(string srcPath)
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

                        bool isWhite = (r >= 244 && g >= 244 && b >= 244 && maxDiff <= 12) || (r >= 248 && g >= 248 && b >= 248);
                        if (isWhite)
                        {
                            isBg[nx, ny] = true;
                            queue.Enqueue(new Point(nx, ny));
                        }
                    }
                }
            }

            // Now find unvisited white clusters
            bool[,] visited2 = new bool[w, h];
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (!isBg[x, y] && !visited2[x, y])
                    {
                        int idx = y * stride + x * 4;
                        byte b = raw[idx];
                        byte g = raw[idx + 1];
                        byte r = raw[idx + 2];
                        int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                        if (r >= 245 && g >= 245 && b >= 245 && maxDiff <= 10)
                        {
                            // Flood fill this component
                            List<Point> comp = new List<Point>();
                            Queue<Point> q2 = new Queue<Point>();
                            visited2[x, y] = true;
                            q2.Enqueue(new Point(x, y));

                            while (q2.Count > 0)
                            {
                                Point p = q2.Dequeue();
                                comp.Add(p);
                                for (int i = 0; i < 4; i++)
                                {
                                    int nx = p.X + dx[i];
                                    int ny = p.Y + dy[i];
                                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && !isBg[nx, ny] && !visited2[nx, ny])
                                    {
                                        int nidx = ny * stride + nx * 4;
                                        byte nb = raw[nidx];
                                        byte ng = raw[nidx + 1];
                                        byte nr = raw[nidx + 2];
                                        int nDiff = Math.Max(Math.Abs(nr - ng), Math.Max(Math.Abs(nr - nb), Math.Abs(ng - nb)));
                                        if (nr >= 240 && ng >= 240 && nb >= 240 && nDiff <= 12)
                                        {
                                            visited2[nx, ny] = true;
                                            q2.Enqueue(new Point(nx, ny));
                                        }
                                    }
                                }
                            }

                            if (comp.Count > 5)
                            {
                                int minCx = w, maxCx = 0, minCy = h, maxCy = 0;
                                foreach (Point p in comp)
                                {
                                    if (p.X < minCx) minCx = p.X;
                                    if (p.X > maxCx) maxCx = p.X;
                                    if (p.Y < minCy) minCy = p.Y;
                                    if (p.Y > maxCy) maxCy = p.Y;
                                }
                                Console.WriteLine(string.Format("White hole candidate: count={0}, X={1}..{2}, Y={3}..{4}, center=({5}, {6})",
                                    comp.Count, minCx, maxCx, minCy, maxCy, (minCx + maxCx)/2, (minCy + maxCy)/2));
                            }
                        }
                    }
                }
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
$src = "C:\Users\ASUS\.gemini\antigravity\brain\25d705b4-cebe-4143-a193-8bb1bc40357d\.user_uploaded\media_1793510244086_d7aa53bb.jpg"
[HoleFinder]::Find($src)

