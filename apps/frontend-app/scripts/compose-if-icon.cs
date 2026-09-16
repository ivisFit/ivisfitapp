// Recorta la I blanca y la F amarilla del wordmark IVISFIT y arma los PNG
// de ícono PWA. Compilar: csc /t:exe /r:System.Drawing.dll compose-if-icon.cs
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

internal static class ComposeIfIcon
{
    const int InkThreshold = 70;
    const int YellowBlueMax = 90;
    const int Bg = 15;

    struct Blob
    {
        public Rectangle Bounds;
        public List<int> Pixels;
    }

    static int Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.Error.WriteLine("usage: compose-if-icon.exe <wordmark.png> <outDir>");
            return 1;
        }

        string sourcePath = args[0];
        string outDir = args[1];
        Directory.CreateDirectory(outDir);

        using (var loaded = new Bitmap(sourcePath))
        using (var source = loaded.Clone(new Rectangle(0, 0, loaded.Width, loaded.Height), PixelFormat.Format32bppArgb))
        {
            int w = source.Width;
            int h = source.Height;
            int[] pixels = LockPixels(source);

            List<Blob> whiteBlobs = FindBlobs(pixels, w, h, yellow: false);
            List<Blob> yellowBlobs = FindBlobs(pixels, w, h, yellow: true);
            Console.WriteLine("white blobs: {0}", whiteBlobs.Count);
            foreach (Blob b in whiteBlobs) Console.WriteLine("  {0} n={1}", b.Bounds, b.Pixels.Count);
            Console.WriteLine("yellow blobs: {0}", yellowBlobs.Count);
            foreach (Blob b in yellowBlobs) Console.WriteLine("  {0} n={1}", b.Bounds, b.Pixels.Count);

            using (Bitmap iLetter = ExtractLetter(pixels, w, h, whiteBlobs[0]))
            using (Bitmap fLetter = ExtractLetter(pixels, w, h, UnionF(yellowBlobs, h)))
            using (Bitmap master = ComposeMaster(iLetter, fLetter, 1024, padRatio: 0.17f))
            using (Bitmap maskable = ComposeMaster(iLetter, fLetter, 1024, padRatio: 0.24f))
            {
                iLetter.Save(Path.Combine(outDir, "debug-i.png"), ImageFormat.Png);
                fLetter.Save(Path.Combine(outDir, "debug-f.png"), ImageFormat.Png);
                SavePng(Resize(master, 192), Path.Combine(outDir, "icon-if-192.png"));
                SavePng(Resize(master, 512), Path.Combine(outDir, "icon-if-512.png"));
                SavePng(Resize(maskable, 512), Path.Combine(outDir, "icon-if-512-maskable.png"));
                SavePng(Resize(master, 192), Path.Combine(outDir, "apple-icon.png"));
                SavePng(new Bitmap(master), Path.Combine(outDir, "icon-if-1024.png"));
            }
        }

        return 0;
    }

    static bool IsILike(Rectangle r, int imageH)
    {
        return r.Height > imageH * 0.7 && r.Width < r.Height * 0.65;
    }

    static Blob UnionF(List<Blob> yellowBlobs, int imageH)
    {
        var parts = new List<int>();
        int minX = int.MaxValue, minY = int.MaxValue, maxX = 0, maxY = 0;
        foreach (Blob blob in yellowBlobs)
        {
            if (IsILike(blob.Bounds, imageH)) break;
            parts.AddRange(blob.Pixels);
            if (blob.Bounds.X < minX) minX = blob.Bounds.X;
            if (blob.Bounds.Y < minY) minY = blob.Bounds.Y;
            if (blob.Bounds.Right > maxX) maxX = blob.Bounds.Right;
            if (blob.Bounds.Bottom > maxY) maxY = blob.Bounds.Bottom;
        }
        if (parts.Count == 0) throw new InvalidOperationException("F not found");
        return new Blob
        {
            Bounds = Rectangle.FromLTRB(minX, minY, maxX, maxY),
            Pixels = parts
        };
    }

    static List<Blob> FindBlobs(int[] pixels, int w, int h, bool yellow)
    {
        bool[] visited = new bool[w * h];
        var blobs = new List<Blob>();
        int[] dx = { -1, 0, 1, -1, 1, -1, 0, 1 };
        int[] dy = { -1, -1, -1, 0, 0, 1, 1, 1 };

        for (int seed = 0; seed < pixels.Length; seed++)
        {
            if (visited[seed] || !IsTarget(pixels[seed], yellow)) continue;

            var body = new List<int>();
            var queue = new Queue<int>();
            visited[seed] = true;
            queue.Enqueue(seed);
            int minX = seed % w, maxX = minX, minY = seed / w, maxY = minY;

            while (queue.Count > 0)
            {
                int i = queue.Dequeue();
                body.Add(i);
                int x = i % w;
                int y = i / w;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                for (int n = 0; n < 8; n++)
                {
                    int nx = x + dx[n];
                    int ny = y + dy[n];
                    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                    int ni = ny * w + nx;
                    if (visited[ni]) continue;
                    if (!IsTarget(pixels[ni], yellow)) continue;
                    visited[ni] = true;
                    queue.Enqueue(ni);
                }
            }

            if (body.Count < 80) continue;
            blobs.Add(new Blob
            {
                Bounds = Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1),
                Pixels = body
            });
        }

        blobs.Sort((a, b) => a.Bounds.X.CompareTo(b.Bounds.X));
        return blobs;
    }

    static bool IsTarget(int argb, bool yellow)
    {
        int r = (argb >> 16) & 255;
        int g = (argb >> 8) & 255;
        int b = argb & 255;
        if (r + g + b < InkThreshold) return false;
        bool isYellow = b < YellowBlueMax && r > 140 && g > 110 && r + 20 > b * 2;
        return yellow ? isYellow : !isYellow;
    }

    static Bitmap ExtractLetter(int[] pixels, int w, int h, Blob blob)
    {
        Rectangle box = blob.Bounds;
        var bmp = new Bitmap(box.Width, box.Height, PixelFormat.Format32bppArgb);
        var data = bmp.LockBits(new Rectangle(0, 0, box.Width, box.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        try
        {
            int stride = Math.Abs(data.Stride);
            byte[] buffer = new byte[stride * box.Height];
            foreach (int i in blob.Pixels)
            {
                int sx = i % w;
                int sy = i / w;
                int dx = sx - box.X;
                int dy = sy - box.Y;
                int argb = pixels[i];
                int o = dy * stride + dx * 4;
                buffer[o] = (byte)(argb & 255);
                buffer[o + 1] = (byte)((argb >> 8) & 255);
                buffer[o + 2] = (byte)((argb >> 16) & 255);
                buffer[o + 3] = 255;
            }
            Marshal.Copy(buffer, 0, data.Scan0, buffer.Length);
        }
        finally
        {
            bmp.UnlockBits(data);
        }
        return bmp;
    }

    static int[] LockPixels(Bitmap bmp)
    {
        var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
        BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        try
        {
            int bytes = Math.Abs(data.Stride) * bmp.Height;
            byte[] buffer = new byte[bytes];
            Marshal.Copy(data.Scan0, buffer, 0, bytes);
            int[] pixels = new int[bmp.Width * bmp.Height];
            int stride = data.Stride;
            for (int y = 0; y < bmp.Height; y++)
            {
                int row = y * stride;
                for (int x = 0; x < bmp.Width; x++)
                {
                    int o = row + x * 4;
                    pixels[y * bmp.Width + x] = buffer[o] | (buffer[o + 1] << 8) | (buffer[o + 2] << 16) | (buffer[o + 3] << 24);
                }
            }
            return pixels;
        }
        finally
        {
            bmp.UnlockBits(data);
        }
    }

    static Bitmap ComposeMaster(Bitmap iLetter, Bitmap fLetter, int size, float padRatio)
    {
        int pad = (int)Math.Round(size * padRatio);
        int inner = size - pad * 2;
        int gap = Math.Max(6, inner / 32);

        float iAspect = (float)iLetter.Width / iLetter.Height;
        float fAspect = (float)fLetter.Width / fLetter.Height;
        float totalAspect = iAspect + fAspect + (float)gap / Math.Max(iLetter.Height, fLetter.Height);

        int contentH = inner;
        int contentW = (int)Math.Round(contentH * totalAspect);
        if (contentW > inner)
        {
            contentW = inner;
            contentH = (int)Math.Round(contentW / totalAspect);
        }

        int iH = contentH;
        int fH = (int)Math.Round(contentH * ((float)fLetter.Height / iLetter.Height));
        if (fH > contentH)
        {
            fH = contentH;
            iH = (int)Math.Round(contentH * ((float)iLetter.Height / fLetter.Height));
        }
        int iW = (int)Math.Round(iH * iAspect);
        int fW = (int)Math.Round(fH * fAspect);

        var canvas = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(canvas))
        {
            g.Clear(Color.FromArgb(255, Bg, Bg, Bg));
            g.CompositingMode = CompositingMode.SourceOver;
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.SmoothingMode = SmoothingMode.HighQuality;

            int pairW = iW + gap + fW;
            int pairH = Math.Max(iH, fH);
            int x = (size - pairW) / 2;
            int y = (size - pairH) / 2;
            g.DrawImage(iLetter, new Rectangle(x, y + (pairH - iH), iW, iH));
            g.DrawImage(fLetter, new Rectangle(x + iW + gap, y + (pairH - fH), fW, fH));
        }
        return canvas;
    }

    static Bitmap Resize(Bitmap source, int size)
    {
        var dest = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(dest))
        {
            g.Clear(Color.FromArgb(255, Bg, Bg, Bg));
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.DrawImage(source, new Rectangle(0, 0, size, size));
        }
        return dest;
    }

    static void SavePng(Bitmap bmp, string path)
    {
        bmp.Save(path, ImageFormat.Png);
        bmp.Dispose();
        Console.WriteLine("wrote {0}", path);
    }
}
