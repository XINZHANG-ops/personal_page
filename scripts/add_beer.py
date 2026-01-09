#!/usr/bin/env python3
"""
Beer Rating Gradio UI
A simple interface to add new beer ratings to your collection.
"""

import gradio as gr
import json
import os
from datetime import datetime
from PIL import Image
import re
import subprocess

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)  # Go up one level to project root

# Paths relative to project root
JSONL_FILE = os.path.join(ROOT_DIR, "data", "beer.jsonl")
IMAGES_DIR = os.path.join(ROOT_DIR, "assets", "images", "beers")
DATA_DIR = os.path.join(ROOT_DIR, "data")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

# Beer style options
BEER_STYLES = [
    "IPA (India Pale Ale)",
    "Imperial Stout",
    "Stout",
    "Lager",
    "Pilsner",
    "Wheat Beer",
    "Porter",
    "Sour Ale",
    "Amber Ale",
    "Pale Ale",
    "Belgian",
    "Brown Ale",
    "Barleywine",
    "Saison",
    "Other"
]


def sanitize_filename(name):
    """Convert beer name to safe filename"""
    # Convert to lowercase and replace spaces with hyphens
    filename = name.lower()
    # Remove special characters
    filename = re.sub(r'[^a-z0-9\s-]', '', filename)
    # Replace spaces with hyphens
    filename = re.sub(r'\s+', '-', filename)
    # Remove multiple hyphens
    filename = re.sub(r'-+', '-', filename)
    return filename.strip('-')


def process_image(image, beer_name):
    """Process and save beer image in high resolution"""
    if image is None:
        return None

    # Create filename from beer name
    filename = sanitize_filename(beer_name)
    filepath = os.path.join(IMAGES_DIR, f"{filename}.jpg")

    # Open image
    img = Image.open(image)

    # Convert to RGB if needed (handles RGBA, etc.)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize to high-resolution standard size (1200x1200) maintaining aspect ratio
    img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)

    # Create a square image with padding if needed
    square_size = 1200
    square_img = Image.new('RGB', (square_size, square_size), (240, 240, 240))

    # Calculate position to center the image
    x = (square_size - img.width) // 2
    y = (square_size - img.height) // 2

    # Paste the resized image onto the square background
    square_img.paste(img, (x, y))

    # Save as high-quality JPEG (quality=95 for excellent quality, optimized compression)
    square_img.save(filepath, 'JPEG', quality=95, optimize=True)

    return f"assets/images/beers/{filename}.jpg"


def add_beer(name, style, abv, price, notes, maltiness, color_depth, clarity, bitterness, other_aromas, overall, image):
    """Add a new beer to the collection"""

    # Validation
    if not name or not name.strip():
        return "❌ Error: Beer name is required!"

    if not notes or not notes.strip():
        return "❌ Error: Tasting notes are required!"

    # Create beer ID
    beer_id = sanitize_filename(name)

    # Process image
    image_url = process_image(image, name)
    if image_url is None:
        return "❌ Error: Please upload a beer image!"

    # Create beer data
    beer_data = {
        "id": beer_id,
        "name": name.strip(),
        "style": style,
        "abv": round(abv, 1),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "price": round(price, 2),
        "imageUrl": image_url,
        "notes": notes.strip(),
        "scores": {
            "maltiness": round(maltiness, 1),
            "colorDepth": round(color_depth, 1),
            "clarity": round(clarity, 1),
            "bitterness": round(bitterness, 1),
            "otherAromas": round(other_aromas, 1),
            "overall": round(overall, 1)
        }
    }

    # Check if beer already exists
    existing_beers = []
    if os.path.exists(JSONL_FILE):
        with open(JSONL_FILE, 'r') as f:
            for line in f:
                existing_beer = json.loads(line)
                if existing_beer['id'] == beer_id:
                    return f"❌ Error: A beer with the name '{name}' already exists! Please use a different name or delete the old entry first."
                existing_beers.append(existing_beer)

    # Append to JSONL file
    with open(JSONL_FILE, 'a') as f:
        f.write(json.dumps(beer_data) + '\n')

    return f"✅ Success! '{name}' has been added to your beer collection!\n\n📊 Overall Score: {overall}/10\n🍺 Style: {style}\n💪 ABV: {abv}%\n\n💡 Next steps:\n1. Run 'npm run build-beer' to update the website\n2. Open pages/beer.html to see your new beer!"


def view_collection():
    """View all beers in the collection"""
    if not os.path.exists(JSONL_FILE):
        return "No beers in collection yet. Add your first beer!"

    beers = []
    with open(JSONL_FILE, 'r') as f:
        for line in f:
            beers.append(json.loads(line))

    if not beers:
        return "No beers in collection yet. Add your first beer!"

    # Sort by date (newest first)
    beers.sort(key=lambda x: x['date'], reverse=True)

    output = f"📊 **Your Beer Collection ({len(beers)} beers)**\n\n"
    for beer in beers:
        output += f"**{beer['name']}** ({beer['style']}, {beer['abv']}% ABV)\n"
        output += f"   Overall: {beer['scores']['overall']}/10 | Added: {beer['date']}\n"
        output += f"   {beer['notes'][:100]}{'...' if len(beer['notes']) > 100 else ''}\n\n"

    return output


