import sys
from PIL import Image

import serial
import time

import subprocess
import os
from datetime import datetime

def setup_logger(log_file='app.log'):
    # Clear the log file at the start of the program
    with open(log_file, 'w') as f:
        f.write(f"Log started at {datetime.now()}\n")
    
    def log(message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        
        # Print to console
        #print(log_message)
        
        # Append to log file
        with open(log_file, 'a') as f:
            f.write(log_message + '\n')
    
    return log

def send_file_to_arduino(file_path, com_port, baud_rate, chunk_size=600):
    log = setup_logger("comms.log")
    """
    Send the content of a text file to an Arduino board over a serial connection in chunks.

    Args:
        file_path (str): The path to the text file.
        com_port (str): The serial port the Arduino is connected to (e.g., 'COM3', '/dev/ttyUSB0').
        baud_rate (int): The baud rate for the serial connection (e.g., 115200).
        chunk_size (int): The maximum size of each chunk in characters (default: 600).
    """
    try:
        # Open the serial connection
        ser = serial.Serial(com_port, baud_rate)
        time.sleep(2)  # Wait for the serial connection to be established

        with open(file_path, 'r') as file:
            content = file.read()
            chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
            
            i = 0
            while i < len(chunks):
                chunk = chunks[i]
                if not chunk.strip():  # Skip empty chunks
                    i += 1
                    continue
                
                ser.write(chunk.encode())  # Send the chunk to the Arduino
                log(f"Sent chunk {i+1}/{len(chunks)}")
                retry_count = 0
                max_retries = 5
                retry = False
                while True:
                    if ser.in_waiting > 0:
                        input_data = ser.read(ser.in_waiting).decode('utf-8', errors='replace')
                        if "waiting..." in input_data:
                            i += 1  # Move to the next chunk
                            retry_count = 0  # Reset retry count on success
                            log(f"Success at chunk: {i}")
                            break
                        elif "retry..." in input_data:
                            retry_count += 1
                            if retry_count > 5:
                                log(f"Max retries reached for chunk {i+1}. Moving to next chunk.")
                                i += 1
                                retry_count = 0
                            else:
                                log(f"Retrying chunk {i+1}/{len(chunks)} (Attempt {retry_count}/{max_retries})")
                            retry = True
                            break
                    else:
                        time.sleep(0.1)

        print(f"File '{file_path}' sent to the Arduino successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

def main():
    log = setup_logger()
    mac_adds = ["0C:B8:15:E0:E4:C2", "C8:F0:9E:B4:1C:CE", "0C:B8:15:E2:4B:62","0C:B8:15:D9:B8:AE", "94:B5:55:1A:FF:96"]
    # Check if the correct number of arguments is provided
    if len(sys.argv) != 3:
        log("Usage: path_to_image nubme_eink_screen")
        sys.exit(1)

    # Get the command-line arguments
    path_to_image = sys.argv[1]
    number_eink_screen = sys.argv[2]

    # Load the image
    img = Image.open(path_to_image)

    # Convert the image to grayscale
    img = img.convert("L")

    # Get the size of the original image
    width, height = img.size

    # Create a binary array to store the pixel values
    binary_array = []

    # Iterate over the pixels and convert them to binary values
    for y in range(height):
        #row = []
        for x in range(width):
            pixel = img.getpixel((x, y))
            if pixel > 128:
                binary_array.append(1)
            else:
                binary_array.append(0)
        #binary_array.append(row)

    ##log(len(binary_array))
    # Convert the binary array to an array of bytes
    byte_array = []
    for i in range(0, len(binary_array), 8):
        byte = 0
        for j in range(8):
            if i + j < len(binary_array):
                byte = (byte << 1) | binary_array[i + j]
        byte_array.append(byte)

    byte_array = byte_array[21:]
    # Convert the byte array to a string with comma-separated values
    byte_string = 's' + ','.join(f'{byte:02X}' for byte in byte_array) + 'e'

    log(len(byte_string))  # Output: (300, 400)
    with open("image_bytes.txt", 'w') as file:
                file.write(byte_string)

    comms = '/dev/rfcomm' + number_eink_screen
    print(comms)
    
    max_attempts = 3
    attempt = 1
    
    while attempt <= max_attempts:
        log(f"Attempt {attempt}")
        send_file_to_arduino('./image_bytes.txt', comms, 115200)
        
        # Wait for response
        ser = serial.Serial(comms, 115200, timeout=10)
        ser.write(b"SEND_TOTAL\n")
        log("Sent SEND_TOTAL command, we want 14770 (magic number)")

        response = ser.readline().decode('utf-8').strip()

        response = response.replace("waiting...", "").strip()

        log(response)

        if not response:
            log("Received empty string. Retrying...")
            response = ser.readline().decode('utf-8').strip()
            log(response)
            ser.close()
            attempt += 1
            time.sleep(1)
            continue

        log(f"Received response: {response}")
        
        ##29719 is the correct number of bits, change for screens that arent 4.2_v2?
        #SRY for magic number
        if response == "14770":
            log("Correct response received. Exiting.")
            ser.close()
            break
        else:
            log(f"Incorrect response. Retrying...")
            attempt += 1
            ser.close()
            time.sleep(2)  # Wait before retrying
    
    if attempt > max_attempts:
        log(f"Max attempts ({max_attempts}) reached. Exiting.")


if __name__ == "__main__":
    main()