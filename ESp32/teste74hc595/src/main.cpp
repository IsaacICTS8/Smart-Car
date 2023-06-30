#include <WiFi.h> 
#include <Arduino.h>
#include <HTTPClient.h>
#include "ArduinoJson.h"

#define  LED_PIN 2

// for ESP32 Microcontrollers
#define latchPin_SIPO 17
#define clockPin_SIPO 19


#define dataPin_SIPO1 23
#define dataPin_SIPO2 22
#define dataPin_SIPO3 21
#define dataPin_SIPO4 27
#define dataPin_SIPO5 26
#define dataPin_SIPO6 25

int dataPin_En = 16; // Alteração de Código
int dataPin_outclk = 32; // Alteração de Código

//const char* ssid = "Tau Ceti";           
//const char* password = "dt151218"; 

const char* ssid ="carrinho";           
const char* password = "daikin123"; 

char json[400] = {0};
char json1[4800] = {0};
StaticJsonDocument<256> doc;
StaticJsonDocument<1600> doc1;

long int  leds = 0,leds_ant=0,leds_inv=0,leds_dir=0;
int pisca = 0,controle_led=0;
int entra_mode2 = 0;

// Variaveis do temporizador
unsigned long previousMillis = 0;
unsigned int period = 500; //2000 ms = 2s

byte data;
//byte ledArray[10];
const int ShiftRegNum = 10;
const int FloorNum = 6;

byte ledMatrix [FloorNum][ShiftRegNum];
byte ledMatrix_resp [FloorNum][ShiftRegNum];

byte ledArray_1[10];
byte ledArray_2[10];
byte ledArray_3[10];
byte ledArray_4[10];
byte ledArray_5[10];
byte ledArray_6[10];

int carrinho,prateleira,id_LED,command,modo,atualiza_carrinho = 0;


enum Commands{
  Apaga,
  Acende,
  InitPisca,
  EndPisca
};

typedef struct{
    int id_carrinho;
    int id_prateleira;
    int id_LED;
    enum Commands command;
    int id_mode;
}PacketStruct; 

typedef struct{
    int andar_00;
    int andar_01;
    int andar_02;
    int andar_03;
    int andar_04;
    int andar_05;
    int andar_06;
    int andar_07;
    int andar_08;
    int andar_09;
    int andar_10;
    int andar_11;
    int andar_12;
    int andar_13;
    int andar_14;
    int andar_15;
    int andar_16;
    int andar_17;
    int andar_18;
    int andar_19;
    int andar_20;
    int andar_21;
    int andar_22;
    int andar_23;
    int andar_24;
    int andar_25;
    int andar_26;
    int andar_27;
    int andar_28;
    int andar_29;
    int andar_30;
    int andar_31;
    int andar_32;
    int andar_33;
    int andar_34;
    int andar_35;
    int andar_36;
    int andar_37;
    int andar_38;
    int andar_39;
    int andar_40;
    int andar_41;
    int andar_42;
    int andar_43;
    int andar_44;
    int andar_45;
    int andar_46;
    int andar_47;
    int andar_48;
    int andar_49;
     int andar_50;
    int andar_51;
    int andar_52;
    int andar_53;
    int andar_54;
    int andar_55;
    int andar_56;
    int andar_57;
    int andar_58;
    int andar_59;
 
}PacketMem; 


// Declaration
PacketMem    Memoria;
PacketStruct IncomingCommand;
PacketStruct commandArray[40];
PacketStruct* ptr_commandAdd = commandArray;
PacketStruct* ptr_commandAct = commandArray;
bool newCommand = false;


enum States{
  WaitState,
  InitState,
  LedOnState,
  LedOffState,
  BlinkOnState,
  BlinkOffState
};
enum States state = InitState;

