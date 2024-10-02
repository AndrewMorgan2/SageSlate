import subprocess
import time

def run_serial_script(number):
    if number == 2:
        print(f"Skipping {number}")
        return
    print(f"Running script for number {number}")
    subprocess.run(["python3", "battery_ping.py", str(number)])

def run_all_scripts():
    for i in range(5):  # 0 to 4
        run_serial_script(i)

def main():
    start_time = time.time()
    end_time = start_time + 3600  # 3600 seconds = 1 hour

    while time.time() < end_time:
        run_all_scripts()
        
        # Calculate time to sleep
        next_run = time.time() + 120  # 120 seconds = 2 minutes
        sleep_time = next_run - time.time()
        
        # Make sure we don't sleep past the end time
        if time.time() + sleep_time > end_time:
            sleep_time = end_time - time.time()
        
        if sleep_time > 0:
            print(f"Sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)

if __name__ == "__main__":
    main()