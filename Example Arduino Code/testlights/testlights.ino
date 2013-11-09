#include <LPD8806.h>

#include <SPI.h>

// Number of RGB LEDs in strand:
int nLEDs = 42;

// Chose 2 pins for output; can be any valid output pins:
int dataPin  = 2;
int clockPin = 3;
LPD8806 strip = LPD8806(nLEDs, dataPin, clockPin);

int led_iterator;

void setup() {
   strip.begin();
   led_iterator   = 0;

   // Update the strip, to start they are all 'off'
   for(int i=0; i < strip.numPixels();i++)
   {
       strip.setPixelColor(i,strip.Color(0,0,0));
   }
   strip.show();
}

void loop() {
  for(int i = 0; i < strip.numPixels(); i++)
  {
    strip.setPixelColor(i,strip.Color(12,0,0));
  }
  strip.show();
  delay(40);
  if (led_iterator > strip.numPixels()) 
    led_iterator = 0;
  else
    led_iterator++;
}
