import os
import pandas as pd

PUBLIC_CROPS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "public", "crops")
os.makedirs(PUBLIC_CROPS_DIR, exist_ok=True)

# Load crops master
crops_csv = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw", "karnataka_crops_master.csv")
df = pd.read_csv(crops_csv)

COLOR_MAP = {
    "Cereals": ("#D97706", "#78350F", "🌾"),
    "Millets": ("#B45309", "#451A03", "🌾"),
    "Pulses": ("#059669", "#064E3B", "🌱"),
    "Oilseeds": ("#EAB308", "#713F12", "🌻"),
    "Commercial": ("#2563EB", "#1E3A8A", "🌿"),
    "Vegetables": ("#16A34A", "#14532D", "🥦"),
    "Fruits": ("#EA580C", "#7C2D12", "🍎"),
    "Plantation": ("#0D9488", "#134E4A", "🌴"),
    "Spices": ("#DC2626", "#7F1D1D", "🌶️")
}

for _, row in df.iterrows():
    c_name = row["crop_name"]
    k_name = row["kannada_name"].split(" ")[0]
    cat = row["category"]
    slug = c_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
    
    accent, bg, emoji = COLOR_MAP.get(cat, ("#16A34A", "#14532D", "🌱"))
    
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
  <defs>
    <linearGradient id="grad_{slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg}" />
      <stop offset="100%" stop-color="{accent}" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="400" height="260" rx="16" fill="url(#grad_{slug})" />
  <circle cx="200" cy="95" r="54" fill="#ffffff" fill-opacity="0.12" />
  <circle cx="200" cy="95" r="42" fill="#ffffff" fill-opacity="0.2" filter="url(#shadow)" />
  <text x="200" y="108" font-size="38" text-anchor="middle" dominant-baseline="middle">{emoji}</text>
  <text x="200" y="175" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" fill="#ffffff" text-anchor="middle">{c_name}</text>
  <text x="200" y="202" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="16" fill="#FDE047" text-anchor="middle">{k_name}</text>
  <rect x="140" y="222" width="120" height="22" rx="11" fill="#000000" fill-opacity="0.25" />
  <text x="200" y="237" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#E2E8F0" text-anchor="middle">{cat.upper()}</text>
</svg>"""

    # We save both .svg and .jpg naming reference so browsers load instantly
    svg_path = os.path.join(PUBLIC_CROPS_DIR, f"{slug}.jpg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

print(f"Generated {len(df)} artwork cards in {PUBLIC_CROPS_DIR}")
