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
        elif isinstance(value, int):
            draw.rectangle([150,230, 152, 232], outline="black", width=2)
        else:
            # Draw the value on the image
            # Offsets for thicker stroke effect
            offsets = [-2, -1, 0, 1, 2]

            # Draw black text with multiple offsets for a thicker stroke
            for dx in offsets:
                for dy in offsets:
                    # Skip the center point to avoid drawing over the white text later
                    if dx == 0 and dy == 0:
                        continue
                    draw.text((x + dx, y + dy), str(value), font=font, fill="black")


            # Draw white text on top of the black text to create a stroke effect
            draw.text((x, y), str(value), font=font, fill="white")
            #draw.text((x, y), str(value), font=font, fill=(0,))
    #draw.rectangle([150, 230, 152, 232], outline="black", width=2)
    # Save the modified image
    template_image.save(output_file)

# Example usage
# template = './template.png'
# output_file = 'output.jpg'
# font_file = './arial.ttf'
# font_size = 24

def main():
    #Example command
    #python3 player_card_gen.py ./template.png ./output.jpg ./arial.ttf 24 Thorin Dwarf 150 "+3 +2" "+2 +1" "+4 +2" "+1 +0" "+2 +1" "+0 -1" 25 +3 +2 +5 "1d8+3" +4 "1d6+1" 4 +2 30 0.5 45 0.75
    # Check if the correct number of arguments is provided
    if len(sys.argv) != 28:
        print("Usage: needs more or less args 26 is needed, recieved", len(sys.argv))
        sys.exit(1)

    # Get the command-line arguments
    font_file = sys.argv[1]
    font_size = sys.argv[2]
    output_file = sys.argv[3]
    template = sys.argv[4]
    name = sys.argv[5]
    race = sys.argv[6]
    age = sys.argv[7]
    Str = sys.argv[8]
    Dex = sys.argv[9]
    Con = sys.argv[10]
    Int = sys.argv[11]
    Wis = sys.argv[12]
    Cha = sys.argv[13]
    speed = sys.argv[14]
    level = sys.argv[15]
    special1 = sys.argv[16]
    att = sys.argv[17]
    att_dmg = sys.argv[18]
    special2 = sys.argv[19]
    mag = sys.argv[20]
    ac = sys.argv[21]
    max_hp = sys.argv[22]
    max_mp = sys.argv[23]
    hp = sys.argv[24]
    mp = sys.argv[25]
    spell_save = sys.argv[26]
    prof_bonus = sys.argv[27]

    ##What class is it section
    places_for_special1 = ['81,190', '140,190', '140,193', '140,193']

    index_places_special1 = 0
    if template == "./barbarain.png":
        index_places_special1 = 0
    elif template == "./fighter.png":
        index_places_special1 = 1
    elif template == "./rogue.png":
        index_places_special1 = 2
    elif template == "./monk.png":
        index_places_special1 = 3

    max_mp = int(max_mp)
    mp_num =0
    mana_precent =0
    if max_mp != -1:
        mp_num = int(mp)
        mana_precent = str(mp_num/max_mp)
    
    hp_num = int(hp)
    max_hp = int(max_hp)

    health_precent = str(hp_num/max_hp)

    replacements = {
        '215,8':'${name}',
        '215, 36':'${race}', 
        '200,68':'${age}', 
        '295,98': '${prof_bonus}',
        '70,124':'${Str}',
        '70,155': '${Dex}',
        '180,124': '${Con}',
        '180,155': '${Int}',
        '290,124': '${Wis}',
        '290,155': '${Cha}',
        '335, 155': '${speed}ft',
        '143,235': '${hp}',
        #'100,270': '${mp}',
        '50,232': '${ac}',
        '65,272': '${att}',
        '350,190': '${special2}',
        places_for_special1[index_places_special1]: '${special1}',
        '240,273': '${att_dmg}',
        #'210,210': '${mag}',
        '355,68': '${level}',
        #'80,190': '${prof_bonus}',
        #'80,190': '${spell_save}',
    }

    for key, value in replacements.items():
        value = value.replace('${name}', name)
        value = value.replace('${race}', race)
        value = value.replace('${age}', age)
        value = value.replace('${Str}', Str)
        value = value.replace('${Dex}', Dex)
        value = value.replace('${Con}', Con)
        value = value.replace('${Int}', Int)
        value = value.replace('${Wis}', Wis)
        value = value.replace('${Cha}', Cha)
        value = value.replace('${speed}', speed)
        value = value.replace('${level}', level)
        value = value.replace('${special1}', special1)
        value = value.replace('${att}', att)
        value = value.replace('${att_dmg}', att_dmg)
        value = value.replace('${special1}', special1)
        value = value.replace('${special2}', special2)
        #value = value.replace('${mag_att}', mag)
        value = value.replace('${ac}', ac)
        #value = value.replace('${mp}', mp)
        value = value.replace('${prof_bonus}', prof_bonus)
        #value = value.replace('${spell_save}', spell_save)
        value = value.replace('${prof_bonus}', prof_bonus)
        #value = value.replace('${mp_percentage}',health_precent)
        value = value.replace('${hp}', hp)
        #value = value.replace('${hp_percentage}', health_precent)
        replacements[key] = value

    # Handle float conversions separately
    replacements['75,234'] = float(health_precent)
    if max_mp != -1:
        print(max_mp)
        print("yo!")
        #replacements['85,274'] = float(mana_precent)

    generate_image(template, output_file, font_file, int(font_size), replacements)

if __name__ == "__main__":
    main()