PacketMem resultOfGet1(String msg);
PacketStruct resultOfGet(String msg);
void updateShiftRegister(byte ledMatrix[FloorNum][ShiftRegNum]);
void multiShiftOut(int clockPin, int dataPin1, int dataPin2, int dataPin3, int dataPin4, int dataPin5, int dataPin6, byte led1, byte led2, byte led3, byte led4, byte led5, byte led6);
void SetLed(int led, int floor);
void SetAllLed();
void ClearLed(int led, int floor);
void ClearAllLed();
void Conexao();

void setup() 
{
  pinMode(LED_PIN, OUTPUT);
  pinMode(latchPin_SIPO, OUTPUT);
  pinMode(dataPin_SIPO1, OUTPUT);
  pinMode(dataPin_SIPO2, OUTPUT);
  pinMode(dataPin_SIPO3, OUTPUT);
  pinMode(dataPin_SIPO4, OUTPUT);
  pinMode(dataPin_SIPO5, OUTPUT);
  pinMode(dataPin_SIPO6, OUTPUT);
  pinMode(clockPin_SIPO, OUTPUT);

   pinMode(dataPin_En,OUTPUT);    // Alteração de Código
  pinMode(dataPin_outclk,OUTPUT); // Alteração de Código
  digitalWrite(LED_PIN, LOW);     // Alteração de Código
  digitalWrite(dataPin_En, LOW);  // Alteração de Código

  digitalWrite(dataPin_outclk,HIGH); 

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
  delay(500); 
  state = InitState;
}
void Consulta()
{
  if ((WiFi.status() == WL_CONNECTED)) { //Verifica o status da conexão
          HTTPClient http;
          http.begin("http://192.168.1.2/consulta/C001"); // IP do servidor
          int httpCode = http.GET();              // Faz a requisição
          if (httpCode > 0) { //verifica código de retorno
            String load = http.getString();

              if(sizeof(load) > 0) {
               
                http.end();
               
                }
          }
   }
                

}

