# Bash Scripting in Linux 🐧 Curiosity report

## Why

I have been meanining to learn Linux and and how to script with bash for awhile. I got to thinking and realized that I could do both together. This report will mainly discuss bash/scripting but will use tools found on linux.

## What is Bash

Bash stands for Born-Again SHell. A shell is an interface that lets the user directly interact witht he computer without a GUI.

## What is Scripting

Is writing a list of commands inside a text file for a computer to then run them automatically. This alleviates toil and automates processes.

## My setup

Steps

- Downloaded VMware Fusion (for Mac)
- Downloaded Kali Linux
- Created a Kali VM in VMware
- Opened up my Kali box
- Practiced scripting using a text file editor and the terminal

## Two of my scripts

First script: first.sh

```
#! /bin/bash

#First Bash Script

echo "Hello World"
```

Output: Hello World

Last scrtipt: MySQLscanner.sh

```
#! /bin/bash

# Scan a range of IPs for a specific port

echo "Enter the starting IP address: "
read FirstIP

echo "Enter last octet of the lat IP address: "
read LastOctetIP

echo "Enter the port number you want to scan for: "
read port

nmap -sT $FirstIP-$LastOctetIP -p $port >/dev/null -oG MySQLscan

cat MySQLscan | grep open > MySQLscan2

cat MySQLscan2
```

My last script was really fun to create as I also learned a lot about how IP addresses and ports work, especially the difference between public and private ports. I used the script to scan for open 3306 ports, which is the default MySQL/MariaDB port, as that would be security issue to have open. The below is what nmap looks like when run against my own IP adrress via the script.

MySQLscan output:

```
┌──(arakni㉿kali)-[~]
└─$ cat MySQLscan
# Nmap 7.95 scan initiated Mon Nov 24 08:57:03 2025 as: /usr/lib/nmap/nmap --privileged -sT -p 3306 -oG MySQLscan 172.16.137.0-255
Host: 172.16.137.1 ()   Status: Up
Host: 172.16.137.1 ()   Ports: 3306/closed/tcp//mysql///
Host: 172.16.137.2 ()   Status: Up
Host: 172.16.137.2 ()   Ports: 3306/closed/tcp//mysql///
Host: 172.16.137.254 () Status: Up
Host: 172.16.137.254 () Ports: 3306/filtered/tcp//mysql///
Host: 172.16.137.129 () Status: Up
Host: 172.16.137.129 () Ports: 3306/closed/tcp//mysql///
# Nmap done at Mon Nov 24 08:57:05 2025 -- 256 IP addresses (4 hosts up) scanned in 2.29 seconds
```

Thoughts

I really enjoyed the process of learning the Linux file system and techniques like >dev/null and tools like nmap. As I created several scripts for a small project it became clear that the limit for scripts is only your imagination and knowledge of systems. Automating large tasks seems very doable and fun.

## Why scripting matters

Scripting allows the user to remove themselves from complicated processes by automation. This is very important to DevOps because we want to remove as much human error as possible while simultaneously increases production speed. By practicing scripting the user also learns systems better as script require extreme accuracy in order to function.

## Conclusion

Every programmer should learn how to script whether the scripting is done in Bash or another language. It will increase their knowledge of systems and commands, remove human errors via automation, and will remove toil from their life.
