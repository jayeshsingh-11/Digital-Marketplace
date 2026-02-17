import sys
from PIL import Image

def remove_checkerboard(image_path, output_path):
    print(f"Processing {image_path} -> {output_path}")
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    
    # Standard checkerboard colors often used:
    # White: (255, 255, 255)
    # Light Gray: (230, 230, 230) to (245, 245, 245) depending on the source.
    # The screenshot shows a very crisp checkerboard.
    
    # We will use a color range approach.
    # If R,G,B satisfy a condition AND are not part of the main subject.
    # This is tricky without object segmentation. 
    # BUT, looking at the screenshot, the "main subject" is colorful people.
    # The background is purely grayscale (white/gray).
    # So if a pixel is perfectly grayscale (R=G=B) and high brightness (>200), kill it?
    
    count = 0
    
    for item in datas:
        # item is (r, g, b, a)
        r, g, b, a = item
        
        # Check if pixel is grayscale (or very close to it)
        is_grayscale = abs(r - g) < 5 and abs(g - b) < 5 and abs(r - b) < 5
        
        # Check if it is high brightness (background is usually light)
        is_bright = r > 200 # 200 is a safe bet for checkerboard whites/grays
        
        if is_grayscale and is_bright:
            # Turn transparency on
            new_data.append((255, 255, 255, 0))
            count += 1
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Finished. Modified {count} pixels.")

if __name__ == "__main__":
    input_path = "c:\\task-core\\digitalhippo-master\\public\\empty-cart.png"
    output_path = "c:\\task-core\\digitalhippo-master\\public\\empty-cart-fixed.png"
    # Actually, let's overwrite for simplicity in code usage? 
    # Safer to create a new file first: empty-cart-fixed.png
    remove_checkerboard(input_path, output_path)