void Conexao()
{
  if ((WiFi.status() == WL_CONNECTED)) { //Verifica o status da conexão
          HTTPClient http;
          http.begin("http://192.168.1.2/connect"); // IP do servidor
          int httpCode = http.GET();              // Faz a requisição
          if (httpCode > 0) { //verifica código de retorno
            String load = http.getString();

              if(sizeof(load) > 0) {
                Memoria = resultOfGet1(load);
                http.end();
                
                ledMatrix[0][9] = Memoria.andar_09;
                ledMatrix[0][8] = Memoria.andar_08;
                ledMatrix[0][7] = Memoria.andar_07;
                ledMatrix[0][6] = Memoria.andar_06;
                ledMatrix[0][5] = Memoria.andar_05;
                ledMatrix[0][4] = Memoria.andar_04;
                ledMatrix[0][3] = Memoria.andar_03;
                ledMatrix[0][2] = Memoria.andar_02;
                ledMatrix[0][1] = Memoria.andar_01;
                ledMatrix[0][0] = Memoria.andar_00;
                
                ledMatrix[1][9] = Memoria.andar_19;
                ledMatrix[1][8] = Memoria.andar_18;
                ledMatrix[1][7] = Memoria.andar_17;
                ledMatrix[1][6] = Memoria.andar_16;
                ledMatrix[1][5] = Memoria.andar_15;
                ledMatrix[1][4] = Memoria.andar_14;
                ledMatrix[1][3] = Memoria.andar_13;
                ledMatrix[1][2] = Memoria.andar_12;
                ledMatrix[1][1] = Memoria.andar_11;
                ledMatrix[1][0] = Memoria.andar_10;

                
                ledMatrix[2][9] = Memoria.andar_29;
                ledMatrix[2][8] = Memoria.andar_28;
                ledMatrix[2][7] = Memoria.andar_27;
                ledMatrix[2][6] = Memoria.andar_26;
                ledMatrix[2][5] = Memoria.andar_25;
                ledMatrix[2][4] = Memoria.andar_24;
                ledMatrix[2][3] = Memoria.andar_23;
                ledMatrix[2][2] = Memoria.andar_22;
                ledMatrix[2][1] = Memoria.andar_21;
                ledMatrix[2][0] = Memoria.andar_20;

                ledMatrix[3][9] = Memoria.andar_39;
                ledMatrix[3][8] = Memoria.andar_38;
                ledMatrix[3][7] = Memoria.andar_37;
                ledMatrix[3][6] = Memoria.andar_36;
                ledMatrix[3][5] = Memoria.andar_35;
                ledMatrix[3][4] = Memoria.andar_34;
                ledMatrix[3][3] = Memoria.andar_33;
                ledMatrix[3][2] = Memoria.andar_32;
                ledMatrix[3][1] = Memoria.andar_31;
                ledMatrix[3][0] = Memoria.andar_30;

                ledMatrix[4][9] = Memoria.andar_49;
                ledMatrix[4][8] = Memoria.andar_48;
                ledMatrix[4][7] = Memoria.andar_47;
                ledMatrix[4][6] = Memoria.andar_46;
                ledMatrix[4][5] = Memoria.andar_45;
                ledMatrix[4][4] = Memoria.andar_44;
                ledMatrix[4][3] = Memoria.andar_43;
                ledMatrix[4][2] = Memoria.andar_42;
                ledMatrix[4][1] = Memoria.andar_41;
                ledMatrix[4][0] = Memoria.andar_40;

                ledMatrix[5][9] = Memoria.andar_59;
                ledMatrix[5][8] = Memoria.andar_58;
                ledMatrix[5][7] = Memoria.andar_57;
                ledMatrix[5][6] = Memoria.andar_56;
                ledMatrix[5][5] = Memoria.andar_55;
                ledMatrix[5][4] = Memoria.andar_54;
                ledMatrix[5][3] = Memoria.andar_53;
                ledMatrix[5][2] = Memoria.andar_52;
                ledMatrix[5][1] = Memoria.andar_51;
                ledMatrix[5][0] = Memoria.andar_50;

                updateShiftRegister(ledMatrix);
                }
          }
   }
                

}

