#!/usr/bin/env python3
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

template = f'''import os

with open("index.html", "w", encoding="utf-8") as f:
    f.write({repr(html)})

print("index.html updated successfully!")
'''

with open("scripts/generate_apple_site.py", "w", encoding="utf-8") as f:
    f.write(template)

print("Synchronized scripts/generate_apple_site.py successfully!")
