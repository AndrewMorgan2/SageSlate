/**
  ******************************************************************************
    @file    Loader.h
    @author  Waveshare Team
    @version V2.0.0
    @date    10-August-2018
    @brief   The main file.
             This file provides firmware functions:
              + Initialization of Serial Port, SPI pins and server
              + Main loop

  ******************************************************************************
*/
#include "BluetoothSerial.h"
#include <string.h>

#define MAX_BYTES 256  // Maximum number of bytes to store

uint8_t receivedBytes[MAX_BYTES];  // Array to store the received bytes
int bytesReceived = 0;  // Counter for the number of bytes received
int totalBytesReceived = 0;
#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;

/* Includes ------------------------------------------------------------------*/
#include "srvr.h" // Server functions

const int BATTERY_PIN = 13;  // Analog pin for Battery
const float MAX_BATTERY_VOLTAGE = 4.2;  // Fully charged Li-Ion voltage
const float MIN_BATTERY_VOLTAGE = 3.0;  // Cutoff voltage
const float VOLTAGE_DIVIDER_RATIO = 2.0;  // Adjust based on your voltage divider

const int expectedHexCount = 12000;
const int bufferSize = 12000; // Enough to hold the whole input string

bool isHexDigit(char c);
uint8_t hexCharToByte(char c);

/* Entry point ----------------------------------------------------------------*/
void setup()
{
  // Serial port initialization
  Serial.begin(115200);
  delay(10);

  // Bluetooth initialization
  //Srvr__btSetup();
  SerialBT.begin("EinkScreen0"); //Bluetooth device name

  // SPI initialization
  EPD_initSPI();

  // Initialization is complete
}
bool helloExecuted = false; // Flag to track if "hello" command has been executed
static byte inputBuffer[bufferSize];
/* The main loop -------------------------------------------------------------*/
//static bool processing = false;
String current_input = "";
int max_message_size = 0;
void loop() {
  if (SerialBT.available() > 0) { 
          /*INIT*/
          // Set EPD_dispIndex to 4.2inch V2
          EPD_dispIndex = 44;
          //processing = true; // Set the flag to true to indicate that the command has been executed

          // // Initialization
          // EPD_dispInit();

          // // Reset the buffer index
          // Buff__bufInd = 0;
          // Srvr__flush();
        /*INIT*/

          //delay(1);

        /*Loading*/
          int doWeKeepGoing = 0; // 0 keep going 1 done and 2 restart
          while(doWeKeepGoing == 0 || doWeKeepGoing == 2){
            doWeKeepGoing = isThereMoreIncomingBytes();
            if (doWeKeepGoing == 2){
              SerialBT.print("retry...");
            } else {
              SerialBT.print("waiting...");
              Serial.println(totalBytesReceived);
            }
            if (doWeKeepGoing == 0 || doWeKeepGoing == 2) {
              while (SerialBT.available() <= 0) {};
            }
          }

        String message = SerialBT.readStringUntil('\n');
        message.trim(); // Remove any whitespace

        Serial.println("Received message: " + message);

        // Check if the message is the trigger to send the total bytes
        if (message == "SEND_TOTAL") {
          // Send the total bytes received
          SerialBT.println(String(totalBytesReceived));
          Serial.println("Sent total bytes: " + String(totalBytesReceived));
        }
        else if (message == "battery?"){
            int rawValue = analogRead(BATTERY_PIN);
            SerialBT.print(rawValue);
            totalBytesReceived = 0;
            return;
        }
          //Local check
          if(totalBytesReceived == 29719){
            Serial.println("Correct");
          }
          Serial.print(totalBytesReceived);

          //Send back number of bytes read
          SerialBT.println(String(totalBytesReceived));

          // for (int value = 0x00; value <= 0xFF; value++) {
          //   EPD_SendData(value);
          //   for(int i = 0; i < 49; i++){
          //     EPD_SendData(0xFF);
          //   }
          // }
          // Get the size of the image buffer
          // int buffer_size = 400 * 300;
          //for (int i = 0; i < 5000; i++) {
            //EPD_SendData(0x02); // Assuming EPD_SendData is available
            //if (i % 100 == 0) 
          //}

          if (EPD_dispLoad != 0) EPD_dispLoad();     

          Buff__bufInd = 0;
          Srvr__flush();
        /*Loading*/

          //delay(1);
        
        /*Next*/

        // Print log message: next data channel

        // Instruction code for for writting data into 
        // e-Paper's memory
        int code = EPD_dispMass[EPD_dispIndex].next;

        // e-Paper '2.7' (index 8) needs inverting of image data bits
        EPD_invert = (EPD_dispIndex == 8);

        // If the instruction code isn't '-1', then...
        if (code != -1)
        {
            // Print log message: instruction code

            // Do the selection of the next data channel
            EPD_SendCommand(code);
            delay(2);
        }

        // Setup the function for loading choosen channel's data
        EPD_dispLoad = EPD_dispMass[EPD_dispIndex].chRd;

        Buff__bufInd = 0;
        Srvr__flush();

        /*Next*/

          //delay(1);
        
        /*show*/
          EPD_dispMass[EPD_dispIndex].show();
                  
          Buff__bufInd = 0;
          Srvr__flush();
        /*show*/

          //processing = false;
          totalBytesReceived = 0;
    }
  
}

