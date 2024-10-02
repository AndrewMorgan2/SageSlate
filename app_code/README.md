## SageSlate
SageSlate Eink display used for TTRPGs, along with a custom battle tracker. This project is still actively being developed

![SageSlate Diagram](./images/sageslate-diagram.png)

### Overview
SageSlate consists of two main components:

- Hardware: Custom e-ink displays designed for low power consumption and high readability.
- Software: A Linux-based control system that manages the e-ink displays remotely via Bluetooth.

The core concept of SageSlate is to provide a seamless, wireless way to control and update e-ink displays from a Linux machine. 

## Getting Started
You'll need a system with:
- linux, I have no intension of making a windows implementation (other are of course welcome to make a banch for that)
- Bluetooth
### Per Display
- 4.2 inch E-ink display (I used https://www.amazon.co.uk/dp/B074NR1SW2?ref=ppx_yo2ov_dt_b_fed_asin_title)
- ESP32 with some way form of e-Paper Driver Board (I used https://www.amazon.co.uk/dp/B07M5CNP3B?ref=ppx_yo2ov_dt_b_fed_asin_title)
- 3.7v Batteries (I use two of these https://www.amazon.co.uk/dp/B08FD3V6TF?ref=ppx_yo2ov_dt_b_fed_asin_title)
- USB charger (only if you want it to be rechangable) (I used https://www.amazon.co.uk/dp/B09Q838ZML?ref=ppx_yo2ov_dt_b_fed_asin_title)
- Some wire (recommend multi-thread as some of the wire need to bend quite a lot)
- Access to a 3D printer

## Making the displays
Print the files found in stls
- 2 x stands
- 1 x lid
- 1 x body

Place elements as seen below, the screen will then sit ontop of the 
![SageSlate Diagram](./images/electronics.JPG)

Upload the code found in esp32 code folder, remeber to change the name of the Eink display to what ever number you'd like (eg EinkScreen0, EinkScreen1, EinkScreen2 etc)

Now we're ready to get the software going!

## Loading the software
Drop into the Linux CLI and navigate to the app code folder, once inside run `npm install` then `npm start` this should bring up the electron app. Alturnatively you can navigate to the wep app code folder and do the same, this will allow you to access the control app though the broswer. 

Linking the ESP32 to a serial port via bluetooth can be pretty annoying so this step can take time, this is my condensed instructions (from https://medium.com/@18218004/devlog-6-bluetooth-and-esp32-ba076a8e207d)

``sudo bluetoothctl
[bluetooth]# power on
[bluetooth]# agent on
[bluetooth]# scan on
``
Look out for the name of the ESP32, once you find it take it's mac address. We're gonna tell our machine that we trust this device.
``pair 24:6F:28:17:2D:4A``
Then it will promt you asking if the digits are the same on your ESP32, now we have no way of seeing this but we can just say yes. Now that they are paired lets make them trust
``trust 24:6F:28:17:2D:4A``
This sould allow us to spawn terminals that use start up a serial port between us and the ESP32

On the app naviagate to the character sheet tab, now press the button that correlates to the number eink screen that you names the ESP32. A terminal should pop up and tell you that you can "Ctrl-C to hang up" this means we have a serial port connection!

Now we can use the device, so let's try to send a image!

## Custom Battlemaps

