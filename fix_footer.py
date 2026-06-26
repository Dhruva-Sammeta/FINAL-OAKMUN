import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

old_str = """      <div class="footer-brand">
        <img src="logo.png" alt="Oakridge MUN Logo" class="footer-logo" />"""

new_str = """      <div class="footer-brand">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="logo.png" alt="Oakridge MUN Logo" class="footer-logo" />
          <span style="font-family: 'Montserrat', sans-serif; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.12em; color: var(--white, #faf5ed); line-height: 1.2; text-transform: uppercase;">Oakridge<br><span style="color: var(--teal, #30CDD7);">MUN</span></span>
        </div>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace(old_str, new_str)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footer updated globally.")
