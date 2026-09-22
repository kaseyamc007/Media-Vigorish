#!/bin/bash
set -e

mkdir -p /tmp/umoyo_build
FONT="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

# Pre-scale images to clean 1280x720
ffmpeg -y -i src/assets/images/umoyo_store_front_1790063614381.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" /tmp/umoyo_build/img1.jpg
ffmpeg -y -i src/assets/images/umoyo_showcase_hero_1789918837890.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" /tmp/umoyo_build/img2.jpg
ffmpeg -y -i assets/umoyo-natural-health.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" /tmp/umoyo_build/img3.jpg
ffmpeg -y -i src/assets/images/umoyo_natural_health_store_1789917132707.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" /tmp/umoyo_build/img4.jpg
ffmpeg -y -i src/assets/images/umoyo_drinks_cooler_1790063596636.jpg -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" /tmp/umoyo_build/img5.jpg
ffmpeg -y -i assets/umoyo-official-logo.jpg -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(1280-iw)/2:(720-ih)/2:color=white" /tmp/umoyo_build/img6.jpg

# Generate fast 24fps clips with crisp typography
ffmpeg -y -loop 1 -t 2.8 -i /tmp/umoyo_build/img1.jpg \
  -vf "drawtext=fontfile=${FONT}:text='UMOYO NATURAL HEALTH':fontsize=44:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-130" \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 24 /tmp/umoyo_build/c1.mp4

ffmpeg -y -loop 1 -t 2.8 -i /tmp/umoyo_build/img2.jpg \
  -vf "drawtext=fontfile=${FONT}:text='YOUR WELLNESS DESTINATION':fontsize=40:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-130" \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 24 /tmp/umoyo_build/c2.mp4

ffmpeg -y -loop 1 -t 2.8 -i /tmp/umoyo_build/img3.jpg \
  -vf "drawtext=fontfile=${FONT}:text='NATURAL HEALTH PRODUCTS':fontsize=40:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-130" \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 24 /tmp/umoyo_build/c3.mp4

ffmpeg -y -loop 1 -t 2.8 -i /tmp/umoyo_build/img4.jpg \
  -vf "drawtext=fontfile=${FONT}:text='NUTRITION & HERBS':fontsize=40:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-130" \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 24 /tmp/umoyo_build/c4.mp4

ffmpeg -y -loop 1 -t 2.8 -i /tmp/umoyo_build/img5.jpg \
  -vf "drawtext=fontfile=${FONT}:text='HEALTH SHOPS • MANUFACTURING • WHOLESALE':fontsize=34:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-130" \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 24 /tmp/umoyo_build/c5.mp4

ffmpeg -y -loop 1 -t 3.2 -i /tmp/umoyo_build/img6.jpg \
  -vf "drawtext=fontfile=${FONT}:text='SINCE 2007 • LIVE YOUR BEST LIFE':fontsize=32:fontcolor=#1d1d1f:box=1:boxcolor=white@0.7:boxborderw=8:x=(w-text_w)/2:y=h-70" \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 24 /tmp/umoyo_build/c6.mp4

# Concat
cat << 'EOF' > /tmp/umoyo_build/concat.txt
file '/tmp/umoyo_build/c1.mp4'
file '/tmp/umoyo_build/c2.mp4'
file '/tmp/umoyo_build/c3.mp4'
file '/tmp/umoyo_build/c4.mp4'
file '/tmp/umoyo_build/c5.mp4'
file '/tmp/umoyo_build/c6.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i /tmp/umoyo_build/concat.txt \
  -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -movflags +faststart \
  assets/umoyo-natural-health-showcase.mp4

mkdir -p public/assets dist/assets
cp assets/umoyo-natural-health-showcase.mp4 public/assets/umoyo-natural-health-showcase.mp4
cp assets/umoyo-natural-health-showcase.mp4 dist/assets/umoyo-natural-health-showcase.mp4

echo "Completed Umoyo video generation successfully!"
