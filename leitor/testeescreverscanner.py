#!/usr/bin/env python3
#from multiprocessing import TimeoutError
#from multiprocessing.pool import ThreadPool
import time
import board
import busio
import digitalio
import http.client
import requests
import json
import config_ip as ip
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306
import subprocess

# Define the Reset Pin
global draw , modo_trab,modo_text
oled_reset = digitalio.DigitalInOut(board.D4)

# Display Parameters
WIDTH = 128
HEIGHT = 32
BORDER = 5
'''
def format_dados(posic):
    #Rotina de formação de dados de posição para o banco
    if len(posic) == 11:
        dados = posic
        pos_id = posic[9]+posic[10]
        nr_id  = int(pos_id)
    
        if dados[7] == '1':
            nr_id = (nr_id - 81)* (-1)
        
        if dados[7] == '2':
            nr_id = (nr_id - 41)* (-1)
        
        txt_temp = str(nr_id)
        dados_temp = dados[0:9] + txt_temp 
    else :
        return
    return dados_temp

def Modo_trab( situacao):
    global modo_text
    # Escreve o modo que o carrinho está trabalando
    if situacao == 0:
        modo_text = "Ali."
        
    if situacao == 1:
        modo_text = "Prod."
    
    if situacao == 2:
        modo_text = "Rload."


def habilita_back():
    # Habilita a comunicação com servidor da fabrica
    global conn_back,obj,draw
    cmd = "hostname -I | cut -d\' \' -f1"
    IP = subprocess.check_output(cmd, shell = True )
    
    try:
        r1 = requests.get(f"http://{ip.ip_serv}:{ip.port_serv}",timeout=1)
        if(r1.status_code == 200):
            draw.text((0, 16), "Connect", font=font, fill=255)
        else :
            draw.text((0, 16), "No Connect", font=font, fill=255)
    except:
        draw.text((0, 16), "No Connect", font=font, fill=255)

def req_cadast(comp1,pos1):
    
    #Requisição post para cadastrar as informações dentro do banco de dados
    resp = format_dados(pos1)
    try:
        response = requests.post(f"http://{ip.ip_serv}:{ip.port_serv}/control/" + comp1 + "," + resp.upper())
    
    except:
        print("Não Cadastrou")
        
        
def req_finaliza():
    
    #Requisição para finalizar alimentação do carrrinho
    try:
        response = requests.get(f"http://{ip.ip_serv}:{ip.port_serv}/fim/{ip.id_carrinho}")
    
    except:
        print("Não Finalizou")
        
def req_busca(comp1):
    
    #Requisição para finalizar alimentação do carrrinho
    try:
        response =requests.get(f"http://{ip.ip_serv}:{ip.port_serv}/buscar/{ip.id_carrinho}," + comp1)
        print(f"http://{ip.ip_serv}:{ip.port_serv}/buscar/{ip.id_carrinho}," + comp1)
    except:
        print("Não Encontrou")
        
def req_confirmar(comp1,pos1):
    
    #Requisição para finalizar alimentação do carrrinho
    resp = format_dados(pos1)
    try:
        response =requests.get(f"http://{ip.ip_serv}:{ip.port_serv}/confirmar/" + resp.upper() + "," + comp1)
        print(f"http://{ip.ip_serv}:{ip.port_serv}/confirmar/" + resp.upper() + "," + comp1)
    except:
        print("Não Encontrou")
        

def req_inicio():
    
    #Requisição para finalizar alimentação do carrrinho
    try:
        response = requests.get(f"http://{ip.ip_serv}:{ip.port_serv}/inicio/{ip.id_carrinho}")
        Modo_trab(0)
    except:
        print("Não Inicializou.")
    
def req_rload():
    
    #Requisição para finalizar alimentação do carrrinho
    try:
        response = requests.get(f"http://{ip.ip_serv}:{ip.port_serv}/rload/{ip.id_carrinho}")
        Modo_trab(2)
    except:
        print("Não Reiniciou.")

def req_reseta():
    
    #Requisição para finalizar alimentação do carrrinho
    try:
        response = requests.get(f"http://{ip.ip_serv}:{ip.port_serv}/reseta/{ip.id_carrinho}")
        print(response.status_code)
        req_rload()
        Modo_trab(0)
    except:
        print("Não Reiniciou.")
        
def serial_format(codigo):
    
    #Format o código serial removendo os simbolos]
    a = codigo
    b = ">,-çÇ._;"
    for i in range(0,len(b)):
        a = a.replace(b[i],"")
    return a

# Rptina de time out para input
def timeout(seconds):
    def decorator(function):
        def wrapper(*args, **kwargs):
            pool = ThreadPool(processes=1)
            result = pool.apply_async(function, args=args, kwds=kwargs)
            try:
                return result.get(timeout=seconds)
            except TimeoutError as e:
                return e
        return wrapper
    return decorator
#@timeout(5)
def read_user_name():
    return input('Nome? ')
'''
# Use for I2C.
#time.sleep(10)
posicao = ""
i2c = board.I2C()
oled = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)

