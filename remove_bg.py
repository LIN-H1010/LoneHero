from PIL import Image
import sys

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    # Get the background color from the top-left pixel
    bg_color = data[0]
    threshold = 30 # tolerance
    
    new_data = []
    for item in data:
        if abs(item[0] - bg_color[0]) < threshold and \
           abs(item[1] - bg_color[1]) < threshold and \
           abs(item[2] - bg_color[2]) < threshold:
            new_data.append((255, 255, 255, 0)) # transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_background(sys.argv[1], sys.argv[2])
