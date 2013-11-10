#include <SPI.h>         // needed for Arduino versions later than 0018
#include <Ethernet.h>
#include <EthernetUdp.h>         // UDP library from: bjoern@cs.stanford.edu 12/30/2008
#include <LPD8806.h>

#define IDLE 0
#define BEAT 1

#define RED 0
#define BLUE 1

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

int light_state = BLUE;
int led_iterator = 0;

void setup() {
  // start the Ethernet and UDP:
  Ethernet.begin(mac,ip);
  Udp.begin(localPort);
  strip.begin();

  Serial.begin(9600);
  // Update the strip, to start they are all 'off'
  for(int i=0; i < strip.numPixels();i++)
  {
      strip.setPixelColor(i,strip.Color(10,0,0));
  }
  strip.show();
  
}

void setLED(int led_iterator, int led_state) {
    switch( light_state ) {
      Serial.write(light_state);
      case RED:
        RedFlash(led_iterator, led_state);
        break;
      case BLUE:
        BlueFlash(led_iterator, led_state);
        break;
      default:
        break;
    }
}

void loop() {
  // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if(packetSize)
  {
    // read the packet into packetBufffer
    Udp.read(packetBuffer,UDP_TX_PACKET_MAX_SIZE);
    String bufferInfo = String(packetBuffer);
    if (bufferInfo.indexOf("VERSE") != -1) {
      light_state = BLUE;
    } else if (bufferInfo.indexOf("DROP") != -1) {
      light_state = RED;
    }
    
    setLED(led_iterator, BEAT);
  }
  delay(10);
  setLED(led_iterator, IDLE);
  if (led_iterator < nLEDs) {
    led_iterator++;
  } else {
    led_iterator = 0;
  }
}

/////////////////////////////// Light Functions
void RedFlash(int ledIterator, int state) {
  if (state == BEAT) {
    for(int i = 0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i,strip.Color(10,255,10));
    } 
    strip.show();    
  } else if (state == IDLE) {
    for(int i = 0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i,strip.Color(ledIterator,0,255-ledIterator));
    } 
    strip.show();      
  }
}

void BlueFlash(int ledIterator, int state) {
  if (state == BEAT) {
    for(int i = 0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i,strip.Color(0,25,10));
    } 
    strip.show();    
  } else if (state == IDLE) {
    for(int i = 0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i,strip.Color(10,0,0));
    } 
    strip.setPixelColor(ledIterator,strip.Color(0,0,25));
    strip.show();      
  }
}
