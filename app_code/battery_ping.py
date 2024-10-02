import serial
import time
import sys
import logging

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <integer>")
        return

    try:
        number_eink_screen = int(sys.argv[1])
    except ValueError:
        print("Please provide a valid integer.")
        return

    logging.basicConfig(filename=f'serial_log_{number_eink_screen}.log', level=logging.INFO, 
                        format='%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    max_attempts = 3
    attempt = 1
    while attempt <= max_attempts:
        print(f"Attempt {attempt}")
        comms = f'/dev/rfcomm{number_eink_screen}'
        try:
            ser = serial.Serial(comms, 115200, timeout=10)
            ser.write(b"ebattery?\n")
            response = ser.readline().decode('utf-8').strip()
            if not response:
                print("Received empty string. Retrying...")
                response = ser.readline().decode('utf-8').strip()
            
            if response:
                print(response)
                logging.info(f"[{number_eink_screen}]: {response}")
                ser.close()
                break
            else:
                print("No valid response received.")
                ser.close()
                attempt += 1
                time.sleep(1)
        except serial.SerialException as e:
            print(f"Error opening serial port: {e}")
            attempt += 1
            time.sleep(1)

    if attempt > max_attempts:
        print("Max attempts reached. Unable to get a valid response.")
        logging.error(f"[{number_eink_screen}]: Max attempts reached. No valid response.")

if __name__ == "__main__":
    main()