bool isHexDigit(char c) {
  return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f');
}

byte hexStringToByte(String& hexString) {
  byte result = 0;
  int len = hexString.length();

  for (int i = 0; i < len; i++) {
    char c = hexString[i];
    byte value = 0;

    if (c >= '0' && c <= '9') {
      value = c - '0';
    } else if (c >= 'A' && c <= 'F') {
      value = c - 'A' + 10;
    } else if (c >= 'a' && c <= 'f') {
      value = c - 'a' + 10;
    } else {
      // Invalid character, skip it
      continue;
    }

    result = (result << 4) | value;
  }

  return result;
}

int isThereMoreIncomingBytes() {
  while (SerialBT.available() > 0){
    while (SerialBT.available() > 0 && bytesReceived < MAX_BYTES) {

      char incomingChar = SerialBT.read();
      if(incomingChar == 'e') return 1;
      if(incomingChar == 's') {
        // Initialization
          EPD_dispInit();

          // Reset the buffer index
          Buff__bufInd = 0;
          Srvr__flush();
          // Reset the counter for the next sequence
          bytesReceived = 0;
          totalBytesReceived = 0;
      } else {
      if(incomingChar == ' ' || incomingChar == '\n') continue;
      if(incomingChar == ','){
          byte incomingByte = hexStringToByte(current_input);
          receivedBytes[bytesReceived++] = incomingByte;
          current_input = "";
          //totalBytesReceived++;
        }
        else {
          current_input += incomingChar;
        }
      }
    }
    Serial.print("Checking:");
    Serial.print(totalBytesReceived);
    Serial.print(" to ");
    Serial.println(bytesReceived);
      if((totalBytesReceived == 0 && bytesReceived ==170) || (bytesReceived == 200) || (bytesReceived == 179 && totalBytesReceived == 29540)){
        // Print the received bytes as an array initialization
        for (int i = 0; i < bytesReceived; i++) {
          EPD_SendData(receivedBytes[i]);
        }
        totalBytesReceived += bytesReceived;
        // Reset the counter for the next sequence
        bytesReceived = 0;
      } else {
        // Reset the counter for the next sequence
        bytesReceived = 0;
        return 2;
      }

  }
  return 0;
}

// float getBatteryPercentage() {
//   int rawValue = analogRead(BATTERY_PIN);
//   SerialBT.print(rawValue);
  
//   // Calculate voltage considering the voltage divider
//   float voltage = (rawValue / 1023.0) * 3.3 * 2.0; // Assuming 3.3V ADC reference
  
//   // Define battery voltage range
//   const float MAX_BATTERY_VOLTAGE = 4.2; // Full charge voltage
//   const float MIN_BATTERY_VOLTAGE = 3.3; // Cut-off voltage, adjust if needed
  
//   float percentage = (voltage - MIN_BATTERY_VOLTAGE) / (MAX_BATTERY_VOLTAGE - MIN_BATTERY_VOLTAGE) * 100;
//   return constrain(percentage, 0, 100);
// }