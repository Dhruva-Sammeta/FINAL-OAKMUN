import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the standalone IP Registration button in .nav-right
    # It looks like: <a href="https://forms.office.com/r/kdyTBHKxE7" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;background:rgba(48,205,215,.14);border:1px solid rgba(48,205,215,.38);border-radius:100px;padding:6px 12px;font-family:Montserrat,sans-serif;font-size:.55rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#30CDD7;text-decoration:none;white-space:nowrap;">IP Registration</a>
    
    content = re.sub(
        r'<a href="https://forms\.office\.com/r/kdyTBHKxE7" target="_blank" rel="noopener" style="display:inline-flex;[^>]+>IP Registration</a>',
        '',
        content
    )

    # 2. Modify mobile menu to make it a dropdown / modal
    # In .mobile-nav we have:
    # <a href="https://forms.office.com/r/kdyTBHKxE7" target="_blank" rel="noopener" style="color:#30CDD7;font-weight:800;">IP Registration</a>
    # <a href="/register.html" class="mobile-nav-cta">Register Now</a>
    
    mobile_reg_original = r'<a href="https://forms\.office\.com/r/kdyTBHKxE7" target="_blank" rel="noopener" style="color:#30CDD7;font-weight:800;">IP Registration</a>\s*<a href="/?register\.html" class="mobile-nav-cta">Register Now</a>'
    
    # We'll replace it with an interactive accordion in the mobile menu
    mobile_reg_new = """
    <div class="mobile-reg-accordion">
      <button class="mobile-nav-cta" onclick="this.parentElement.classList.toggle('open')">Register Now <span style="font-size:0.8em; margin-left:4px;">▼</span></button>
      <div class="mobile-reg-options">
        <a href="/register.html">All Schools / Delegates</a>
        <a href="https://forms.office.com/r/kdyTBHKxE7" target="_blank" rel="noopener">International Press (IP)</a>
        <a href="https://forms.office.com/r/VT2DQvz4XE" target="_blank" rel="noopener">OC Application (Grade 12)</a>
      </div>
    </div>
"""
    
    content = re.sub(mobile_reg_original, mobile_reg_new, content)
    
    # 3. Add CSS for the new accordion if it doesn't exist
    css_addition = """
    .mobile-reg-accordion { display: flex; flex-direction: column; width: 100%; margin-top: 8px; }
    .mobile-reg-accordion .mobile-nav-cta { width: 100%; background: linear-gradient(135deg, #30CDD7 0%, #1E96A5 100%); color: #003057 !important; border: none; border-radius: 12px; padding: 14px 0; font-family: 'Montserrat'; font-size: .88rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: filter .2s; }
    .mobile-reg-accordion .mobile-nav-cta:active { filter: brightness(.9); }
    .mobile-reg-options { display: none; flex-direction: column; gap: 8px; margin-top: 12px; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 12px; }
    .mobile-reg-accordion.open .mobile-reg-options { display: flex; }
    .mobile-reg-options a { padding: 10px !important; font-size: .75rem !important; text-align: center; border: 1px solid rgba(48,205,215,.2) !important; border-radius: 8px; background: rgba(48,205,215,.05); margin: 0 !important; }
    .mobile-reg-options a:hover { background: rgba(48,205,215,.15); }
    """
    
    if ".mobile-reg-accordion {" not in content:
        content = content.replace('</style>', css_addition + '\n  </style>')

    # 4. Remove .mobile-nav a.mobile-nav-cta styles since we moved to button
    content = re.sub(r'\.mobile-nav a\.mobile-nav-cta \{[^}]+\}', '', content)
    content = re.sub(r'\.mobile-nav a\.mobile-nav-cta:hover \{[^}]+\}', '', content)

    # 5. Make the chevron bolder in the desktop nav if needed
    content = content.replace('<span class="nav-cta-chevron">▾</span>', '<span class="nav-cta-chevron">▼</span>')

    # 6. Navbar scaling fix: make sure nav-right and nav-pill don't blow out
    # If the user complains about scaling, it's often due to nav-right taking too much space. 
    # With IP reg gone, it shrinks. We can also add `flex-shrink: 1;` to .nav-links-group.
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done replacing.")
