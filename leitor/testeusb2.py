import usb.core

dev = usb.core.find(idVendor=0x05e0, idProduct=0x1200)
print(dev)
if dev is None:
    raise ValueError('Device not found')
#dev.set_configuration()
print("Read: ", dev.read(0x81, 7))
#print("Write: ", dev.write(1, '0xB1'))