def sync_to_git(beer_name=None):
    """Build, commit and push changes to git"""
    try:
        output_messages = []

        # Change to project root directory
        os.chdir(ROOT_DIR)

        # Step 1: Build all
        output_messages.append("Step 1/4: Running build-all...")
        result = subprocess.run(
            "npm run build-all",
            capture_output=True,
            text=True,
            timeout=60,
            shell=True
        )
        if result.returncode != 0:
            return f"Build failed:\n{result.stderr}"
        output_messages.append("Build completed successfully")

        # Step 2: Git add
        output_messages.append("\nStep 2/4: Adding files to git...")
        result = subprocess.run(
            "git add -A",
            capture_output=True,
            text=True,
            shell=True
        )
        if result.returncode != 0:
            return f"Git add failed:\n{result.stderr}"
        output_messages.append("Files added to git")

        # Step 3: Git commit
        commit_message = "new beer"
        output_messages.append(f"\nStep 3/4: Committing with message: '{commit_message}'")
        result = subprocess.run(
            f'git commit -m "{commit_message}"',
            capture_output=True,
            text=True,
            shell=True
        )
        if result.returncode != 0:
            # Check if it's "nothing to commit"
            if "nothing to commit" in result.stdout.lower():
                output_messages.append("Nothing new to commit")
            else:
                return f"Git commit failed:\n{result.stderr}\n{result.stdout}"
        else:
            output_messages.append("Commit created successfully")

        # Step 4: Git push
        output_messages.append("\nStep 4/4: Pushing to remote...")
        result = subprocess.run(
            "git push",
            capture_output=True,
            text=True,
            timeout=30,
            shell=True
        )
        if result.returncode != 0:
            return f"Git push failed:\n{result.stderr}\n{result.stdout}"
        output_messages.append("Pushed to remote successfully")

        # Success
        output_messages.append("\n✅ Successfully synced to git!")
        return "\n".join(output_messages)

    except subprocess.TimeoutExpired:
        return "Error: Operation timed out"
    except Exception as e:
        return f"Error during sync: {str(e)}"


# Create Gradio interface
with gr.Blocks(title="🍺 Beer Rating System", theme=gr.themes.Soft()) as app:
    gr.Markdown("# 🍺 Beer Rating System")
    gr.Markdown("Add new beers to your collection with ratings and photos")

    with gr.Tab("Add New Beer"):
        with gr.Row():
            with gr.Column(scale=1):
                gr.Markdown("### 📝 Beer Information")
                name_input = gr.Textbox(label="Beer Name", placeholder="e.g., Guinness Draught")
                style_input = gr.Dropdown(choices=BEER_STYLES, label="Beer Style", value="IPA (India Pale Ale)")
                abv_input = gr.Slider(minimum=0, maximum=20, value=6.5, step=0.1, label="ABV (%)")
                price_input = gr.Slider(minimum=0, maximum=100, value=0, step=0.01, label="价格 Price ($)")
                notes_input = gr.Textbox(
                    label="Tasting Notes",
                    placeholder="Describe the beer's appearance, aroma, flavor, and your overall impression...",
                    lines=4
                )
                image_input = gr.Image(type="filepath", label="Beer Photo")

            with gr.Column(scale=1):
                gr.Markdown("### ⭐ Scores (1-10)")
                maltiness_input = gr.Slider(minimum=1, maximum=10, value=7.5, step=0.5, label="麦芽香 Maltiness (malt character)")
                color_depth_input = gr.Slider(minimum=1, maximum=10, value=7.5, step=0.5, label="颜色深浅 Color Depth (darkness/lightness)")
                clarity_input = gr.Slider(minimum=1, maximum=10, value=7.5, step=0.5, label="清澈度 Clarity (clear vs hazy)")
                bitterness_input = gr.Slider(minimum=1, maximum=10, value=7.5, step=0.5, label="苦度 Bitterness (hop bitterness)")
                other_aromas_input = gr.Slider(minimum=1, maximum=10, value=7.5, step=0.5, label="其他香味 Other Aromas (fruity, spicy, etc.)")
                overall_input = gr.Slider(minimum=1, maximum=10, value=7.5, step=0.5, label="综合 Overall (total experience)")

        with gr.Row():
            submit_btn = gr.Button("💾 Save Beer", variant="primary", size="lg", scale=2)
            sync_btn = gr.Button("🔄 Sync to Git", variant="secondary", size="lg", scale=1)

        output = gr.Textbox(label="Status", lines=6)

        submit_btn.click(
            fn=add_beer,
            inputs=[name_input, style_input, abv_input, price_input, notes_input,
                   maltiness_input, color_depth_input, clarity_input,
                   bitterness_input, other_aromas_input, overall_input, image_input],
            outputs=output
        )

        sync_btn.click(
            fn=sync_to_git,
            inputs=[name_input],
            outputs=output
        )

    with gr.Tab("View Collection"):
        gr.Markdown("### 📚 Your Beer Collection")
        view_btn = gr.Button("🔄 Refresh Collection", variant="secondary")
        collection_output = gr.Markdown()

        view_btn.click(fn=view_collection, outputs=collection_output)

        # Auto-load on tab open
        app.load(fn=view_collection, outputs=collection_output)

    gr.Markdown("""
    ---
    ### 💡 Quick Guide
    1. **Add Beer Info**: Enter the beer name, select style, and set ABV
    2. **Write Notes**: Describe what you tasted (use the style guide for ideas!)
    3. **Upload Photo**: Drag & drop or click to upload (will be resized to 400x400)
    4. **Rate**: Score each aspect from 1-10 (use 0.5 increments)
    5. **Save**: Click save to add to your collection
    6. **Build**: Run `npm run build-beer` to update your website

    **Pro tip**: Try to be consistent with your scoring scale!
    """)

if __name__ == "__main__":
    print("🍺 Starting Beer Rating System...")
    print("📁 Data file:", JSONL_FILE)
    print("🖼️  Images folder:", IMAGES_DIR)
    app.launch(share=False, server_name="127.0.0.1", server_port=7860)
