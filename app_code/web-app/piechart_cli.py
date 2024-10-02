import sys
import os
import shutil
import matplotlib.pyplot as plt
from datetime import datetime

PIECHART_DIRECTORY = '/home/jp19050/Github/TTRPG/DnD_Images/Multiple_Images/piechart'

def create_piechart(values, labels, filename):
    fig, ax = plt.subplots()
    ax.pie(values, labels=labels, autopct='%1.1f%%')
    ax.axis('equal')  # Equal aspect ratio ensures the pie chart is circular.
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Pie chart saved to {filename}")

def get_next_filename():
    current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    return os.path.join(PIECHART_DIRECTORY, f"piechart_{current_time}.png")

def save_piechart(values, labels):
    filename = get_next_filename()
    create_piechart(values, labels, filename)
    folder_name = os.path.splitext(filename)[0]  # Remove the .png extension
    os.makedirs(folder_name, exist_ok=True)
    shutil.move(filename, folder_name)
    print(f"Pie chart moved {filename} to {folder_name}")

if __name__ == "__main__":
    if len(sys.argv) < 3 or len(sys.argv) % 2 != 1:
        print(f"Usage: {sys.argv[0]} <value1> <label1> <value2> <label2> ...")
        sys.exit(1)

    values = []
    labels = []
    for i in range(1, len(sys.argv), 2):
        values.append(float(sys.argv[i]))
        labels.append(sys.argv[i+1])

    save_piechart(values, labels)