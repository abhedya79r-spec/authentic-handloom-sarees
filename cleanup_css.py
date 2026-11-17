import re

with open("/Users/rishiraj/Desktop/CSE326 project1/style.css", "r") as f:
    css = f.read()

# ============================================================
# 1. Remove DUPLICATE #hero blocks — keep ONLY the last full one (line ~3815)
# ============================================================

# Remove hero block at ~line 1149 (original)
css = css.replace("""/* ==============================================
   HERO SECTION — CINEMATIC VIDEO BACKGROUND
   ============================================== */
#hero {
  position: relative;
  height: 100vh;
  min-height: 650px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}""", """/* HERO SECTION — see consolidated block below */""")

# Remove hero block at ~line 3360
css = css.replace("""/* ── 8. Hero section — ensure video fills properly ── */
#hero {
  position: relative;
  overflow: hidden;
}""", """/* Hero — consolidated below */""")

# Remove hero block at ~line 3438
css = css.replace("""#hero {
  padding: 0; /* hero has its own full-screen sizing */
}""", "/* #hero padding: 0 — merged below */")

# Remove hero block at ~line 3467
css = css.replace("""/* ─── HERO — ensure full-height, no gaps ─── */
#hero {
  position: relative;
  height: 100vh;
  min-height: 580px;
  max-height: 1080px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}""", """/* HERO — consolidated into single block below */""")

# Keep the FINAL one at ~line 3815 and make it complete
css = css.replace("""/* ─── 1. HERO MOSAIC BACKGROUND ─────────────────────────────── */
#hero {
  position: relative;
  height: 100vh;
  min-height: 580px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #1a0f08; /* deep warm dark fallback */
}""", """/* ─── HERO — SINGLE CONSOLIDATED DEFINITION ─────────────────── */
#hero {
  position: relative;
  height: 100vh;
  min-height: 580px;
  max-height: 1080px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #1a0f08;
}""")

# ============================================================
# 2. Remove duplicate .hero-video-wrapper
# ============================================================
# First one at ~line 1160
css = css.replace("""/* Video fills the entire hero */
.hero-video-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}""", "/* hero-video-wrapper — consolidated below */")

# Second at ~3477
css = css.replace(""".hero-video-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}
#hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-overlay,
.hero-overlay-bottom {
  position: absolute;
  inset: 0;
  z-index: 1;
}""", "/* hero-video-wrapper / overlay — consolidated below */")

# ============================================================
# 3. Remove duplicate .footer-main (keep the later one)
# ============================================================
css = css.replace(""".footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}""", "/* .footer-main — consolidated below */")

# ============================================================
# 4. Remove duplicate .footer-bottom (there are multiples)
# ============================================================
# First one
css = css.replace(""".footer-bottom {
  padding: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
}""", "/* .footer-bottom — consolidated below */")

# Remove the duplicate .footer-bottom in the cleanup section
css = css.replace(""".footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 2rem;
  padding-top: 1.5rem;
}""", "/* .footer-bottom border — consolidated */")

# ============================================================
# 5. Remove duplicate .hero-overlay blocks
# ============================================================
css = css.replace(""".hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}""", "/* hero-overlay — see #hero-bg-mosaic section */", 1)

# ============================================================
# 6. Remove old hero-content block that was emptied
# ============================================================
css = css.replace("/* Hero Content — CONSOLIDATED (see below) */", "")
css = css.replace("/* Eyebrow — CONSOLIDATED (see premium additions) */", "")
css = css.replace("/* Badge — CONSOLIDATED (see premium section) */", "")

# ============================================================
# 7. Remove excessive blank lines and comments
# ============================================================
css = re.sub(r'\n{4,}', '\n\n', css)
css = re.sub(r'/\* hero-video-wrapper — consolidated below \*/\s*\n', '', css)
css = re.sub(r'/\* hero-video-wrapper / overlay — consolidated below \*/\s*\n', '', css)
css = re.sub(r'/\* Hero — consolidated below \*/\s*\n', '', css)
css = re.sub(r'/\* #hero padding: 0 — merged below \*/\s*\n', '', css)
css = re.sub(r'/\* HERO — consolidated into single block below \*/\s*\n', '', css)
css = re.sub(r'/\* HERO SECTION — see consolidated block below \*/\s*\n', '', css)
css = re.sub(r'/\* \.footer-main — consolidated below \*/\s*\n', '', css)
css = re.sub(r'/\* \.footer-bottom — consolidated below \*/\s*\n', '', css)
css = re.sub(r'/\* \.footer-bottom border — consolidated \*/\s*\n', '', css)
css = re.sub(r'/\* hero-overlay — see #hero-bg-mosaic section \*/\s*\n', '', css)
css = re.sub(r'/\* hero-eyebrow — see PREMIUM ADDITIONS section below \*/\s*\n', '', css)

# Clean up multiple blank lines again
css = re.sub(r'\n{3,}', '\n\n', css)

with open("/Users/rishiraj/Desktop/CSE326 project1/style.css", "w") as f:
    f.write(css)

# Verify
opens = css.count('{')
closes = css.count('}')
hero_count = len(re.findall(r'^#hero\s*\{', css, re.MULTILINE))
print(f"✅ CSS cleaned up!")
print(f"   Braces: {{ = {opens}, }} = {closes} {'✅' if opens == closes else '❌ MISMATCH'}")
print(f"   #hero blocks remaining: {hero_count}")
print(f"   Total lines: {css.count(chr(10))+1}")
print(f"   File size: {len(css)} bytes")