void loop() 
{
   
  //state = WaitState;
  switch (state)
  {
    case (InitState):
    {
      for( int cont=0; cont < 2;cont++)
      {
      SetAllLed();
      updateShiftRegister(ledMatrix);
      delay(500);
      ClearAllLed();
      updateShiftRegister(ledMatrix);
       delay(500);  
      }
      SetAllLed();
      updateShiftRegister(ledMatrix);
      Serial.println("Iniciou");
       
      /* while(1){
          Serial.println("teste");
          SetAllLed();
          updateShiftRegister(ledMatrix);
           delay(1000);
         
      }*/
      Consulta();
      Conexao();
      state = WaitState;
    }
    break;

    case (WaitState):
    {
      //Serial.println(".");
      //ledMatrix[0][0] = 15;
      //2[1][0] = 15;
      //ledMatrix[2][0] = 15;
      //ledMatrix[3][0] = 15;
      //ledMatrix[4][0] = 15;
      
            
     /// Serial.println(ledMatrix[3][0]);
      updateShiftRegister(ledMatrix);
       unsigned long currentMillis = millis(); 
      if (currentMillis - previousMillis > period) { // interval passed?
        previousMillis = currentMillis; // save the last time
        ///Serial.println("Connect");
        if((IncomingCommand.id_mode == 2)&&(entra_mode2 == 0)){ // Modo de Producao
                Serial.println("Entrou no Modo 2.");
                 Consulta();
                  Conexao();
                  entra_mode2 = 1;
                  //IncomingCommand.id_mode = 0;
                 // break;  
                }
        if ((WiFi.status() == WL_CONNECTED)) 
        { //Verifica o status da conexão
          HTTPClient http;
          http.begin("http://192.168.1.2/api"); // IP do servidor
          int httpCode = http.GET();              // Faz a requisição
          if (httpCode > 0) { //verifica código de retorno
            String payload = http.getString();

              if(sizeof(payload) > 0) {
                newCommand = true;
                IncomingCommand = resultOfGet(payload);

                if((carrinho != IncomingCommand.id_carrinho)||(id_LED !=  IncomingCommand.id_LED)||(prateleira != IncomingCommand.id_prateleira)||(command != IncomingCommand.command)||( modo != IncomingCommand.id_mode))
                {
                carrinho = IncomingCommand.id_carrinho;
                prateleira = IncomingCommand.id_prateleira;
                id_LED = IncomingCommand.id_LED;
                command = IncomingCommand.command;
                modo = IncomingCommand.id_mode;
                Serial.println(carrinho);
                Serial.println(prateleira);
                Serial.println(id_LED);
                Serial.println(command);
                Serial.println( modo);
                atualiza_carrinho = 1;
                entra_mode2 = 0;
                }


                if (atualiza_carrinho == 1)
                {
                  atualiza_carrinho = 0;
                  if(IncomingCommand.id_mode == 1){
                    ClearAllLed();
                    updateShiftRegister(ledMatrix);
                    http.end(); 
                    break;  
                  }

                  if(IncomingCommand.command == Acende ) { // Comando Acende LED
                    state = LedOnState;
                    http.end(); 
                    break;
                  }

                  if(IncomingCommand.command == Apaga) {  // Comando Apaga LED
                    state = LedOffState;
                    http.end(); 
                    break;
                  }
                }

              
              }  
          }
          else {
            Serial.println("Error on HTTP request");
          }
        http.end(); 
        break;
        }
      }
      
    }
    break;  

    case (LedOnState):
    {
      for(int cont=0;cont<3;cont++)
      {
      SetLed(IncomingCommand.id_LED, IncomingCommand.id_prateleira);
     // updateShiftRegister(ledMatrix);
      }
      updateShiftRegister(ledMatrix);
      state = WaitState;
    }
    break;

    case (LedOffState):
    {
      for(int cont=0;cont<3;cont++)
      {
      ClearLed(IncomingCommand.id_LED, IncomingCommand.id_prateleira);
      }

      updateShiftRegister(ledMatrix);
      state = WaitState;
     
    }
    break;  

    case (BlinkOnState):
    {
      //IncomingCommand
      
      state = WaitState;
    }
    break;  

    case (BlinkOffState):
    {
      //IncomingCommand
    }
    break;  
  }
}
 

// Seleciona o bit referente ao LED que deve ser aceso //
void SetLed(int led, int floor)
{
  if(led < 41) {
    if(led < 9) {
      ledMatrix[floor][0] = ledMatrix[floor][0] | (1<<(led-1));
      return;
    }
    else if(led < 17){
      ledMatrix[floor][1] = ledMatrix[floor][1] | (1<<(led-9));
      return;
    }
    else if(led < 25){
      ledMatrix[floor][2] = ledMatrix[floor][2] | (1<<(led-17));
      return;
    }
    else if(led < 33){
      ledMatrix[floor][3] = ledMatrix[floor][3] | (1<<(led-25));
      return;
    }
    else {
      ledMatrix[floor][4] = ledMatrix[floor][4] | (1<<(led-33));
      return;
    }
  }
  else {
    if(led < 49) {
      ledMatrix[floor][5] = ledMatrix[floor][5] | (1<<(led-41));
    }
    else if(led < 57){
      ledMatrix[floor][6] = ledMatrix[floor][6] | (1<<(led-49));
    }
    else if(led < 65){
      ledMatrix[floor][7] = ledMatrix[floor][7] | (1<<(led-57));
    }
    else if(led < 73){
      ledMatrix[floor][8] = ledMatrix[floor][8] | (1<<(led-65));
    }
    else {
      ledMatrix[floor][9] = ledMatrix[floor][9] | (1<<(led-73));
    }
  }
}

