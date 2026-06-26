import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The string to search for
    old_strip = """<div id="trainingStrip">
    <span class="strip-pulse"></span>
    Delegate Training Session &nbsp;·&nbsp; 10th July
    <span class="strip-pulse"></span>
    <button id="stripClose">✕</button>
  </div>"""

    new_strip = """<div id="trainingStrip" style="cursor: pointer;" onclick="document.getElementById('trainingPopup').classList.add('open')">
    <span class="strip-pulse"></span>
    Delegate Training Session &nbsp;·&nbsp; 10th July
    <span class="strip-pulse"></span>
    <button id="stripClose" onclick="event.stopPropagation();">✕</button>
  </div>"""

    # If already modified on index.html, it won't match, which is fine
    content = content.replace(old_strip, new_strip)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Banner fix applied.")
