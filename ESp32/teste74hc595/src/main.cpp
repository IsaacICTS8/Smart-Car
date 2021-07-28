#include <WiFi.h> 
#include <Arduino.h>
#include <HTTPClient.h>
#include "ArduinoJson.h"

const char* ssid = "daikin25";           
const char* password = "daikin123"; 

char json[400] = {0};

StaticJsonDocument<256> doc;
long int  leds = 0;



// for Arduino Microcontrollers
//int latchPin_SIPO = 5;
//int clockPin_SIPO = 7;
//int dataPin_SIPO = 6;

// for ESP8266 Microcontrollers
//int latchPin_SIPO = D2;
//int clockPin_SIPO = D0;
//int dataPin_SIPO = D1;

// for ESP32 Microcontrollers
int latchPin_SIPO = 21;
int clockPin_SIPO = 23;
int dataPin_SIPO = 22;
 

void updateShiftRegister();
void resultOfGet(String msg);
void check_leds(const char* valor, int pos);
#define  LED_PIN 2

void setup() 
{
  pinMode(LED_PIN, OUTPUT);
  pinMode(latchPin_SIPO, OUTPUT);
  pinMode(dataPin_SIPO, OUTPUT);  
  pinMode(clockPin_SIPO, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(9600);
  Serial.println();

  WiFi.begin(ssid, password);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());
  digitalWrite(LED_PIN, HIGH);
  const size_t capacity = JSON_OBJECT_SIZE(1) + JSON_ARRAY_SIZE(8) + 146;
  DynamicJsonDocument doc(capacity);
  Serial.println("Iniciando Conexão com servidor");
  
}


void loop() 
{
 

if ((WiFi.status() == WL_CONNECTED)) { //Verifica o status da conexão
 
    HTTPClient http;
 
    http.begin("http://192.168.1.168/api"); // IP do servidor
    int httpCode = http.GET();              // Faz a requisição
 
    if (httpCode > 0) { //verifica código de retorno
 
        String payload = http.getString();
        //Serial.println(httpCode);
        //Serial.println(payload);
        resultOfGet(payload);
        updateShiftRegister();
      }
 
    else {
      Serial.println("Error on HTTP request");
    }
 
    http.end(); 
  }

  
  leds = 0;
  
  delay(10000);
 
}
 
void updateShiftRegister()
{  // Atualiza as saídas do 74HC595
   digitalWrite(latchPin_SIPO, LOW);
   shiftOut(dataPin_SIPO, clockPin_SIPO, MSBFIRST, leds);
   shiftOut(dataPin_SIPO,  clockPin_SIPO, MSBFIRST, (leds >> 8));
   digitalWrite(latchPin_SIPO, HIGH);
}


void resultOfGet(String msg)
  { //Trata os dados para formato Json
    memset(json,0,sizeof(json));
    msg.toCharArray(json, 800);
    deserializeJson(doc, json);

    JsonObject data = doc["data"];
    const char* data_1 = data["p1"];
    const char* data_2 = data["p2"]; 
    const char* data_3 = data["p3"];
    const char* data_4 = data["p4"]; 
    const char* data_5 = data["p5"];
    const char* data_6 = data["p6"]; 
    const char* data_7 = data["p7"];
    const char* data_8 = data["p8"]; 
    const char* data_9 = data["p9"];
    const char* data_10 = data["p10"]; 
    const char* data_11 = data["p11"];
    const char* data_12 = data["p12"]; 
    const char* data_13 = data["p13"];
    const char* data_14 = data["p14"]; 
    const char* data_15 = data["p15"];
    const char* data_16 = data["p16"]; 
    
    check_leds(data_1, 0);
    check_leds(data_2, 1);
    check_leds(data_3, 2);
    check_leds(data_4, 3);
    check_leds(data_5, 4);
    check_leds(data_6, 5);
    check_leds(data_7, 6);
    check_leds(data_8, 7);
    check_leds(data_9, 8);
    check_leds(data_10, 9);
    check_leds(data_11, 10);
    check_leds(data_12, 11);
    check_leds(data_13, 12);
    check_leds(data_14, 13);
    check_leds(data_15, 14);
    check_leds(data_16, 15); 

}

void check_leds(const char* valor, int pos)
{  // Verifica se o led é para acender ou não
   String re = String(valor);
   if (re == "1"){
    bitSet(leds,pos);
    }
    if (re == "0"){
    bitClear(leds,pos);
    }
}