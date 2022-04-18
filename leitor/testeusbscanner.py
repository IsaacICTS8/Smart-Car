import sys
import usb.core
import usb.util

def lecture_code_barre():
    VENDOR_ID = 0x05e0
    PRODUCT_ID = 0x1200
    #VENDOR_ID = 0x04b4
    #PRODUCT_ID = 0x0100
    DATA_SIZE = 8 # 224
    NO_SCAN_CODE = {0x1E:'1', 0x1F:'2', 0x20:'3', 0x21:'4', 0x22:'5', 0x23:'6', 0x24:'7'
    , 0x25:'8', 0x26:'9', 0x27:'0', 0x28:''} # 28=enter

    device = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
    
    print(device)
   
    if device is None:
        sys.exit("Could not find Id System Barcode Reader.")
    '''
    if device.is_kernel_driver_active(0):   # On détache le périphérique du kernel, plus d'envoi sur stdin
        try:
            device.detach_kernel_driver(0)
        except usb.core.USBError as e:
           sys.exit("Could not detatch kernel driver: %s" % str(e))
    '''

    #try:
   ##     device.set_configuration()
   #     device.reset()
    #except usb.core.USBError as e:
    #    print(e)
    #    sys.exit("Could not set configuration: %s" % str(e))

    endpoint = device[0][(0,0)][0]
    data = []
    lu = False
    print ("Waiting to read... 1")
    lecture=''

    while True:
      
    
        
        try:
            #print ("Waiting to read...")
            
            dt = device.read(0x81,64,100)
           ## lecture = data
           
            print(dt)
            if not lu:
                print ("Waiting to read...")
            lu = True

        except usb.core.USBError as e:
            print(e)
            if e.args == (110,'Operation timed out') and lu:
                if len(data) < DATA_SIZE:
                    print ("Lecture incorrecte, recommencez. (%d bytes)" % len(data))
                    print ("Data: %s" % ''.join(map(hex, data)))
                    data = []
                    lu = False
                    continue
                else:
                    for n in range(0,len(data),16):
                        print (' '.join(map(hex,data[n:n+16])))
                        lecture+=NO_SCAN_CODE[data[n+2]]
                    break   # Code lu
                
    return lecture

if __name__ == '__main__':
    while True:
        print ("Teste : "+lecture_code_barre())