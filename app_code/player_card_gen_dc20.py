from PIL import Image, ImageDraw, ImageFont
import sys
# Define a function to generate the image
def generate_image(template, output_file, font_file, font_size, replacements):
    # Open the template image
    template_image = Image.open(template)
    
    template_image = template_image.convert('RGB')
    # Create a drawing object
    draw = ImageDraw.Draw(template_image)
    
    # Load the font
    font = ImageFont.truetype(font_file, font_size)
    
    # Iterate over the replacements dictionary
    for position, value in replacements.items():
        # Split the position into x and y coordinates
        x, y = map(int, position.split(','))

        # Check if the value is a number (stat score)
        if isinstance(value, float):
            # Calculate the percentage of the bar to fill
            percentage = value

            # Define the bar dimensions
            bar_width = 200  # Width of the bar in pixels
            bar_height = 20  # Height of the bar in pixels
            bar_x = x + 100  # X-coordinate of the bar
            bar_y = y  # Y-coordinate of the bar

 # Draw the bar background with a pattern of dots
            for dot_x in range(bar_x, bar_x + bar_width, 5):
                for dot_y in range(bar_y, bar_y + bar_height, 5):
                    draw.rectangle([dot_x, dot_y, dot_x + 2, dot_y + 2], fill=(128, 128, 128))

            # Draw the filled portion of the bar
            fill_width = int(bar_width * percentage)
            draw.rectangle([bar_x, bar_y, bar_x + fill_width, bar_y + bar_height], fill=(0,))
        else:
            # Draw the value on the image
            # draw.text((x-1, y-1), str(value), font=font, fill="black")
            # draw.text((x+1, y-1), str(value), font=font, fill="black")
            # draw.text((x-1, y+1), str(value), font=font, fill="black")
            # draw.text((x+1, y+1), str(value), font=font, fill="black")

            # Draw white text on top of the black text to create a stroke effect
            draw.text((x, y), str(value), font=font, fill="black")
            #draw.text((x, y), str(value), font=font, fill=(0,))

    
    # Save the modified image
    template_image.save(output_file)

# Example usage
# template = './template.png'
# output_file = 'output.jpg'
# font_file = './arial.ttf'
# font_size = 24

def main():
    #Example command
    # Check if the correct number of arguments is provided
    #python3 player_card_gen_dc20.py ./Bungee-Regular.ttf 20 ./DC20.png ./outout.png HArry Elf 120 +2 +1 0 -1 30ft +2 1d8 13 12 30 20 10 30 20 10 2
    if len(sys.argv) != 24:
        print("Usage: needs more or less args 23 is needed, recieved", len(sys.argv))
        sys.exit(1)

    # Get the command-line arguments
    font_file = sys.argv[1]
    font_size = sys.argv[2]
    template = sys.argv[3]
    output_file = sys.argv[4]
    name = sys.argv[5]
    race = sys.argv[6]
    age = sys.argv[7]
    lvl = sys.argv[23]
    Mig = sys.argv[8]
    Agi = sys.argv[9]
    Cha = sys.argv[10]
    Int = sys.argv[11]
    speed = sys.argv[12]
    att = sys.argv[13]
    att_dmg = sys.argv[14]
    physical_def = sys.argv[15]
    mental_def = sys.argv[16]
    max_hp = sys.argv[17]
    max_mp = sys.argv[18]
    max_sp = sys.argv[19]
    hp = sys.argv[20]
    mp = sys.argv[21]
    sp = sys.argv[22]


    replacements = {
        '185,10': '${name}, ${race}, ${age}', 
        '185,35': 'Level: ${lvl}', # Name
        '85,10': 'Prime',
        '85,80': 'Mind',
        '85,105': 'Int:${Int}',
        '85,125': 'Cha:${Cha}',
        '40,150': 'Def:${mental_def}',
        '85,185': 'Body',
        '85,230': 'Mig:${Mig}',
        '85,210': 'Agi:${Agi}',
        '40,265': 'Def:${physical_def}',
        '175, 130': '${sp}/${max_sp}',
        '250, 130': '${mp}/${max_mp}',
        '325, 130': '${hp}/${max_hp}',
        '185, 265': 'Speed:${speed}ft',
        '185, 245': 'ATK:${att} DMG:${att_dmg}',
    }

    for key, value in replacements.items():
        value = value.replace('${name}', name)
        value = value.replace('${race}', race)
        value = value.replace('${age}', age)
        value = value.replace('${lvl}', lvl)
        value = value.replace('${Int}', Int)
        value = value.replace('${Cha}', Cha)
        value = value.replace('${mental_def}', mental_def)
        value = value.replace('${Mig}', Mig)
        value = value.replace('${Agi}', Agi)
        value = value.replace('${physical_def}', physical_def)
        value = value.replace('${speed}', speed)
        value = value.replace('${att}', att)
        value = value.replace('${att_dmg}', att_dmg)
        value = value.replace('${mp}', mp)
        value = value.replace('${max_mp}', max_mp)
        value = value.replace('${hp}', hp)
        value = value.replace('${max_hp}', max_hp)
        value = value.replace('${sp}', sp)
        value = value.replace('${max_sp}', max_sp)
        replacements[key] = value

    # # Handle float conversions separately
    # replacements['85,244'] = float(health_precent)
    # replacements['85,274'] = float(mana_precent)

    generate_image(template, output_file, font_file, int(font_size), replacements)

if __name__ == "__main__":
    main()