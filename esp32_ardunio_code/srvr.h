/**
  ******************************************************************************
  * @file    srvr.h
  * @author  Waveshare Team
  * @version V2.0.0
  * @date    10-August-2018
  * @brief   ESP8266 WiFi server.
  *          This fi
  ing web page of the tool to a client's browser
  *           + Uploading images from client part by part
  *
  ******************************************************************************
  */ 

/* Library includes ----------------------------------------------------------*/
#include <BluetoothSerial.h>

bool Srvr__btIsOn;// It's true when bluetooth is on
bool Srvr__btConn;// It's true when bluetooth has connected client 
int  Srvr__msgPos;// Position in buffer from where data is expected
int  Srvr__length;// Length of loaded data

/* Client ---------------------------------------------------------------------*/
BluetoothSerial Srvr__btClient; // Bluetooth client 

/* Avaialble bytes in a stream ------------------------------------------------*/
int Srvr__available()
{
    return Srvr__btIsOn ? Srvr__btClient.available() : false;
}

void Srvr__write(const char*value)
{
    // Write data to bluetooth
    if (Srvr__btIsOn) Srvr__btClient.write((const uint8_t*)value, strlen(value));
}

int Srvr__read()
{
    return Srvr__btIsOn ? Srvr__btClient.read() : -1;
}

void Srvr__flush()
{
    // Clear Bluetooth's stream
    if (Srvr__btIsOn) Srvr__btClient.flush();  
}

/* Project includes ----------------------------------------------------------*/
#include "buff.h"       // POST request data accumulator
#include "epd.h"        // e-Paper driver

bool Srvr__btSetup()                                              
{
    // Name shown in bluetooth device list of App part (PC or smartphone)
    String devName("esp32");

    // Turning on
    Srvr__btIsOn = Srvr__btClient.begin(devName);

    // Show the connection result
    if (Srvr__btIsOn) Serial.println("Bluetooth is on");
    else Serial.println("Bluetooth is off");

    // There is no connection yet
    Srvr__btConn = false;

    // Return the connection result
    return Srvr__btIsOn;
}
bool Srvr_test(){

}
/* The server state observation loop -------------------------------------------*/
bool Srvr__loop() 
{
    // Bluetooh connection checking
    if (!Srvr__btIsOn) return false;

    // Show and update the state if it was changed
    if (Srvr__btConn != Srvr__btClient.hasClient())
    {
        Serial.print("Bluetooth status:");
        Srvr__btConn = !Srvr__btConn;
        if(Srvr__btConn)
            Serial.println("connected"); 
        else
            Serial.println("disconnected"); 
    }

    // Exit if there is no bluetooth connection
    if (!Srvr__btConn) return false; 

    // Waiting the client is ready to send data
    while(!Srvr__btClient.available()) 
    {
        delay(1);
    }

    // Set buffer's index to zero
    // It means the buffer is empty initially
    Buff__bufInd = 0;

    // While the stream of 'client' has some data do...
    while (Srvr__available())
    {
        // Read a character from 'client'
        int q = Srvr__read();

        // Save it in the buffer and increment its index
        Buff__bufArr[Buff__bufInd++] = (byte)q;
    }
    Serial.println();

    // Initialization
    if (Buff__bufArr[0] == 'I')
    {
        Srvr__length = 0;

        // Getting of e-Paper's type
        EPD_dispIndex = Buff__bufArr[1];

        // Print log message: initialization of e-Paper (e-Paper's type)
        Serial.printf("<<<EPD %s", EPD_dispMass[EPD_dispIndex].title);


        // Initialization
        EPD_dispInit();

        Buff__bufInd = 0;
        Srvr__flush();
    }

    // Loading of pixels' data
    else if (Buff__bufArr[0] == 'L')
    {
        // Print log message: image loading
        Serial.print("<<<LOAD");
        int dataSize = Buff__getWord(1);
        Srvr__length += dataSize;
                
        if ((Buff__bufInd < dataSize) || Srvr__length != Buff__getN3(3))
        {
            Buff__bufInd = 0;
            Srvr__flush();

            Serial.print(" - failed!>>>");
            Srvr__write("Error!");
            return true;
        }
       
        // Load data into the e-Paper 
        // if there is loading function for current channel (black or red)
        if (EPD_dispLoad != 0) EPD_dispLoad();     

        Buff__bufInd = 0;
        Srvr__flush();
    }

    // Initialize next channel
    else if (Buff__bufArr[0] == 'N')
    {
        // Print log message: next data channel
        Serial.print("<<<NEXT");

        // Instruction code for for writting data into 
        // e-Paper's memory
        int code = EPD_dispMass[EPD_dispIndex].next;

        // e-Paper '2.7' (index 8) needs inverting of image data bits
        EPD_invert = (EPD_dispIndex == 8);

        // If the instruction code isn't '-1', then...
        if (code != -1)
        {
            // Print log message: instruction code
            Serial.printf(" %d", code);

            // Do the selection of the next data channel
            EPD_SendCommand(code);
            delay(2);
        }

        // Setup the function for loading choosen channel's data
        EPD_dispLoad = EPD_dispMass[EPD_dispIndex].chRd;

        Buff__bufInd = 0;
        Srvr__flush();
    }

    // Show loaded picture
    else if (Buff__bufArr[0] == 'S')
    {
        EPD_dispMass[EPD_dispIndex].show();
                
        Buff__bufInd = 0;
        Srvr__flush();

        //Print log message: show
        Serial.print("<<<SHOW");
    }

    // Send message "Ok!" to continue
    Srvr__write("Ok!");
    delay(1);

    // Print log message: the end of request processing
    Serial.print(">>>");
    return true;
}
