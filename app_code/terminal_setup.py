import subprocess
import sys
import os

def spin_terminals(command, num_terminals=5):
    # Check if we're running in GNOME Terminal
    if 'GNOME_TERMINAL_SCREEN' not in os.environ:
        print("This script is designed to work with GNOME Terminal.")
        return
    
    password = 'Mecha/200/'

    # Prepare the command to be run in each terminal
    full_command = f"echo 'echo '{password}' | sudo -S '{command[0]}'; exec bash'"
    
    # Open the first terminal tab
    subprocess.Popen(['gnome-terminal', '--tab', '--', 'bash', '-c', full_command])
    
    # Open additional tabs
    for i in range(num_terminals - 1):
        full_command = f"bash -c '{command[i]}; exec bash'"
        subprocess.Popen(['gnome-terminal', '--tab', '--', 'bash', '-c', full_command])

if __name__ == "__main__":

    mac_adds = ["0C:B8:15:E0:E4:C2", "C8:F0:9E:B4:1C:CE", "0C:B8:15:E2:4B:62","0C:B8:15:D9:B8:AE", "94:B5:55:1A:FF:96"]
    command_example = "sudo rfcomm connect /dev/rfcomm1 C8:F0:9E:B4:1C:CE 1 &"
    command = []
    for i in range(0,5):
        command_in_loop= "rfcomm connect /dev/rfcomm" + str(i) + " " + mac_adds[i] + " 1 &"
        print(command_in_loop)
        command.append(command_in_loop)
    
    #spin_terminals(command, 5)
    print("Consider sudo bluetoothctl then connect mac if fail")