// Zera o bit referente ao LED que deve ser apagado //
void ClearLed(int led, int floor)
{
   byte r = 0;
 
  if(led < 41) {
    if(led < 9) {
      //ledMatrix[floor][0] = ledMatrix[floor][0] & (0<<(led-1));
      r = bitClear(ledMatrix[floor][0],(led-1));
     ledMatrix[floor][0] = r;
      return;
    }
    else if(led < 17){
      //ledMatrix[floor][1] = ledMatrix[floor][1] & (0<<(led-9));
      r = bitClear(ledMatrix[floor][1],(led-9));
      ledMatrix[floor][1] = r;
      return;
    }
    else if(led < 25){
      //ledMatrix[floor][2] = ledMatrix[floor][2] & (0<<(led-17));
      r = bitClear(ledMatrix[floor][2],(led-17));
      ledMatrix[floor][2] = r;
      return;
    }
    else if(led < 33){
      //ledMatrix[floor][3] = ledMatrix[floor][3] & (0<<(led-25));
      r = bitClear(ledMatrix[floor][3],(led-25));
      ledMatrix[floor][3] = r;
      return;
    }
    else {
      //ledMatrix[floor][4] = ledMatrix[floor][4] & (0<<(led-33));
      r = bitClear(ledMatrix[floor][4],(led-33));
      ledMatrix[floor][4] = r;
      return;
    }
  }
  else {
    if(led < 49) {
      //ledMatrix[floor][5] = ledMatrix[floor][5] & (0<<(led-41));
      r = bitClear(ledMatrix[floor][5],(led-41));
      ledMatrix[floor][5] = r;
    }
    else if(led < 57){
      //ledMatrix[floor][6] = ledMatrix[floor][6] & (0<<(led-49));
      r = bitClear(ledMatrix[floor][6],(led-49));
      ledMatrix[floor][6] = r;
    }
    else if(led < 65){
      //ledMatrix[floor][7] = ledMatrix[floor][7] & (0<<(led-57));
      r = bitClear(ledMatrix[floor][7],(led-57));
      ledMatrix[floor][7] = r;
    }
    else if(led < 73){
      //ledMatrix[floor][8] = ledMatrix[floor][8] & (0<<(led-65));
      r = bitClear(ledMatrix[floor][8],(led-65));
      ledMatrix[floor][8] = r;
    }
    else {
      //ledMatrix[floor][9] = ledMatrix[floor][9] & (0<<(led-73));
      r = bitClear(ledMatrix[floor][9],(led-73));
      ledMatrix[floor][9] = r;
    }
  }
}

// Seleciona todos os Leds para serem acesos //
void SetAllLed()
{
  int i;
  int j;
  for(i=0; i<FloorNum; i++) {
    for(j=0; j<ShiftRegNum; j++) {
      ledMatrix[i][j] = 0xFF;
    }
  }
}

// Seleciona todos os Leds para serem apagados //
void ClearAllLed()
{
  int i;
  int j;
  for(i=0; i<FloorNum; i++) {
    for(j=0; j<ShiftRegNum; j++) {
      ledMatrix[i][j] = 0;
    }
  }
}

PacketStruct resultOfGet(String msg)
{ 
  //Trata os dados para formato Json
  PacketStruct packet;
  memset(json,0,sizeof(json));
  msg.toCharArray(json, 1600);
  deserializeJson(doc, json);

  JsonObject data = doc["data"];
  packet.id_carrinho = data["id_carrinho"];
  packet.id_prateleira = data["id_prateleira"]; 
  packet.id_LED = data["id_LED"];
  packet.command = (Commands)data["comando"]; 
  packet.id_mode = data["modo"];
  return(packet);
}

