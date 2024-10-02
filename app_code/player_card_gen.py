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
            draw.text((x-1, y-1), str(value), font=font, fill="black")
            draw.text((x+1, y-1), str(value), font=font, fill="black")
            draw.text((x-1, y+1), str(value), font=font, fill="black")
            draw.text((x+1, y+1), str(value), font=font, fill="black")

            # Draw white text on top of the black text to create a stroke effect
            draw.text((x, y), str(value), font=font, fill="white")
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
    #python3 player_card_gen.py ./template.png ./output.jpg ./arial.ttf 24 Thorin Dwarf 150 "+3 +2" "+2 +1" "+4 +2" "+1 +0" "+2 +1" "+0 -1" 25 +3 +2 +5 "1d8+3" +4 "1d6+1" 4 +2 30 0.5 45 0.75
    # Check if the correct number of arguments is provided
    if len(sys.argv) != 26:
        print("Usage: needs more or less args 26 is needed, recieved", len(sys.argv))
        sys.exit(1)

    # Get the command-line arguments
    font_file = sys.argv[1]
    font_size = sys.argv[2]
    template = sys.argv[3]
    output_file = sys.argv[4]
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
    pass_perception = sys.argv[15]
    pass_insight = sys.argv[16]
    att = sys.argv[17]
    att_dmg = sys.argv[18]
    mag_att = sys.argv[19]
    mag_dmg = sys.argv[20]
    ac = sys.argv[21]
    max_hp = sys.argv[22]
    max_mp = sys.argv[23]
    hp = sys.argv[24]
    mp = sys.argv[25]

    mp_num = int(mp)
    max_mp = int(max_mp)
    hp_num = int(hp)
    max_hp = int(max_hp)

    health_precent = str(hp_num/max_hp)
    mana_precent = str(mp_num/max_mp)


    replacements = {
        '5,15': '${name}, ${race}, ${age}',  # Name
        '10,55': 'Str:',
        '70,55':'${Str}',
        '10,85': 'Dex:',
        '70,85': '${Dex}',
        '10,115': 'Con:',
        '70,115': '${Con}',
        '160,55': 'Int:',
        '220,55': '${Int}',
        '160,85': 'Wis:',
        '220,85': '${Wis}',
        '160,115': 'Cha:',
        '220,115': '${Cha}',
        '295, 75': 'Speed:',
        '305, 105': '${speed}ft',
        '100,240': 'HP:${hp}',
        '85,244': '${hp_percentage}',
        '100,270': 'MP:${mp}',
        '85,274': '${hp_percentage}',
        '10,255': 'AC:${ac}',
        #'10,240': 'AP:${ap}',
        '70,180': 'Atk:${att}',
        '70,210': 'Spell Atk:${mag_att}',
        '210,180': 'Damage:${att_dmg}',
        '210,210': 'Damage:${mag_dmg}',
        '10,145': 'Pass Insight: ${pass_insight}',
        '200,145': 'Pass Percep: ${pass_perception}',
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
        value = value.replace('${pass_perception}', pass_perception)
        value = value.replace('${pass_insight}', pass_insight)
        value = value.replace('${att}', att)
        value = value.replace('${att_dmg}', att_dmg)
        value = value.replace('${mag_att}', mag_att)
        value = value.replace('${mag_dmg}', mag_dmg)
        #value = value.replace('${ap}', ap)
        value = value.replace('${ac}', ac)
        value = value.replace('${mp}', mp)
        value = value.replace('${mp_percentage}',health_precent)
        value = value.replace('${hp}', hp)
        value = value.replace('${hp_percentage}', mana_precent)
        replacements[key] = value

    # Handle float conversions separately
    replacements['85,244'] = float(health_precent)
    replacements['85,274'] = float(mana_precent)

    generate_image(template, output_file, font_file, int(font_size), replacements)

if __name__ == "__main__":
    main()