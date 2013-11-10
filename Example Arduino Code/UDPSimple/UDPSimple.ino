#include <SPI.h>         // needed for Arduino versions later than 0018
#include <Ethernet.h>
#include <EthernetUdp.h>         // UDP library from: bjoern@cs.stanford.edu 12/30/2008
#include <LPD8806.h>

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(172,16,101,122);

unsigned int localPort = 8888;      // local port to listen on

// buffers for receiving and sending data
char packetBuffer[UDP_TX_PACKET_MAX_SIZE]; //buffer to hold incoming packet,
char ReplyBuffer[] = "acknowledged";       // a string to send back

// An EthernetUDP instance to let us send and receive packets over UDP
EthernetUDP Udp;

// Number of RGB LEDs in strand:
int nLEDs = 128;

// Chose 2 pins for output; can be any valid output pins:
int dataPin  = 2;
int clockPin = 3;
LPD8806 strip = LPD8806(nLEDs, dataPin, clockPin);

void setup() {
  // start the Ethernet and UDP:
  Ethernet.begin(mac,ip);
  Udp.begin(localPort);
  strip.begin();

  pinMode(13, OUTPUT);
  Serial.begin(9600);
  
  // Update the strip, to start they are all 'off'
  for(int i=0; i < strip.numPixels();i++)
  {
      strip.setPixelColor(i,strip.Color(10,0,0));
  }
  strip.show();
  
}

void loop() {
  // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if(packetSize)
  {
    // read the packet into packetBufffer
    Udp.read(packetBuffer,UDP_TX_PACKET_MAX_SIZE);
    Serial.write(packetBuffer);
        for(int i = 0; i < strip.numPixels(); i++)
         {
           strip.setPixelColor(i,strip.Color(10,0,255));
         } 
         strip.show();
  }
  delay(30);
        for(int i = 0; i < strip.numPixels(); i++)
         {
           strip.setPixelColor(i,strip.Color(10,0,0));
         } 
         strip.show();
}