PacketMem resultOfGet1(String msg)
{ 
  //Trata os dados para formato Json

  PacketMem packet;
  memset(json1,0,sizeof(json1));
  msg.toCharArray(json1,4200);
  deserializeJson(doc1, json1);

  JsonObject posicao = doc1["posicao"];

  
 
  packet.andar_00 = posicao["floor0"]["p0"];
  packet.andar_01 = posicao["floor0"]["p1"];
  packet.andar_02 = posicao["floor0"]["p2"];
  packet.andar_03 = posicao["floor0"]["p3"];
  packet.andar_04 = posicao["floor0"]["p4"];
  packet.andar_05 = posicao["floor0"]["p5"];
  packet.andar_06 = posicao["floor0"]["p6"];
  packet.andar_07= posicao["floor0"]["p7"];
  packet.andar_08 = posicao["floor0"]["p8"];
  packet.andar_09 = posicao["floor0"]["p9"];
  
  packet.andar_10 = posicao["floor1"]["p0"];
  packet.andar_11 = posicao["floor1"]["p1"];
  packet.andar_12 = posicao["floor1"]["p2"];
  packet.andar_13 = posicao["floor1"]["p3"];
  packet.andar_14 = posicao["floor1"]["p4"];
  packet.andar_15 = posicao["floor1"]["p5"];
  packet.andar_16 = posicao["floor1"]["p6"];
  packet.andar_17= posicao["floor1"]["p7"];
  packet.andar_18 = posicao["floor1"]["p8"];
  packet.andar_19 = posicao["floor1"]["p9"];

  packet.andar_20 = posicao["floor2"]["p0"];
  packet.andar_21 = posicao["floor2"]["p1"];
  packet.andar_22 = posicao["floor2"]["p2"];
  packet.andar_23 = posicao["floor2"]["p3"];
  packet.andar_24 = posicao["floor2"]["p4"];
  packet.andar_25 = posicao["floor2"]["p5"];
  packet.andar_26 = posicao["floor2"]["p6"];
  packet.andar_27= posicao["floor2"]["p7"];
  packet.andar_28 = posicao["floor2"]["p8"];
  packet.andar_29 = posicao["floor2"]["p9"];
  
  packet.andar_30 = posicao["floor3"]["p0"];
  packet.andar_31 = posicao["floor3"]["p1"];
  packet.andar_32 = posicao["floor3"]["p2"];
  packet.andar_33 = posicao["floor3"]["p3"];
  packet.andar_34 = posicao["floor3"]["p4"];
  packet.andar_35 = posicao["floor3"]["p5"];
  packet.andar_36 = posicao["floor3"]["p6"];
  packet.andar_37= posicao["floor3"]["p7"];
  packet.andar_38 = posicao["floor3"]["p8"];
  packet.andar_39 = posicao["floor3"]["p9"];
  
  packet.andar_40 = posicao["floor4"]["p0"];
  packet.andar_41 = posicao["floor4"]["p1"];
  packet.andar_42 = posicao["floor4"]["p2"];
  packet.andar_43 = posicao["floor4"]["p3"];
  packet.andar_44 = posicao["floor4"]["p4"];
  packet.andar_45 = posicao["floor4"]["p5"];
  packet.andar_46 = posicao["floor4"]["p6"];
  packet.andar_47= posicao["floor4"]["p7"];
  packet.andar_48 = posicao["floor4"]["p8"];
  packet.andar_49 = posicao["floor4"]["p9"];

  packet.andar_50 = posicao["floor5"]["p0"];
  packet.andar_51 = posicao["floor5"]["p1"];
  packet.andar_52 = posicao["floor5"]["p2"];
  packet.andar_53 = posicao["floor5"]["p3"];
  packet.andar_54 = posicao["floor5"]["p4"];
  packet.andar_55 = posicao["floor5"]["p5"];
  packet.andar_56 = posicao["floor5"]["p6"];
  packet.andar_57= posicao["floor5"]["p7"];
  packet.andar_58 = posicao["floor5"]["p8"];
  packet.andar_59 = posicao["floor5"]["p9"];
  return(packet);
}

