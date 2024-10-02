import subprocess
import argparse
import os
import shutil

def add_banners(input_image, output_image, corner_banner, corner_banner_effect, top_text, corner_text, turn_text):
    # Temporary file to store the HD image
    hd_image = "./hd_image.jpg"
    
    # Resize the input image to HD resolution (1920x1080)
    resize_command = [
        "convert", input_image,
        "-resize", "1920x1080",
        hd_image
    ]
    
    # Run the resize command
    subprocess.run(resize_command, check=True)
    
    command = [
        "convert", hd_image,
         # Add corner banner
        "(", corner_banner, "-resize", "70%", ")",
        "-gravity", "north", f"-geometry", f"+0-70", "-composite",
        # Add corner banner
        "(", corner_banner_effect, "-resize", "75%", ")",
        "-gravity", "southeast", f"-geometry", f"-0-50",  "-composite",
        # Add top text
        "-fill", "white", "-pointsize", "85", "-gravity", "north",
         "-font", "Yrsa-Regular", "-stroke", "black", "-strokewidth", "1",
        "-annotate", "+0+30", top_text,
        # Add bottom right text
        "-fill", "white", "-pointsize", "50", "-gravity", "southeast",
         "-font", "Yrsa-Regular","-stroke", "black", "-strokewidth", "1",
        "-annotate", "+10+20", corner_text,
            # Add bottom right text
        "-fill", "white", "-pointsize", "125", "-gravity", "southwest",
         "-font", "Yrsa-Regular", "-stroke", "black", "-strokewidth", "2",
        "-annotate", "+25+70", turn_text,
        output_image
    ]
    
    subprocess.run(command, check=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add banners and text to an image using ImageMagick.")
    parser.add_argument("input_image", help="Path to the input image")
    parser.add_argument("output_image", help="Path to save the output image")
    parser.add_argument("corner_banner", help="Path to the banner.png for the corner")
    parser.add_argument("corner_banner_effect", help="Path to the banner.png for the corner")
    parser.add_argument("top_text", help="Text for the top banner")
    parser.add_argument("corner_text", help="Text for the corner banner")
    parser.add_argument("turn_text", help="Text for the corner banner")

    
    args = parser.parse_args()
    
    add_banners(args.input_image, args.output_image, args.corner_banner, args.corner_banner_effect, args.top_text, args.corner_text, args.turn_text)
    print(f"Image processed and saved as {args.output_image}")