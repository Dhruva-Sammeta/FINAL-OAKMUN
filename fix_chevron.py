import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The string to search for
    old_css = r"\.nav-cta-chevron \{ display: inline-block; margin-left: 4px; font-size: \.65em; vertical-align: middle; transition: transform \.2s; \}\s*\.nav-reg-wrap:hover \.nav-cta-chevron \{ transform: rotate\(180deg\); \}"

    new_css = """.nav-cta-chevron { display: inline-block; margin-left: 4px; font-size: .65em; vertical-align: middle; transition: transform .3s .55s cubic-bezier(0.4,0,0.2,1); }
    .nav-reg-wrap:hover .nav-cta-chevron { transform: rotate(180deg); transition-delay: 0s; transition-duration: .3s; }"""

    content = re.sub(old_css, new_css, content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Chevron fix applied.")
