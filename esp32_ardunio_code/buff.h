/**
  ******************************************************************************
  * @file    buff.h
  * @author  Waveshare Team
  * @version V1.0.0
  * @date    23-January-2018
  * @brief   ESP8266 WiFi server.
  *          This file provides firmware functions:
  *           + Sending web page of the tool to a client's browser
  *           + Uploading images from client part by part
  *
  ******************************************************************************
  */ 

/* Size, current position index and byte array of the buffer -----------------*/
#define Buff__SIZE 2050
int     Buff__bufInd;
char    Buff__bufArr[Buff__SIZE];

/* Reads a word from the buffer at specified position ------------------------*/
int Buff__getByte(int index)
{
    return Buff__bufArr[index];
}

/* Reads a byte from the buffer at specified position ------------------------*/
int Buff__getWord(int index)
{
    if (index + 1 >= Buff__SIZE) return -1;
    return Buff__bufArr[index] + (Buff__bufArr[index + 1] << 8);
}

/* Reads a byte from the buffer at specified position ------------------------*/
int Buff__getN3(int index)
{
    return (index + 3 > Buff__SIZE) ? 0 :
        (Buff__bufArr[index    ]      ) + 
        (Buff__bufArr[index + 1] <<  8) + 
        (Buff__bufArr[index + 2] << 16);
}

/* Checks if the buffer's data ends with specified string --------------------*/
int Buff__signature(int index, char*str)
{
    // characters of the string to the end of the string
    while (*str != 0)
    {
        // If the correspondent character in the buffer isn't equal
        // to the string's character, return false    
        if (Buff__bufArr[index++] != *str) return false;
        str++;
    }
    
    // Otherwise return true
    return true;
}
