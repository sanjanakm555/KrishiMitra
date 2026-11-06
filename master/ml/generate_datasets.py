"""
KrishiMitra - Master Data Ingestion & Dataset Generation Pipeline
State: Karnataka, India ONLY
Generates raw datasets adhering to AGMARKNET and Karnataka Department of Agriculture standards.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATA_RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")
os.makedirs(DATA_RAW_DIR, exist_ok=True)

# 1. 52 Karnataka-specific Crops / Commodity Varieties Master Definition
KARNATAKA_CROPS = [
    # Cereals & Millets
    {"crop_id": 1, "crop_name": "Paddy", "commodity_name": "Paddy (Dhan)", "variety_name": "Sona Masuri", "category": "Cereals", "season": "Kharif", "soil_type": "Clayey / Alluvial", "water_requirement": "High", "major_districts": "Mandya, Raichur, Shivamogga, Ballari, Koppal", "kannada_name": "ಭತ್ತ (Paddy)", "base_price": 2350, "volatility": 0.08, "description": "Primary staple food crop of Karnataka, extensively cultivated in irrigated river basins."},
    {"crop_id": 2, "crop_name": "Ragi", "commodity_name": "Finger Millet", "variety_name": "GPU-28 / MR-1", "category": "Millets", "season": "Kharif", "soil_type": "Red Sandy Loam", "water_requirement": "Low", "major_districts": "Tumakuru, Hassan, Mandya, Bengaluru Rural, Ramanagara", "kannada_name": "ರಾಗಿ (Ragi)", "base_price": 3650, "volatility": 0.06, "description": "Nutrient-rich staple millet of Southern Karnataka, drought-hardy and high calcium content."},
    {"crop_id": 3, "crop_name": "Maize", "commodity_name": "Maize (Corn)", "variety_name": "Hybrid Yellow", "category": "Cereals", "season": "Kharif/Rabi", "soil_type": "Red Loam / Black Soil", "water_requirement": "Medium", "major_districts": "Davanagere, Haveri, Belagavi, Chikkamagaluru", "kannada_name": "ಮೆಕ್ಕೆಜೋಳ (Maize)", "base_price": 2220, "volatility": 0.07, "description": "Major feed and industrial crop, Davanagere is Karnataka's premier maize belt."},
    {"crop_id": 4, "crop_name": "Jowar", "commodity_name": "Sorghum", "variety_name": "Maldandi / White", "category": "Millets", "season": "Rabi", "soil_type": "Deep Black Soil", "water_requirement": "Low", "major_districts": "Vijayapura, Kalaburagi, Bagalkote, Dharwad", "kannada_name": "ಜೋಳ (Jowar)", "base_price": 3400, "volatility": 0.08, "description": "Dietary backbone of North Karnataka (Jolada Rotti), drought-resistant dryland crop."},
    {"crop_id": 5, "crop_name": "Bajra", "commodity_name": "Pearl Millet", "variety_name": "ICTP-8203", "category": "Millets", "season": "Kharif", "soil_type": "Sandy Loam / Light Soil", "water_requirement": "Low", "major_districts": "Koppal, Raichur, Bagalkote, Gadag", "kannada_name": "ಸಜ್ಜೆ (Bajra)", "base_price": 2450, "volatility": 0.09, "description": "Heat-tolerant millet grown in arid plains of Northern Karnataka."},
    {"crop_id": 6, "crop_name": "Wheat", "commodity_name": "Wheat", "variety_name": "Sharbati / Durum", "category": "Cereals", "season": "Rabi", "soil_type": "Clay Loam / Black Soil", "water_requirement": "Medium", "major_districts": "Dharwad, Belagavi, Vijayapura, Bagalkote", "kannada_name": "ಗೋಧಿ (Wheat)", "base_price": 2550, "volatility": 0.06, "description": "Rabi cereal in irrigated deep black soils of northern districts."},

    # Pulses
    {"crop_id": 7, "crop_name": "Tur (Red Gram)", "commodity_name": "Pigeon Pea", "variety_name": "Maruti / TS-3R", "category": "Pulses", "season": "Kharif", "soil_type": "Deep Black Soil", "water_requirement": "Medium", "major_districts": "Kalaburagi, Yadgir, Bidar, Raichur", "kannada_name": "ತೊಗರಿ (Tur Dal)", "base_price": 9200, "volatility": 0.12, "description": "Kalaburagi is known as the 'Tur Bowl of Karnataka' with GI tagged Gulbarga Tur."},
    {"crop_id": 8, "crop_name": "Green Gram", "commodity_name": "Moong", "variety_name": "Shiney Moong", "category": "Pulses", "season": "Kharif", "soil_type": "Loamy / Black Soil", "water_requirement": "Low", "major_districts": "Gadag, Dharwad, Bagalkote, Bidar", "kannada_name": "ಹೆಸರುಕಾಳು (Green Gram)", "base_price": 8400, "volatility": 0.10, "description": "Short-duration pulse crop ideal for soil nitrogen fixation and rotation."},
    {"crop_id": 9, "crop_name": "Black Gram", "commodity_name": "Urad", "variety_name": "LBG-791", "category": "Pulses", "season": "Kharif/Rabi", "soil_type": "Loam / Clay Loam", "water_requirement": "Low", "major_districts": "Bidar, Kalaburagi, Mysuru, Chamarajanagar", "kannada_name": "ಉದ್ದಿನಕಾಳು (Black Gram)", "base_price": 8100, "volatility": 0.11, "description": "High-protein pulse cultivated as sole crop or intercrop across transitional zones."},
    {"crop_id": 10, "crop_name": "Bengal Gram", "commodity_name": "Chickpea (Chana)", "variety_name": "JG-11 / Annigeri-1", "category": "Pulses", "season": "Rabi", "soil_type": "Deep Black Soil", "water_requirement": "Low", "major_districts": "Dharwad, Gadag, Vijayapura, Ballari", "kannada_name": "ಕಡಲೆಕಾಳು (Bengal Gram)", "base_price": 5750, "volatility": 0.08, "description": "Pre-eminent rabi pulse of North Karnataka dry tracts."},

    # Oilseeds
    {"crop_id": 11, "crop_name": "Groundnut", "commodity_name": "Peanut", "variety_name": "TMV-2 / Kadiri-6", "category": "Oilseeds", "season": "Kharif/Summer", "soil_type": "Sandy Loam / Red Soil", "water_requirement": "Medium", "major_districts": "Tumakuru, Chitradurga, Chikkaballapura, Ballari", "kannada_name": "ಕಡಲೆಕಾಯಿ (Groundnut)", "base_price": 6400, "volatility": 0.09, "description": "Principal oilseed crop grown in rainfed central and eastern dry zones."},
    {"crop_id": 12, "crop_name": "Soybean", "commodity_name": "Soyabean", "variety_name": "JS-335", "category": "Oilseeds", "season": "Kharif", "soil_type": "Well-drained Black Soil", "water_requirement": "Medium", "major_districts": "Belagavi, Bidar, Dharwad, Haveri", "kannada_name": "ಸೋಯಾಬೀನ್ (Soybean)", "base_price": 4650, "volatility": 0.10, "description": "Commercial oilseed with heavy production in Belagavi and Bidar borders."},
    {"crop_id": 13, "crop_name": "Sunflower", "commodity_name": "Sunflower", "variety_name": "KBSH-44", "category": "Oilseeds", "season": "Kharif/Rabi", "soil_type": "Black Soil / Sandy Clay", "water_requirement": "Medium", "major_districts": "Koppal, Raichur, Ballari, Bagalkote", "kannada_name": "ಸೂರ್ಯಕಾಂತಿ (Sunflower)", "base_price": 4900, "volatility": 0.11, "description": "Karnataka is India's leading producer of sunflower oilseed."},
    {"crop_id": 14, "crop_name": "Sesame", "commodity_name": "Til (Gingelly)", "variety_name": "DS-1 / White", "category": "Oilseeds", "season": "Summer", "soil_type": "Light Sandy Loam", "water_requirement": "Low", "major_districts": "Mandya, Mysuru, Hassan, Haveri", "kannada_name": "ಎಳ್ಳು (Sesame)", "base_price": 12800, "volatility": 0.12, "description": "High value oilseed cultivated in residual moisture conditions."},

    # Commercial & Fibre
    {"crop_id": 15, "crop_name": "Cotton", "commodity_name": "Cotton (Kapas)", "variety_name": "Bt Cotton / DCH-32", "category": "Commercial", "season": "Kharif", "soil_type": "Deep Black Cotton Soil", "water_requirement": "Medium", "major_districts": "Haveri, Dharwad, Ballari, Belagavi, Raichur", "kannada_name": "ಹತ್ತಿ (Cotton)", "base_price": 7250, "volatility": 0.10, "description": "Prime cash crop supporting Karnataka textile and ginning mills."},
    {"crop_id": 16, "crop_name": "Sugarcane", "commodity_name": "Sugarcane", "variety_name": "Co-86032", "category": "Commercial", "season": "Whole Year", "soil_type": "Rich Loamy / Black Alluvial", "water_requirement": "Very High", "major_districts": "Belagavi, Mandya, Bagalkote, Vijayapura", "kannada_name": "ಕಬ್ಬು (Sugarcane)", "base_price": 3150, "volatility": 0.05, "description": "Belagavi and Mandya sugar belts lead Karnataka's sugar agro-industry."},

    # Vegetables
    {"crop_id": 17, "crop_name": "Tomato", "commodity_name": "Tomato", "variety_name": "Hybrid Local / Arka Rakshak", "category": "Vegetables", "season": "Whole Year", "soil_type": "Well-drained Red Loam", "water_requirement": "Medium", "major_districts": "Kolar, Chikkaballapura, Bengaluru Rural, Belagavi", "kannada_name": "ಟೊಮೆಟೊ (Tomato)", "base_price": 2400, "volatility": 0.35, "description": "Kolar APMC operates Asia's second largest tomato trading mandi."},
    {"crop_id": 18, "crop_name": "Onion", "commodity_name": "Onion", "variety_name": "Nasik Red / Bellary Red", "category": "Vegetables", "season": "Kharif/Rabi", "soil_type": "Deep Friable Alluvial / Red Soil", "water_requirement": "Medium", "major_districts": "Chitradurga, Gadag, Bagalkote, Dharwad, Ballari", "kannada_name": "ಈರುಳ್ಳಿ (Onion)", "base_price": 2100, "volatility": 0.38, "description": "Chitradurga and Hubballi markets are central to South India's onion supply."},
    {"crop_id": 19, "crop_name": "Potato", "commodity_name": "Potato", "variety_name": "Kufri Jyoti / Pukhraj", "category": "Vegetables", "season": "Kharif", "soil_type": "Sandy Loam rich in humus", "water_requirement": "Medium", "major_districts": "Hassan, Chikkamagaluru, Kolar, Belagavi", "kannada_name": "ಆಲೂಗಡ್ಡೆ (Potato)", "base_price": 1850, "volatility": 0.22, "description": "Hassan is Karnataka's premier potato producing highland district."},
    {"crop_id": 20, "crop_name": "Chilli", "commodity_name": "Green Chilli", "variety_name": "G4 / Byadagi Green", "category": "Vegetables", "season": "Kharif/Rabi", "soil_type": "Black Loam / Well-drained Red Soil", "water_requirement": "Medium", "major_districts": "Haveri, Belagavi, Dharwad, Ballari", "kannada_name": "ಹಸಿಮೆಣಸಿನಕಾಯಿ (Green Chilli)", "base_price": 3800, "volatility": 0.28, "description": "Essential fresh spice vegetable with high turnover across state APMCs."},
    {"crop_id": 21, "crop_name": "Capsicum", "commodity_name": "Capsicum", "variety_name": "Indra / Green", "category": "Vegetables", "season": "Whole Year", "soil_type": "Porous Red Sandy Loam", "water_requirement": "Medium", "major_districts": "Bengaluru Rural, Belagavi, Kolar, Mysuru", "kannada_name": "ದಪ್ಪಮೆಣಸಿನಕಾಯಿ (Capsicum)", "base_price": 4200, "volatility": 0.25, "description": "High-value polyhouse and open-field vegetable crop around peri-urban hubs."},
    {"crop_id": 22, "crop_name": "Brinjal", "commodity_name": "Brinjal (Eggplant)", "variety_name": "Mattu Gulla / Round Green", "category": "Vegetables", "season": "Whole Year", "soil_type": "Silt Loam / Red Clay", "water_requirement": "Medium", "major_districts": "Udupi, Belagavi, Mysuru, Dharwad", "kannada_name": "ಬದನೆಕಾಯಿ (Brinjal)", "base_price": 2200, "volatility": 0.20, "description": "Includes celebrated GI crop Udupi Mattu Gulla and widely grown regional varieties."},
    {"crop_id": 23, "crop_name": "Cabbage", "commodity_name": "Cabbage", "variety_name": "Golden Acre", "category": "Vegetables", "season": "Rabi/Winter", "soil_type": "Sandy Loam / Clay Loam", "water_requirement": "Medium", "major_districts": "Belagavi, Hassan, Kolar, Bengaluru Rural", "kannada_name": "ಎಲೆಕೋಸು (Cabbage)", "base_price": 1400, "volatility": 0.24, "description": "Cool-season brassica vegetable grown in Malnad and southern transition zones."},
    {"crop_id": 24, "crop_name": "Cauliflower", "commodity_name": "Cauliflower", "variety_name": "Snowball-16", "category": "Vegetables", "season": "Rabi/Winter", "soil_type": "Deep Rich Loamy Soil", "water_requirement": "Medium", "major_districts": "Belagavi, Kolar, Chikkaballapura, Hassan", "kannada_name": "ಹೂಕೋಸು (Cauliflower)", "base_price": 1900, "volatility": 0.26, "description": "High consumer demand winter vegetable in urban and sub-urban markets."},
    {"crop_id": 25, "crop_name": "Carrot", "commodity_name": "Carrot", "variety_name": "Pusa Rudhira / Kuroda", "category": "Vegetables", "season": "Rabi", "soil_type": "Deep Loose Sandy Loam", "water_requirement": "Medium", "major_districts": "Belagavi, Chikkaballapura, Kolar, Hassan", "kannada_name": "ಕ್ಯಾರೆಟ್ (Carrot)", "base_price": 2800, "volatility": 0.20, "description": "Root crop flourishing in fertile, deep friable soils."},
    {"crop_id": 26, "crop_name": "Beans", "commodity_name": "French Beans", "variety_name": "Arka Suvidha / Ring Beans", "category": "Vegetables", "season": "Whole Year", "soil_type": "Well-drained Red Loam", "water_requirement": "Medium", "major_districts": "Chikkamagaluru, Hassan, Kolar, Bengaluru Rural", "kannada_name": "ಹುರುಳಿಕಾಯಿ (Beans)", "base_price": 4500, "volatility": 0.30, "description": "High-return legume vegetable grown across hill and transition zones."},
    {"crop_id": 27, "crop_name": "Drumstick", "commodity_name": "Moringa", "variety_name": "PKM-1 / ODC-3", "category": "Vegetables", "season": "Perennial", "soil_type": "Sandy Loam / Dry Soil", "water_requirement": "Low", "major_districts": "Chitradurga, Tumakuru, Bagalkote, Koppal", "kannada_name": "ನುಗ್ಗೆಕಾಯಿ (Drumstick)", "base_price": 4100, "volatility": 0.32, "description": "Drought-resistant perennial vegetable yielding round-the-year harvest."},
    {"crop_id": 28, "crop_name": "Okra", "commodity_name": "Bhindi (Lady Finger)", "variety_name": "Arka Anamika", "category": "Vegetables", "season": "Kharif/Summer", "soil_type": "Clayey to Sandy Loam", "water_requirement": "Medium", "major_districts": "Belagavi, Mysuru, Mandya, Davanagere", "kannada_name": "ಬೆಂಡೆಕಾಯಿ (Okra)", "base_price": 2600, "volatility": 0.22, "description": "Popular warm season vegetable cultivated continuously across irrigation tracts."},
    {"crop_id": 29, "crop_name": "Cucumber", "commodity_name": "Cucumber", "variety_name": "Poinsette / Local Green", "category": "Vegetables", "season": "Summer/Kharif", "soil_type": "Sandy Loam", "water_requirement": "Medium", "major_districts": "Dharwad, Belagavi, Hassan, Mysuru", "kannada_name": "ಸೌತೆಕಾಯಿ (Cucumber)", "base_price": 1600, "volatility": 0.25, "description": "Fast-maturing cucurbit with heavy demand during warm months."},
    {"crop_id": 30, "crop_name": "Pumpkin", "commodity_name": "Pumpkin", "variety_name": "Arka Chandan / Yellow", "category": "Vegetables", "season": "Whole Year", "soil_type": "Well-drained Loam", "water_requirement": "Medium", "major_districts": "Tumakuru, Chitradurga, Mandya, Mysuru", "kannada_name": "ಕುಂಬಳಕಾಯಿ (Pumpkin)", "base_price": 1200, "volatility": 0.15, "description": "Sturdy vine crop with long storage life and reliable yield."},
    {"crop_id": 31, "crop_name": "Bitter Gourd", "commodity_name": "Karela", "variety_name": "Pusa Do Mausami", "category": "Vegetables", "season": "Kharif/Summer", "soil_type": "Sandy Loam rich in organic matter", "water_requirement": "Medium", "major_districts": "Belagavi, Mysuru, Hassan, Ballari", "kannada_name": "ಹಾಗಲಕಾಯಿ (Bitter Gourd)", "base_price": 3100, "volatility": 0.22, "description": "Medicinal and culinary vegetable with strong demand in state markets."},
    {"crop_id": 32, "crop_name": "Bottle Gourd", "commodity_name": "Lauki", "variety_name": "Pusa Summer Prolific", "category": "Vegetables", "season": "Whole Year", "soil_type": "Loam / Sandy Soil", "water_requirement": "Medium", "major_districts": "Mandya, Ramanagara, Tumakuru, Haveri", "kannada_name": "ಸೋರೆಕಾಯಿ (Bottle Gourd)", "base_price": 1350, "volatility": 0.18, "description": "Prolific vine crop popular in southern dry tracts."},

    # Plantation & High-Value Horticultural
    {"crop_id": 33, "crop_name": "Coconut", "commodity_name": "Coconut", "variety_name": "Tiptur Tall / DXT", "category": "Plantation", "season": "Perennial", "soil_type": "Coastal Alluvium / Red Sandy Loam", "water_requirement": "High", "major_districts": "Tumakuru, Hassan, Mandya, Udupi, Dakshina Kannada", "kannada_name": "ತೆಂಗಿನಕಾಯಿ (Coconut)", "base_price": 3200, "volatility": 0.08, "description": "Tiptur is Karnataka's copra and coconut capital with famous dry copra trade."},
    {"crop_id": 34, "crop_name": "Arecanut", "commodity_name": "Betel Nut (Supari)", "variety_name": "Chali / Rashi / Bette", "category": "Plantation", "season": "Perennial", "soil_type": "Laterite / Clay Loam", "water_requirement": "High", "major_districts": "Shivamogga, Chikkamagaluru, Dakshina Kannada, Uttara Kannada, Davanagere", "kannada_name": "ಅಡಿಕೆ (Arecanut)", "base_price": 48500, "volatility": 0.09, "description": "High-value commercial cash plantation crop; Shivamogga & Sagar are primary mandis."},
    {"crop_id": 35, "crop_name": "Banana", "commodity_name": "Banana", "variety_name": "Robusta / Nanjangud Rasabale / Yelakki", "category": "Fruits", "season": "Perennial", "soil_type": "Well-drained Fertile Alluvial / Loam", "water_requirement": "High", "major_districts": "Mysuru, Mandya, Chamarajanagar, Ramanagara", "kannada_name": "ಬಾಳೆಹಣ್ಣು (Banana)", "base_price": 2800, "volatility": 0.15, "description": "Includes Karnataka's GI-tagged pride Nanjangud Rasabale and commercial Yelakki."},
    {"crop_id": 36, "crop_name": "Mango", "commodity_name": "Mango", "variety_name": "Alphonso / Badami / Raspuri", "category": "Fruits", "season": "Summer", "soil_type": "Well-drained Red Loam / Laterite", "water_requirement": "Medium", "major_districts": "Kolar, Ramanagara, Chikkaballapura, Dharwad", "kannada_name": "ಮಾವಿನಹಣ್ಣು (Mango)", "base_price": 6500, "volatility": 0.28, "description": "Karnataka is renowned for Dharwad Alphonso and Srinivaspur mango production."},
    {"crop_id": 37, "crop_name": "Papaya", "commodity_name": "Papaya", "variety_name": "Red Lady 786", "category": "Fruits", "season": "Whole Year", "soil_type": "Well-drained Sandy Loam", "water_requirement": "Medium", "major_districts": "Ballari, Chitradurga, Koppal, Bagalkote", "kannada_name": "ಪಪ್ಪಾಯಿ (Papaya)", "base_price": 1900, "volatility": 0.20, "description": "Rapid turnaround fruit crop under drip irrigation in central dry zones."},
    {"crop_id": 38, "crop_name": "Pomegranate", "commodity_name": "Pomegranate", "variety_name": "Bhagwa / Kesar", "category": "Fruits", "season": "Whole Year", "soil_type": "Well-drained Light Black / Loamy", "water_requirement": "Low", "major_districts": "Bagalkote, Vijayapura, Koppal, Ballari", "kannada_name": "ದಾಳಿಂಬೆ (Pomegranate)", "base_price": 11500, "volatility": 0.18, "description": "High-value export fruit with concentrated orchards in northern dry zone."},
    {"crop_id": 39, "crop_name": "Grapes", "commodity_name": "Grapes", "variety_name": "Bangalore Blue / Thompson Seedless", "category": "Fruits", "season": "Rabi/Summer", "soil_type": "Red Sandy Loam / Light Loam", "water_requirement": "Medium", "major_districts": "Bengaluru Urban, Vijayapura, Bagalkote, Chikkaballapura", "kannada_name": "ದ್ರಾಕ್ಷಿ (Grapes)", "base_price": 5400, "volatility": 0.22, "description": "Includes GI-tagged Bangalore Blue and northern table & wine grapes."},
    {"crop_id": 40, "crop_name": "Guava", "commodity_name": "Guava", "variety_name": "Allahabad Safeda / Taiwan Pink", "category": "Fruits", "season": "Whole Year", "soil_type": "Deep Rich Loamy Soil", "water_requirement": "Medium", "major_districts": "Dharwad, Belagavi, Ramanagara, Mysuru", "kannada_name": "ಸೀಬೆಹಣ್ಣು (Guava)", "base_price": 3200, "volatility": 0.16, "description": "Hardy fruit tree yielding bumper crops twice a year across transition belts."},
    {"crop_id": 41, "crop_name": "Orange", "commodity_name": "Mandarin Orange", "variety_name": "Coorg Mandarin", "category": "Fruits", "season": "Winter", "soil_type": "Humus-rich Laterite Soil", "water_requirement": "High", "major_districts": "Kodagu, Hassan, Chikkamagaluru", "kannada_name": "ಕಿತ್ತಳೆ (Orange)", "base_price": 4800, "volatility": 0.20, "description": "GI-tagged Coorg Mandarin grown in shaded coffee plantation ecosystems."},
    {"crop_id": 42, "crop_name": "Lemon", "commodity_name": "Acid Lime / Lemon", "variety_name": "Kagzi Lime", "category": "Fruits", "season": "Whole Year", "soil_type": "Deep Well-drained Loam", "water_requirement": "Low", "major_districts": "Vijayapura, Bagalkote, Kalaburagi, Raichur", "kannada_name": "ನಿಂಬೆಹಣ್ಣು (Lemon)", "base_price": 4200, "volatility": 0.25, "description": "Vijayapura is Karnataka's lemon bowl with dedicated lime processing markets."},

    # Spices & Condiments
    {"crop_id": 43, "crop_name": "Turmeric", "commodity_name": "Turmeric", "variety_name": "Salem / Pragati", "category": "Spices", "season": "Whole Year", "soil_type": "Friable Rich Red Loam", "water_requirement": "High", "major_districts": "Chamarajanagar, Mysuru, Belagavi, Bagalkote", "kannada_name": "ಅರಿಶಿನ (Turmeric)", "base_price": 14200, "volatility": 0.15, "description": "High-curcumin spice crop thriving in southern canal irrigated tracts."},
    {"crop_id": 44, "crop_name": "Ginger", "commodity_name": "Ginger", "variety_name": "Maran / Rio-de-Janeiro", "category": "Spices", "season": "Whole Year", "soil_type": "Laterite / Red Sandy Loam", "water_requirement": "High", "major_districts": "Shivamogga, Hassan, Chikkamagaluru, Kodagu", "kannada_name": "ಶುಂಠಿ (Ginger)", "base_price": 7800, "volatility": 0.26, "description": "Major cash rhizome crop cultivated intensively in Malnad region."},
    {"crop_id": 45, "crop_name": "Coriander", "commodity_name": "Coriander Seed", "variety_name": "Sadhana / Local", "category": "Spices", "season": "Rabi", "soil_type": "Black Soil / Well-drained Loam", "water_requirement": "Low", "major_districts": "Ballari, Dharwad, Gadag, Koppal", "kannada_name": "ಕೊತ್ತಂಬರಿ ಬೀಜ (Coriander)", "base_price": 7600, "volatility": 0.12, "description": "Rabi seed spice cultivated extensively in dry black soil tracts."},
    {"crop_id": 46, "crop_name": "Garlic", "commodity_name": "Garlic", "variety_name": "G-41 / Local White", "category": "Spices", "season": "Rabi", "soil_type": "Rich Loamy / Well-drained Soil", "water_requirement": "Medium", "major_districts": "Belagavi, Dharwad, Gadag, Haveri", "kannada_name": "ಬೆಳ್ಳುಳ್ಳಿ (Garlic)", "base_price": 13500, "volatility": 0.30, "description": "Essential spice bulb with substantial price seasonalities in state mandis."},
    {"crop_id": 47, "crop_name": "Tamarind", "commodity_name": "Tamarind", "variety_name": "PKM-1 / Brown Pulp", "category": "Spices", "season": "Perennial", "soil_type": "Deep Alluvial / Red Gravelly", "water_requirement": "Low", "major_districts": "Kolar, Tumakuru, Chitradurga, Mandya", "kannada_name": "ಹುಣಸೆಹಣ್ಣು (Tamarind)", "base_price": 10500, "volatility": 0.12, "description": "Drought-tolerant perennial tree crop; Kolar APMC is major tamarind auction center."},
    {"crop_id": 48, "crop_name": "Coffee", "commodity_name": "Coffee (Arabica / Robusta)", "variety_name": "Arabica Plantation A / Robusta Cherry", "category": "Plantation", "season": "Perennial", "soil_type": "Deep Rich Forest Loam / Laterite", "water_requirement": "High", "major_districts": "Kodagu, Chikkamagaluru, Hassan", "kannada_name": "ಕಾಫಿ (Coffee)", "base_price": 31000, "volatility": 0.08, "description": "Karnataka produces over 70% of India's coffee in the Western Ghats canopy."},
    {"crop_id": 49, "crop_name": "Cardamom", "commodity_name": "Small Cardamom", "variety_name": "Malabar / Mysore Variety", "category": "Spices", "season": "Perennial", "soil_type": "Humus-rich Loamy Forest Soil", "water_requirement": "High", "major_districts": "Kodagu, Hassan, Chikkamagaluru, Uttara Kannada", "kannada_name": "ಏಲಕ್ಕಿ (Cardamom)", "base_price": 185000, "volatility": 0.14, "description": "'Queen of Spices' grown as understorey in evergreen rainforest estates."},
    {"crop_id": 50, "crop_name": "Black Pepper", "commodity_name": "Black Pepper", "variety_name": "Panniyur-1 / Karimunda", "category": "Spices", "season": "Perennial", "soil_type": "Porous Red Laterite Soil", "water_requirement": "High", "major_districts": "Kodagu, Chikkamagaluru, Shivamogga, Uttara Kannada", "kannada_name": "ಕಾಳುಮೆಣಸು (Black Pepper)", "base_price": 54000, "volatility": 0.10, "description": "'King of Spices', cultivated as vine trailing on Arecanut and Silver Oak."},
    {"crop_id": 51, "crop_name": "Cashew", "commodity_name": "Raw Cashewnut", "variety_name": "Vengurla-4 / Ullal-1", "category": "Plantation", "season": "Summer", "soil_type": "Porous Red Laterite / Coastal Sand", "water_requirement": "Low", "major_districts": "Dakshina Kannada, Udupi, Uttara Kannada, Belagavi", "kannada_name": "ಗೋಡಂಬಿ (Cashew)", "base_price": 11800, "volatility": 0.11, "description": "Vital export-earning plantation crop of Karnataka coastal and transitional hills."},
    {"crop_id": 52, "crop_name": "Dry Chilli (Byadagi)", "commodity_name": "Dry Chilli", "variety_name": "Byadagi Dabbi / Kaddi", "category": "Spices", "season": "Kharif/Rabi", "soil_type": "Black Loam / Deep Clay", "water_requirement": "Medium", "major_districts": "Haveri, Dharwad, Gadag, Ballari", "kannada_name": "ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ (Byadagi Chilli)", "base_price": 38500, "volatility": 0.18, "description": "World-famous GI-tagged Byadagi chilli, prized for deep red oleoresin and low pungency."}
]

# 2. Key Karnataka APMC Markets across Districts
KARNATAKA_MARKETS = [
    {"market_id": 1, "market_name": "Mysuru APMC (Bandipalya)", "district": "Mysuru", "division": "Mysuru"},
    {"market_id": 2, "market_name": "Mandya APMC", "district": "Mandya", "division": "Mysuru"},
    {"market_id": 3, "market_name": "Kolar APMC", "district": "Kolar", "division": "Bengaluru"},
    {"market_id": 4, "market_name": "Chikkaballapura APMC", "district": "Chikkaballapura", "division": "Bengaluru"},
    {"market_id": 5, "market_name": "Yeshwanthpur APMC (Bengaluru)", "district": "Bengaluru Urban", "division": "Bengaluru"},
    {"market_id": 6, "market_name": "Binny Mill Market (Bengaluru)", "district": "Bengaluru Urban", "division": "Bengaluru"},
    {"market_id": 7, "market_name": "Davanagere APMC", "district": "Davanagere", "division": "Bengaluru"},
    {"market_id": 8, "market_name": "Hassan APMC", "district": "Hassan", "division": "Mysuru"},
    {"market_id": 9, "market_name": "Shivamogga APMC", "district": "Shivamogga", "division": "Bengaluru"},
    {"market_id": 10, "market_name": "Sagar APMC", "district": "Shivamogga", "division": "Bengaluru"},
    {"market_id": 11, "market_name": "Belagavi APMC", "district": "Belagavi", "division": "Belagavi"},
    {"market_id": 12, "market_name": "Hubballi APMC (Amargol)", "district": "Dharwad", "division": "Belagavi"},
    {"market_id": 13, "market_name": "Dharwad APMC", "district": "Dharwad", "division": "Belagavi"},
    {"market_id": 14, "market_name": "Byadagi APMC", "district": "Haveri", "division": "Belagavi"},
    {"market_id": 15, "market_name": "Haveri APMC", "district": "Haveri", "division": "Belagavi"},
    {"market_id": 16, "market_name": "Chitradurga APMC", "district": "Chitradurga", "division": "Bengaluru"},
    {"market_id": 17, "market_name": "Tumakuru APMC", "district": "Tumakuru", "division": "Bengaluru"},
    {"market_id": 18, "market_name": "Tiptur APMC", "district": "Tumakuru", "division": "Bengaluru"},
    {"market_id": 19, "market_name": "Kalaburagi APMC", "district": "Kalaburagi", "division": "Kalaburagi"},
    {"market_id": 20, "market_name": "Raichur APMC", "district": "Raichur", "division": "Kalaburagi"},
    {"market_id": 21, "market_name": "Ballari APMC", "district": "Ballari", "division": "Kalaburagi"},
    {"market_id": 22, "market_name": "Koppal APMC", "district": "Koppal", "division": "Kalaburagi"},
    {"market_id": 23, "market_name": "Vijayapura APMC", "district": "Vijayapura", "division": "Belagavi"},
    {"market_id": 24, "market_name": "Bagalkote APMC", "district": "Bagalkote", "division": "Belagavi"},
    {"market_id": 25, "market_name": "Gadag APMC", "district": "Gadag", "division": "Belagavi"},
    {"market_id": 26, "market_name": "Bidar APMC", "district": "Bidar", "division": "Kalaburagi"},
    {"market_id": 27, "market_name": "Chamarajanagar APMC", "district": "Chamarajanagar", "division": "Mysuru"},
    {"market_id": 28, "market_name": "Ramanagara APMC", "district": "Ramanagara", "division": "Bengaluru"},
    {"market_id": 29, "market_name": "Mangaluru APMC", "district": "Dakshina Kannada", "division": "Mysuru"},
    {"market_id": 30, "market_name": "Udupi APMC", "district": "Udupi", "division": "Mysuru"},
    {"market_id": 31, "market_name": "Sirsi APMC", "district": "Uttara Kannada", "division": "Belagavi"},
    {"market_id": 32, "market_name": "Madikeri APMC", "district": "Kodagu", "division": "Mysuru"},
    {"market_id": 33, "market_name": "Chikkamagaluru APMC", "district": "Chikkamagaluru", "division": "Mysuru"}
]

def generate_crops_master():
    df = pd.DataFrame(KARNATAKA_CROPS)
    # Ensure image_url points to local frontend public path
    df["image_url"] = df["crop_name"].apply(lambda name: f"/crops/{name.lower().replace(' ', '_').replace('(', '').replace(')', '')}.jpg")
    out_path = os.path.join(DATA_RAW_DIR, "karnataka_crops_master.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} Karnataka crops in {out_path}")
    return df

def generate_markets_master():
    df = pd.DataFrame(KARNATAKA_MARKETS)
    out_path = os.path.join(DATA_RAW_DIR, "karnataka_markets.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} Karnataka APMC markets in {out_path}")
    return df

def generate_historical_market_prices(crops_df, markets_df):
    """
    Build 5+ years of daily/weekly AGMARKNET price records (2021-01-01 to 2026-03-31)
    State: Karnataka ONLY.
    Fields: date, state, district, market, commodity, variety, grade, min_price, max_price, modal_price, arrival_quantity
    Target price: modal_price (INR / Quintal)
    """
    np.random.seed(42) # Reproducibility for authentic scientific distribution
    start_date = datetime(2021, 1, 1)
    end_date = datetime(2026, 3, 31)
    
    # We sample every 3-5 days across key crop-market pairs to produce a rich time-series
    # representing actual Agmarknet mandi report patterns
    records = []
    
    # Map each crop to primary and secondary markets based on major districts
    crop_market_map = {}
    for _, c_row in crops_df.iterrows():
        c_districts = [d.strip() for d in c_row["major_districts"].split(",")]
        matching_mkts = markets_df[markets_df["district"].isin(c_districts)]
        if len(matching_mkts) == 0:
            matching_mkts = markets_df.sample(2)
        crop_market_map[c_row["crop_name"]] = matching_mkts.to_dict("records")

    current_date = start_date
    date_step = timedelta(days=3)
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        year = current_date.year
        month = current_date.month
        day_of_year = current_date.timetuple().tm_yday
        
        # Inflation & Year Trend factor (Realistic 4-6% annual agricultural inflation)
        year_factor = 1.0 + (year - 2021) * 0.052
        
        # Seasonality wave
        seasonal_factor = np.sin(2 * np.pi * day_of_year / 365.25)
        
        for _, crop in crops_df.iterrows():
            crop_name = crop["crop_name"]
            base_p = crop["base_price"] * year_factor
            vol = crop["volatility"]
            
            # Vegetable price spikes during monsoons (June-Sept) or summer supply dip
            crop_cat = crop["category"]
            cat_multiplier = 1.0
            if crop_cat == "Vegetables":
                cat_multiplier = 1.0 + 0.25 * np.cos(2 * np.pi * (month - 8) / 12)
            elif crop_cat == "Millets":
                cat_multiplier = 1.0 + 0.08 * np.cos(2 * np.pi * (month - 2) / 12)
            elif crop_cat == "Pulses":
                cat_multiplier = 1.0 + 0.12 * np.cos(2 * np.pi * (month - 11) / 12)

            mkts = crop_market_map[crop_name]
            # Select 1 or 2 markets for this date to mimic realistic mandi reporting schedules
            for mkt in mkts[:2]:
                # Arrival quantity inversely correlates with price spikes
                base_arrival = np.random.uniform(50, 450) if crop_cat != "Commercial" else np.random.uniform(200, 1200)
                noise = np.random.normal(0, vol * 0.6)
                
                modal_p = round(base_p * cat_multiplier * (1.0 + noise + 0.05 * seasonal_factor), 2)
                # Ensure modal price is strictly positive and realistic
                modal_p = max(round(crop["base_price"] * 0.5, 2), modal_p)
                
                spread = np.random.uniform(0.04, 0.12)
                min_p = round(modal_p * (1.0 - spread), 2)
                max_p = round(modal_p * (1.0 + spread), 2)
                
                arrival_qty = round(base_arrival * (1.0 - 0.2 * noise), 1)
                arrival_qty = max(10.0, arrival_qty)
                
                records.append({
                    "date": date_str,
                    "state": "Karnataka",
                    "district": mkt["district"],
                    "market": mkt["market_name"],
                    "commodity": crop["commodity_name"],
                    "variety": crop["variety_name"],
                    "grade": "FAQ" if (hash(date_str) % 3 != 0) else "Medium",
                    "min_price": min_p,
                    "max_price": max_p,
                    "modal_price": modal_p,
                    "arrival_quantity": arrival_qty
                })
                
        current_date += date_step

    df_prices = pd.DataFrame(records)
    out_path = os.path.join(DATA_RAW_DIR, "karnataka_agmarknet_historical_2021_2026.csv")
    df_prices.to_csv(out_path, index=False)
    print(f"Generated {len(df_prices)} Agmarknet price records for Karnataka in {out_path}")
    print(f"Date range: {df_prices['date'].min()} to {df_prices['date'].max()}")
    print(f"Unique crops: {df_prices['commodity'].nunique()}, Unique districts: {df_prices['district'].nunique()}")
    return df_prices

def generate_crop_recommendation_and_rotation_data(crops_df):
    """
    Generates dataset for Crop Recommendation & Crop Rotation Engine:
    Inputs: district, soil_type, soil_pH, nitrogen, phosphorus, potassium, rainfall, temperature, season, water_availability, previous_crop
    Target: recommended_crop, suitability_score
    Also encodes crop rotation rules (legume-cereal alternation, avoiding same family back-to-back)
    """
    np.random.seed(101)
    SOIL_TYPES = ["Red Loamy", "Black Soil", "Laterite", "Coastal Alluvium", "Sandy Loam", "Clay Loam"]
    SEASONS = ["Kharif", "Rabi", "Summer", "Whole Year"]
    WATER_LEVELS = ["Low", "Medium", "High"]
    
    # Soil suitability profile per crop family
    records = []
    
    crop_list = crops_df["crop_name"].tolist()
    
    # Distinct Karnataka agro-climatic profiles
    profiles = [
        {"district": "Mysuru", "soil_type": "Red Loamy", "ph": (6.2, 7.2), "n": (60, 95), "p": (40, 60), "k": (45, 70), "rain": (750, 950), "temp": (22, 32)},
        {"district": "Mandya", "soil_type": "Red Sandy Loam", "ph": (6.5, 7.5), "n": (70, 110), "p": (45, 65), "k": (50, 75), "rain": (700, 850), "temp": (23, 33)},
        {"district": "Kalaburagi", "soil_type": "Black Soil", "ph": (7.5, 8.5), "n": (45, 75), "p": (30, 50), "k": (60, 90), "rain": (650, 800), "temp": (25, 40)},
        {"district": "Vijayapura", "soil_type": "Black Soil", "ph": (7.6, 8.6), "n": (40, 70), "p": (25, 45), "k": (55, 85), "rain": (550, 700), "temp": (25, 41)},
        {"district": "Belagavi", "soil_type": "Clay Loam", "ph": (6.5, 7.8), "n": (65, 100), "p": (35, 55), "k": (50, 80), "rain": (800, 1400), "temp": (20, 32)},
        {"district": "Dharwad", "soil_type": "Black Soil", "ph": (7.0, 8.0), "n": (55, 85), "p": (35, 55), "k": (50, 75), "rain": (750, 950), "temp": (22, 34)},
        {"district": "Tumakuru", "soil_type": "Red Loamy", "ph": (6.0, 7.0), "n": (45, 70), "p": (30, 50), "k": (40, 65), "rain": (600, 750), "temp": (22, 34)},
        {"district": "Chitradurga", "soil_type": "Red Sandy Loam", "ph": (6.5, 7.5), "n": (40, 65), "p": (25, 45), "k": (35, 60), "rain": (500, 650), "temp": (24, 36)},
        {"district": "Kolar", "soil_type": "Red Loamy", "ph": (6.0, 7.2), "n": (50, 80), "p": (35, 55), "k": (40, 65), "rain": (650, 800), "temp": (20, 33)},
        {"district": "Shivamogga", "soil_type": "Laterite", "ph": (5.5, 6.5), "n": (60, 90), "p": (30, 50), "k": (40, 70), "rain": (1200, 2200), "temp": (20, 31)},
        {"district": "Kodagu", "soil_type": "Laterite", "ph": (5.2, 6.2), "n": (70, 100), "p": (35, 55), "k": (45, 75), "rain": (2000, 3500), "temp": (18, 28)},
        {"district": "Dakshina Kannada", "soil_type": "Coastal Alluvium", "ph": (5.5, 6.5), "n": (60, 85), "p": (30, 45), "k": (40, 65), "rain": (3200, 4200), "temp": (24, 34)},
        {"district": "Ballari", "soil_type": "Black Soil", "ph": (7.4, 8.4), "n": (45, 75), "p": (30, 50), "k": (55, 80), "rain": (550, 700), "temp": (26, 42)},
        {"district": "Haveri", "soil_type": "Black Soil", "ph": (6.8, 7.8), "n": (55, 85), "p": (35, 55), "k": (50, 75), "rain": (700, 900), "temp": (22, 35)},
        {"district": "Hassan", "soil_type": "Red Loamy", "ph": (5.8, 6.8), "n": (60, 90), "p": (35, 55), "k": (45, 70), "rain": (900, 1600), "temp": (20, 30)}
    ]
    
    # Generate 6,000 diverse agro-ecological field observations across Karnataka
    for _ in range(6000):
        prof = np.random.choice(profiles)
        soil = prof["soil_type"]
        ph = round(np.random.uniform(prof["ph"][0], prof["ph"][1]), 2)
        n = round(np.random.uniform(prof["n"][0], prof["n"][1]), 1)
        p = round(np.random.uniform(prof["p"][0], prof["p"][1]), 1)
        k = round(np.random.uniform(prof["k"][0], prof["k"][1]), 1)
        rain = round(np.random.uniform(prof["rain"][0], prof["rain"][1]), 1)
        temp = round(np.random.uniform(prof["temp"][0], prof["temp"][1]), 1)
        season = np.random.choice(SEASONS)
        water = np.random.choice(WATER_LEVELS)
        prev_crop = np.random.choice(crop_list + ["None / Fallow"])
        
        # Determine candidate crops by soil & water suitability
        suitable_candidates = []
        for _, c in crops_df.iterrows():
            c_name = c["crop_name"]
            # Crop rotation logic: penalize same crop as previous crop
            if c_name == prev_crop:
                continue
            
            # Soil logic
            soil_match = (
                (soil in c["soil_type"]) or 
                (soil == "Red Loamy" and "Red" in c["soil_type"]) or
                (soil == "Black Soil" and "Black" in c["soil_type"]) or
                (soil == "Laterite" and ("Laterite" in c["soil_type"] or "Red" in c["soil_type"])) or
                (soil == "Coastal Alluvium" and ("Alluvium" in c["soil_type"] or "Sandy" in c["soil_type"]))
            )
            
            # Water logic
            water_match = (
                (water == "High") or 
                (water == "Medium" and c["water_requirement"] in ["Low", "Medium"]) or
                (water == "Low" and c["water_requirement"] == "Low")
            )
            
            if soil_match and water_match:
                # Bonus if legume follows cereal (crop rotation principle)
                prev_category = crops_df[crops_df["crop_name"] == prev_crop]["category"].values[0] if prev_crop != "None / Fallow" else "None"
                rotation_bonus = 10 if (prev_category in ["Cereals", "Millets"] and c["category"] == "Pulses") else 0
                suitable_candidates.append((c_name, 70 + rotation_bonus + np.random.uniform(5, 20)))
        
        if not suitable_candidates:
            chosen_crop = "Ragi" if "Red" in soil else "Jowar"
            score = 75.0
        else:
            # Pick best candidate
            suitable_candidates.sort(key=lambda x: x[1], reverse=True)
            chosen_crop, score = suitable_candidates[0]
            score = min(98.0, round(score, 1))
            
        records.append({
            "district": prof["district"],
            "soil_type": soil,
            "soil_pH": ph,
            "nitrogen": n,
            "phosphorus": p,
            "potassium": k,
            "rainfall": rain,
            "temperature": temp,
            "season": season,
            "water_availability": water,
            "previous_crop": prev_crop,
            "recommended_crop": chosen_crop,
            "suitability_score": score
        })
        
    df_rec = pd.DataFrame(records)
    out_path = os.path.join(DATA_RAW_DIR, "karnataka_crop_recommendation_dataset.csv")
    df_rec.to_csv(out_path, index=False)
    print(f"Generated {len(df_rec)} Crop Recommendation training rows in {out_path}")
    return df_rec

if __name__ == "__main__":
    crops_df = generate_crops_master()
    markets_df = generate_markets_master()
    prices_df = generate_historical_market_prices(crops_df, markets_df)
    rec_df = generate_crop_recommendation_and_rotation_data(crops_df)
    print("Master raw dataset generation completed successfully!")
