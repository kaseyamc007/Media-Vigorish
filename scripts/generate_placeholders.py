import zlib
import struct
import os

def make_fast_png(width, height, c1, c2):
    # c1: top-left (r,g,b), c2: bottom-right (r,g,b)
    r1, g1, b1 = c1
    r2, g2, b2 = c2
    rows = []
    
    # Pre-calculate a few palette steps
    for y in range(height):
        t = y / max(1, height - 1)
        # Line color
        r = int(r1 * (1 - t) + r2 * t)
        g = int(g1 * (1 - t) + g2 * t)
        b = int(b1 * (1 - t) + b2 * t)
        
        # Grid line every 60px
        is_grid_y = (y % 60 == 0) or (y == 0) or (y == height - 1)
        if is_grid_y:
            gr, gg, gb = min(255, r + 40), min(255, g + 40), min(255, b + 55)
            row_bytes = b'\x00' + bytes([gr, gg, gb]) * width
        else:
            # Create a row with occasional grid tick
            pix1 = bytes([r, g, b])
            pix_tick = bytes([min(255, r + 30), min(255, g + 30), min(255, b + 45)])
            # Build row using chunking
            chunk_size = 60
            n_chunks = width // chunk_size
            rem = width % chunk_size
            row_bytes = b'\x00' + (pix_tick + pix1 * (chunk_size - 1)) * n_chunks + pix1 * rem
        rows.append(row_bytes)
        
    raw = b''.join(rows)
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, level=1))
    png += chunk(b'IEND', b'')
    return png

os.makedirs('src/images', exist_ok=True)
os.makedirs('src/logo', exist_ok=True)
os.makedirs('src/icons', exist_ok=True)
os.makedirs('src/videos', exist_ok=True)

# Logo (320x96)
with open('src/logo/logo.png', 'wb') as f:
    f.write(make_fast_png(320, 96, (5, 47, 85), (8, 65, 120)))

# Placeholders (moderate resolutions, crisp loading)
placeholders = [
    ('src/images/hero-placeholder.jpg', 960, 600, (5, 47, 85), (15, 25, 40)),
    ('src/images/portfolio-01.jpg', 600, 450, (8, 35, 60), (25, 50, 80)),
    ('src/images/portfolio-02.jpg', 600, 750, (15, 23, 42), (5, 47, 85)),
    ('src/images/portfolio-03.jpg', 600, 450, (20, 35, 55), (40, 70, 95)),
    ('src/images/portfolio-04.jpg', 600, 750, (5, 47, 85), (12, 60, 105)),
    ('src/images/portfolio-branding.jpg', 600, 500, (8, 28, 48), (28, 62, 98)),
    ('src/images/portfolio-social-media.jpg', 600, 600, (12, 38, 66), (22, 54, 88)),
    ('src/images/portfolio-video.jpg', 800, 450, (5, 25, 45), (18, 48, 80)),
    ('src/images/portfolio-web.jpg', 600, 450, (10, 32, 58), (24, 70, 115)),
    ('src/images/team-01.jpg', 450, 550, (15, 30, 50), (35, 55, 80)),
    ('src/images/team-02.jpg', 450, 550, (10, 25, 45), (30, 50, 75)),
    ('src/images/team-03.jpg', 450, 550, (8, 28, 52), (25, 60, 95)),
    ('src/images/team-04.jpg', 450, 550, (12, 35, 60), (40, 70, 105)),
    ('src/images/team-05.jpg', 450, 550, (6, 30, 55), (20, 50, 85)),
    ('src/images/case-study-01.jpg', 750, 500, (5, 47, 85), (25, 45, 70)),
    ('src/images/case-study-02.jpg', 750, 500, (10, 35, 65), (35, 65, 100)),
    ('src/images/case-study-03.jpg', 750, 500, (7, 40, 75), (20, 55, 90)),
    ('src/images/insights-01.jpg', 600, 380, (14, 30, 52), (32, 60, 92)),
    ('src/images/insights-02.jpg', 600, 380, (8, 36, 68), (26, 68, 110)),
    ('src/images/insights-03.jpg', 600, 380, (5, 47, 85), (30, 70, 115)),
    ('src/images/insights-04.jpg', 600, 380, (18, 35, 58), (28, 55, 85)),
    ('src/images/insights-05.jpg', 600, 380, (9, 33, 62), (20, 60, 100)),
    ('src/images/insights-06.jpg', 600, 380, (11, 40, 72), (35, 65, 105)),
    ('src/images/tuli-bantu-baluse.jpg', 700, 480, (20, 40, 65), (5, 47, 85)),
]

for path, w, h, c1, c2 in placeholders:
    with open(path, 'wb') as f:
        f.write(make_fast_png(w, h, c1, c2))

print(f"Generated {len(placeholders) + 1} asset files successfully.")