# Clear display.
oled.fill(0)
oled.show()

# Create blank image for drawing.
# Make sure to create image with mode '1' for 1-bit color.
image = Image.new("1", (oled.width, oled.height))

# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)

# Draw a white background
draw.rectangle((0, 0, oled.width, oled.height), outline=255, fill=255)

font = ImageFont.truetype('/home/pi/carrinho-inteligente/leitor/PixelOperator.ttf', 16)
#font = ImageFont.load_default()
modo_trab = 0;
while True:

    # Draw a black filled box to clear the image.
    draw.rectangle((0, 0, oled.width, oled.height), outline=0, fill=0)

    # Pi Stats Display
    draw.text((0, 0), "TESTE", font=font, fill=255)
    oled.image(image)
    oled.show()
    ##Modo_trab(modo_trab)
   # draw.text((80, 16), modo_text, font=font, fill=255)
    ##habilita_back()   
    # Display image
    # Display image
    
    try:
        posicao = input("Posição no Carrinho:")
    except:
        print("EOF")
    draw.text((0, 16), posicao, font=font, fill=255)
    oled.image(image)
    oled.show()
    time.sleep(10)
    '''name = read_user_name()
    if isinstance(name, TimeoutError):
        print('esperando')
        
    else:
        print('Olá', name)
    
      
    posicao = input("Posição no Carrinho:")
    
    format_dados(posicao)
    #print(format_dados(posicao.upper
    comp = input("Codigo Componente:")
    comp = serial_format(comp)
    #print(comp)
    if modo_trab == 0:
     #   posicao = input("Posição no Carrinho:")
        if (comp == 'fim') or (posicao == 'fim') or (comp == 'FIM') or (posicao == 'FIM'):
            req_finaliza()
            modo_trab = 1;
        elif (comp == 'inicio') or (posicao == 'inicio') :
            req_inicio()
            modo_trab = 0;
        
        elif (comp == 'rload') or (posicao == 'rload'):
            req_rload()
            modo_trab = 0;
            
        elif (comp == 'reset') or (posicao == 'reset'):
            req_reseta()
            
            modo_trab = 0;
        
        if modo_trab == 0:
            req_cadast(comp,posicao)
            
       
    else :
        if (comp == 'inicio') or (posicao == 'inicio') :
            req_inicio()
            modo_trab = 0;
        
        elif (comp == 'rload') or (posicao == 'rload'):
            req_rload()
            modo_trab = 0;
            
        elif (comp == 'reset') or (posicao == 'reset'):
            req_reseta()
            modo_trab = 0;
        
        elif modo_trab == 1:
      #      posicao = input("Posição no Carrinho:")
            req_confirmar(comp,posicao)
'''