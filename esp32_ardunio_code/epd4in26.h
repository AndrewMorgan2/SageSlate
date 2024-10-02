/**
  ******************************************************************************
  * @file    edp4in26.h
  * @author  Waveshare Team
  * @version V1.0.0
  * @date    2024-03-07
  * @brief   This file describes initialisation of 13.3k e-Papers
  *
  ******************************************************************************
  */

int EPD_4in26_init() 
{
    EPD_Reset();
    EPD_WaitUntilIdle_high();

    EPD_SendCommand(0x12);
    EPD_WaitUntilIdle_high();

    EPD_SendCommand(0x0C);
    EPD_SendData(0xAE);
    EPD_SendData(0xC7);  
    EPD_SendData(0xC3);
    EPD_SendData(0xC0);
    EPD_SendData(0x80);

    EPD_SendCommand(0x01); 
    EPD_SendData(0xDF);
    EPD_SendData(0x01);  
    EPD_SendData(0x02);

    EPD_SendCommand(0x11);
    EPD_SendData(0x01);

    EPD_SendCommand(0x44);
    EPD_SendData(0x00);
    EPD_SendData(0x00);
    EPD_SendData(0x1F);
    EPD_SendData(0x03); 

    EPD_SendCommand(0x45); 
    EPD_SendData(0xDF);
    EPD_SendData(0x01);   
    EPD_SendData(0x00);
    EPD_SendData(0x00);

    EPD_SendCommand(0x3C);
    EPD_SendData(0x01);

    EPD_SendCommand(0x18);
    EPD_SendData(0x80);

    EPD_SendCommand(0x4E);
    EPD_SendData(0x00);
    EPD_SendData(0x00);

    EPD_SendCommand(0x4F);
    EPD_SendData(0x00);
    EPD_SendData(0x00);

    EPD_SendCommand(0x24);
    return 0;
}


void EPD_4in26_Show(void)
{
    EPD_SendCommand(0x22);
	EPD_SendData(0xF7);
    EPD_SendCommand(0x20);
    EPD_WaitUntilIdle_high();


    EPD_SendCommand(0x10); // DEEP_SLEEP
    EPD_SendData(0x01);
}
















