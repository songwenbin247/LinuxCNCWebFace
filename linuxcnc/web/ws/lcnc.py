#!/usr/bin/python
from sys import stdin, stdout, exit
import re
import linuxcnc

# lcnc main channels
s = linuxcnc.stat()
c = linuxcnc.command()
e = linuxcnc.error_channel()

# check lcnc program state
try: 
    s.poll()
except linuxcnc.error:
    print "Connection is closed: LinuxCNC isn't running"
    stdout.flush()
    exit(1)
    
# compiled regex
lcnc_stat_re    = re.compile( r'^linuxcnc\.stat\(\)\.\w[\s\w\(\)\[\]\'\",.-]+$' )
lcnc_cmd_re     = re.compile( r'^linuxcnc\.command\(\)\.\w+(\([^\(\)]*\))?$' )
lcnc_err_re     = re.compile( r'^linuxcnc\.error_channel\(\)\.\w+\(\)$' )
lcnc_const_re   = re.compile( r'^linuxcnc\.[A-Z_]+$' )




# script is starting
print 'Connection is open: Welcome'
stdout.flush()

# main cycle
while 1:
    try:
        line = stdin.readline()
    except KeyboardInterrupt:
        break

    if line: # if we have any input
        line = line.strip(' \t\n\r')

        if lcnc_stat_re.search(line) :
            code = line.replace('linuxcnc.stat()', 's')
            try:
                print line + ' = ' + str(eval(code))
            except AttributeError:
                print line + ' : Unknown attribute, linuxcnc.stat().???'
            except IndexError:
                print line + ' : Unknown index, linuxcnc.stat().list[???]'
            except KeyError:
                print line + ' : Unknown key, linuxcnc.stat().list[][???]'
            except linuxcnc.error, detail:
                print line + ' : linuxcnc.error', detail

        elif lcnc_cmd_re.search(line) :
            code = line.replace('linuxcnc.command()', 'c')
            try:
                print line + ' = ' + str(eval(code))
            except AttributeError:
                print line + ' : Unknown attribute, linuxcnc.command().???'
            except linuxcnc.error, detail:
                print line + ' : linuxcnc.error', detail

        elif lcnc_err_re.search(line) :
            code = line.replace('linuxcnc.error_channel()', 'e')
            try:
                print line + ' = ' + str(eval(code))
            except AttributeError:
                print line + ' : Unknown attribute, linuxcnc.error_channel().???'
            except linuxcnc.error, detail:
                print line + ' : linuxcnc.error', detail

        elif lcnc_const_re.search(line) :
            try:
                print line + ' = ' + str(eval(line))
            except AttributeError:
                print line + ' : Unknown attribute, linuxcnc.???'
            except linuxcnc.error, detail:
                print line + ' : linuxcnc.error', detail

        else:
            print line + ' : Unknown command'

        stdout.flush()

# script is over
print 'Connection is closed'
stdout.flush()
