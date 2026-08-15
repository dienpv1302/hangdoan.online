# =============================================================================
# THU NHỎ ẢNH CHO ALBUM CƯỚI
#
# Cách dùng:
#   .\tools\thu-nho-anh.ps1              -> nén ảnh, GIỮ nguyên ảnh gốc
#   .\tools\thu-nho-anh.ps1 -XoaAnhGoc   -> nén xong thì xoá ảnh gốc cho nhẹ
#
# Ảnh gốc chỉ bị xoá khi cả hai thư mục thumb/ và large/ đã đủ file.
# =============================================================================
param([switch]$XoaAnhGoc)

Add-Type -AssemblyName System.Drawing

$src      = Join-Path $PSScriptRoot "..\assets\images\all_image"
$src      = (Resolve-Path $src).Path
$thumbDir = Join-Path $src "thumb"
$largeDir = Join-Path $src "large"

New-Item -ItemType Directory -Force $thumbDir | Out-Null
New-Item -ItemType Directory -Force $largeDir | Out-Null

# Muốn ảnh nét hơn thì tăng số pixel và số chất lượng, ảnh sẽ nặng hơn
$THUMB_PX = 700;  $THUMB_Q = 80      # ảnh trong lưới album
$LARGE_PX = 1800; $LARGE_Q = 82      # ảnh khi bấm xem phóng to
$MAX_BYTES = 600 * 1024              # trần cứng: mỗi file không quá 600 KB

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Resized {
    param($img, [int]$maxSide, [string]$outPath, [int]$quality, [int]$maxBytes)

    $ratio = [Math]::Min($maxSide / $img.Width, $maxSide / $img.Height)
    if ($ratio -gt 1) { $ratio = 1 }
    $w = [int][Math]::Round($img.Width * $ratio)
    $h = [int][Math]::Round($img.Height * $ratio)

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()

    # Vượt trần dung lượng thì hạ dần chất lượng cho tới khi đạt
    $q = $quality
    $size = 0
    while ($true) {
        $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, [int64]$q)
        $bmp.Save($outPath, $codec, $ep)
        $ep.Dispose()

        $size = (Get-Item $outPath).Length
        if ($size -le $maxBytes -or $q -le 45) { break }
        $q -= 6
    }

    $bmp.Dispose()
    return @{ W = $w; H = $h; KB = [math]::Round($size / 1KB) }
}

$originals = Get-ChildItem $src -File |
             Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' } | Sort-Object Name

if ($originals.Count -eq 0) {
    "Khong tim thay anh goc nao trong $src"
    "Chep anh can them vao thu muc do roi chay lai."
    return
}

"Tim thay $($originals.Count) anh. Bat dau nen (tran 600 KB moi file)..."
""

$ok = 0
foreach ($f in $originals) {
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)

        # Xoay theo thẻ EXIF nếu máy ảnh có ghi
        if ($img.PropertyIdList -contains 274) {
            switch ($img.GetPropertyItem(274).Value[0]) {
                3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
        }

        $outName = [IO.Path]::GetFileNameWithoutExtension($f.Name) + ".jpg"
        $t = Save-Resized $img $THUMB_PX (Join-Path $thumbDir $outName) $THUMB_Q $MAX_BYTES
        $l = Save-Resized $img $LARGE_PX (Join-Path $largeDir $outName) $LARGE_Q $MAX_BYTES
        $img.Dispose()

        $ok++
        "[$ok/$($originals.Count)] $($f.Name) -> thumb $($t.W)x$($t.H) $($t.KB)KB | large $($l.W)x$($l.H) $($l.KB)KB"
    }
    catch {
        "LOI $($f.Name): $($_.Exception.Message)"
    }
}

""
if ($XoaAnhGoc) {
    $thumbCount = (Get-ChildItem $thumbDir -File -Filter *.jpg).Count
    $largeCount = (Get-ChildItem $largeDir -File -Filter *.jpg).Count

    if ($ok -eq $originals.Count -and $thumbCount -ge $originals.Count -and $largeCount -ge $originals.Count) {
        $originals | Remove-Item -Force
        Get-ChildItem $src -File -Filter "Thumbs.db" -Force -ErrorAction SilentlyContinue | Remove-Item -Force
        "Da xoa $($originals.Count) anh goc."
    }
    else {
        "Chua du file nen KHONG xoa gi ca. Anh goc van con nguyen."
    }
}
else {
    "Anh goc duoc giu nguyen. Muon xoa cho nhe, chay lai voi tham so -XoaAnhGoc"
}

""
$t = [math]::Round(((Get-ChildItem $thumbDir -File | Measure-Object Length -Sum).Sum / 1MB), 2)
$l = [math]::Round(((Get-ChildItem $largeDir -File | Measure-Object Length -Sum).Sum / 1MB), 2)
$all = [math]::Round(((Get-ChildItem $src -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 2)
"thumb = $t MB | large = $l MB | ca thu muc all_image = $all MB"
"Nho cap nhat danh sach photos trong assets/js/wedding-config.js neu them anh moi."
