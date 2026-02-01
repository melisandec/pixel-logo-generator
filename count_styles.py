import re
with open('lib/demoSvgRenderer.ts', 'r') as f:
    content = f.read()
font_start = content.find('export const DEMO_FONT_STYLES')
font_end = content.find('};', font_start) + 2
font_section = content[font_start:font_end]
font_matches = re.findall(r'^\s+(\w+):\s*{', font_section, re.MULTILINE)
print(f"Fonts: {len(font_matches)}")
effect_start = content.find('export const DEMO_EFFECT_STYLES')
effect_end = content.find('};', effect_start) + 2
effect_section = content[effect_start:effect_end]
effect_matches = re.findall(r'^\s+(\w+):\s*{', effect_section, re.MULTILINE)
print(f"Effects: {len(effect_matches)}")
print(f"Total: {len(font_matches) * len(effect_matches)}")