void updateShiftRegister(byte ledMatrix[FloorNum][ShiftRegNum ]) 
{
  int i =0;
  int j;

 /*
  digitalWrite(dataPin_outclk, LOW);  // Alteração de Código
   digitalWrite(clockPin_SIPO, LOW);
  delayMicroseconds(100);
  digitalWrite(clockPin_SIPO, HIGH); // Alteração no código
   delayMicroseconds(10);*/
  digitalWrite(dataPin_outclk, HIGH);  // Alteração de Código
  /* digitalWrite(clockPin_SIPO, LOW);
  delayMicroseconds(100);
  digitalWrite(clockPin_SIPO, HIGH); // Alteração no código
   delayMicroseconds(10);*/
   digitalWrite(latchPin_SIPO, LOW);
   digitalWrite(clockPin_SIPO, LOW); 
   digitalWrite(dataPin_SIPO4, LOW); 
   delayMicroseconds(50);
        
  for (i=0;i<ShiftRegNum ;i++){
 // for (i=0;i<1;i++)
  
    
    // if LSBFISRT
    for(j=0; j<8; j++) {
      
      digitalWrite(clockPin_SIPO, LOW);
      delayMicroseconds(30);
      //digitalWrite(dataPin_SIPO1, ((ledMatrix[0][i])>>j) % 2);
      digitalWrite(dataPin_SIPO1, bitRead(ledMatrix[0][i],j));
      //delayMicroseconds(5);
      //digitalWrite(dataPin_SIPO2, (ledMatrix[1][i]>>j) % 2);
      digitalWrite(dataPin_SIPO2, bitRead(ledMatrix[1][i],j));
      //digitalWrite(dataPin_SIPO3, (ledMatrix[2][i]>>j) % 2);
      digitalWrite(dataPin_SIPO3, bitRead(ledMatrix[2][i],j));
      //digitalWrite(dataPin_SIPO1, (ledMatrix[3][i]>>j) % 2);
      //digitalWrite(dataPin_SIPO4, (ledMatrix[3][i]>>j) % 2);

      digitalWrite(dataPin_SIPO4, bitRead(ledMatrix[3][i],j) );
      
      //digitalWrite(dataPin_SIPO5, (ledMatrix[4][i]>>j) % 2);
      digitalWrite(dataPin_SIPO5, bitRead(ledMatrix[4][i],j));
      
      //digitalWrite(dataPin_SIPO6, (ledMatrix[5][i]>>j) % 2);
      digitalWrite(dataPin_SIPO6, bitRead(ledMatrix[5][i],j)); 
      //delayMicroseconds(200);
      delayMicroseconds(30);
      digitalWrite(clockPin_SIPO, HIGH);
      if((j==7)&&(i==ShiftRegNum - 1))
      {
      digitalWrite(latchPin_SIPO, HIGH);
      }
      delayMicroseconds(80);
      digitalWrite(clockPin_SIPO, LOW);
      delayMicroseconds(80); 
      if((j==7)&&(i== ShiftRegNum - 1 ))
      {

        digitalWrite(latchPin_SIPO, LOW);
        digitalWrite(dataPin_SIPO4, LOW);
      }
         
    
    }
     

  }
     

        
        /*digitalWrite(clockPin_SIPO, LOW); // Alteração no código
        delayMicroseconds(80);
        digitalWrite(latchPin_SIPO, HIGH);
        digitalWrite(clockPin_SIPO, HIGH);
        delayMicroseconds(80);
        digitalWrite(latchPin_SIPO, LOW);
        digitalWrite(clockPin_SIPO, LOW); // Alteração no código
        delayMicroseconds(80);
         */
        
       
        
     
    
    //  digitalWrite(clockPin_SIPO, HIGH);
      
      delay(10);
    
     
  
  
}