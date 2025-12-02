import pandas as pd
import folium
import numpy as np
from itertools import cycle
from pathlib import Path
import geopandas as gpd
import zipfile
import base64
import subprocess


# =====================================================
# CONFIG
# =====================================================

DATA_FILE = "WilletTreeInventory_coordinates.xlsx"
SHEET_NAME = 1
OUTPUT_HTML = "willet_tree_map.html"

PHOTOS_ZIP = "Photos.zip"
PHOTOS_DIR = "Photos"

# =====================================================
# MAIN FUNCTION
# =====================================================
drive_id = "1MzOkSNNjIejlXAKqPJUyxqozCrzuwmJT"
download_file = "extra_data.zip"

if not Path(download_file).exists():
    subprocess.run([
        "gdown",
        "--id", drive_id,
        "-O", download_file
    ])


def build_tree_map(data_path, boundary_shp="Boundaries.shp"):
    """
    Creates an interactive folium tree map with canopy circles, polygon markers
    by genus, school boundary overlay, and a popup with a photo per tree.
    """

    # ==========================
    # PATHS
    # ==========================
    base_dir = Path(__file__).parent.resolve()
    data_path = Path(data_path)
    boundary_path = base_dir / boundary_shp

    photos_zip = base_dir / PHOTOS_ZIP
    photos_dir = base_dir / PHOTOS_DIR

    # ==========================
    # UNZIP PHOTOS (run once)
    # ==========================
    if photos_zip.exists() and not photos_dir.exists():
        print("📸 Extracting photos...")
        with zipfile.ZipFile(photos_zip, "r") as z:
            z.extractall(photos_dir)

    # ==========================
    # LOAD INVENTORY
    # ==========================
    df = pd.read_excel(data_path, sheet_name=SHEET_NAME)
    df_map = df.dropna(subset=["lat", "lon"]).copy()

    center = [df_map["lat"].mean(),
              df_map["lon"].mean()]

    # ==========================
    # BASE MAP
    # ==========================
    m = folium.Map(location=center,
                   zoom_start=18,
                   tiles="OpenStreetMap",
                   name="OSM")

    folium.TileLayer("CartoDB positron", name="CartoDB positron").add_to(m)

    folium.TileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}",
        attr="Esri World Imagery",
        name="Esri Satellite",
        overlay=False,
        control=True
    ).add_to(m)

    # ==========================
    # BOUNDARY SHAPEFILE
    # ==========================
    if boundary_path.exists():

        gdf = gpd.read_file(boundary_path)

        if gdf.crs is None:
            gdf = gdf.set_crs(epsg=3310, inplace=False)

        gdf = gdf.to_crs(epsg=4326)

        folium.GeoJson(
            gdf,
            name="School boundary",
            style_function=lambda x: {
                "color": "black",
                "weight": 1,
                "fillColor": "none",
                "fillOpacity": 0
            }
        ).add_to(m)
    else:
        print(f"⚠ WARNING: boundary shapefile not found -> {boundary_path}")

    # ==========================
    # GENUS STYLES
    # ==========================
    genera = sorted(df_map["Genus"].dropna().unique())

    shape_specs = [
        {"sides": 3, "rotation": 0},
        {"sides": 4, "rotation": 45},
        {"sides": 5, "rotation": 0},
        {"sides": 6, "rotation": 0},
        {"sides": 8, "rotation": 0},
        {"sides": 3, "rotation": 180},
        {"sides": 4, "rotation": 0}
    ]

    colors = [
        "red", "blue", "green", "purple", "orange",
        "darkred", "darkblue", "darkgreen", "cadetblue",
        "pink", "black", "gray"
    ]

    shape_cycle = cycle(shape_specs)
    color_cycle = cycle(colors)

    genus_styles = {
        g: {"shape": next(shape_cycle),
            "color": next(color_cycle)}
        for g in genera
    }

    # ==========================
    # ADD TREES
    # ==========================
    for _, r in df_map.iterrows():

        lat, lon = float(r["lat"]), float(r["lon"])
        genus = r.get("Genus", "NA")
        tree_code = r.get("TreeCode", "").strip()

        style = genus_styles.get(genus)

        # ---- CANOPY SIZE ----
        ns = r.get("CrownNSm", np.nan)
        ew = r.get("CrownEWm", np.nan)

        crown_radius = None
        if pd.notna(ns) and pd.notna(ew):
            crown_radius = (ns + ew) / 4
        elif pd.notna(ns):
            crown_radius = ns / 2
        elif pd.notna(ew):
            crown_radius = ew / 2

        if crown_radius:
            folium.Circle([lat, lon],
                           radius=crown_radius,
                           fill=True,
                           fill_opacity=0.3,
                           color=None,
                           stroke=False).add_to(m)

        # ==========================
        # PHOTO LOOKUP
        # ==========================
        photo_html = ""
        
        if tree_code and photos_dir.exists():
        
            code = tree_code.strip().lower()
        
            matches = [
                p for p in photos_dir.iterdir()
                if code in p.stem.lower()
                and p.suffix.lower() in [".jpg", ".jpeg", ".png"]
            ]
        
            if matches:
        
                img_path = matches[0]
        
                with open(img_path, "rb") as img_file:
                    encoded = base64.b64encode(img_file.read()).decode("utf-8")
        
                ext = img_path.suffix.lower().replace(".", "")
                if ext == "jpg":
                    ext = "jpeg"
        
                photo_html = f"""
                <br>
                <img src="data:image/{ext};base64,{encoded}"
                     width="200"
                     style="border-radius:8px; margin-top:6px;">
                """
        
            else:
                photo_html = "<br><i>No photo available</i>"

        # ==========================
        # POPUP
        # ==========================
        popup_html = f"""
        <div style="font-size:13px;">
            <b>Tree code:</b> {tree_code}<br>
            <b>Genus:</b> {r.get('Genus','')}<br>
            <b>Species:</b> {r.get('Species','')}<br>
            <b>DBH (cm):</b> {r.get('DBH1cm','')}<br>
            <b>Height (m):</b> {r.get('Heightm','')}
            {photo_html}
        </div>
        """

        popup = folium.Popup(popup_html, max_width=300)

        # ---- MARKERS ----
        if style:
            shape = style["shape"]
            color = style["color"]
        else:
            shape = {"sides": 4, "rotation": 0}
            color = "gray"

        folium.RegularPolygonMarker(
            [lat, lon],
            number_of_sides=shape["sides"],
            rotation=shape["rotation"],
            radius=7,
            color=color,
            fill=True,
            fill_opacity=0.9,
            popup=popup
        ).add_to(m)

    # ==========================
    # CONTROLS + SAVE
    # ==========================
    folium.LayerControl().add_to(m)

    m.save(base_dir / OUTPUT_HTML)

    return m






