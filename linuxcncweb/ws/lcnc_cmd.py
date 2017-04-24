#!/usr/bin/python
import sys
import time
import linuxcnc


s = linuxcnc.stat()
c = linuxcnc.command()
lcnc_running = False


# script is starting
print 'Connection is open: Welcome'
sys.stdout.flush()


# main cycle
while 1:
    try:
        line = sys.stdin.readline()
    except KeyboardInterrupt:
        break

    if line: # if we have any input
        if line.lstrip(' \t').upper().startswith('MDI'): # if we have MDI cmd
            lcnc_running = True
            try:
                s.poll() # update linuxcnc state data
            except linuxcnc.error:
                lcnc_running = False
            
            if not lcnc_running:
                print "LinuxCNC isn't running"
            elif s.estop: 
                print 'E-Stop is ON'
            elif not s.enabled: 
                print 'Machine is OFF'
            elif not s.homed: 
                print 'Some axis is NOT HOMED'
            elif s.interp_state != linuxcnc.INTERP_IDLE: 
                print 'Machine state is NOT IDLE'
            else:
                mdi_txt = line[3:].lstrip(' \t').rstrip(' \t\n\r')
                c.mode(linuxcnc.MODE_MDI)
                c.wait_complete() # wait until mode switch executed
                c.mdi(mdi_txt)
                print mdi_txt
        
        else:
            print 'Unknown command'
        
        sys.stdout.flush()


# script is over
print 'Connection is closed'
sys.stdout.flush()
