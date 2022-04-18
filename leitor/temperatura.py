import time
from w1thermsensor import W1ThermSensor

sensor = W1ThermSensor()

while True:
    
    temp = sensor.get_temperature()
    print("{:.2f}".format(temp))
    time.sleep(1)