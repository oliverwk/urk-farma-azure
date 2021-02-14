#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
print(sys.argv)
if len(sys.argv) > 3:
     file = open("./Dockerfile","w")
     file.writelines("FROM node:15\n\nWORKDIR ./\n\nCOPY package.json ./\n\nRUN npm install\n\nCOPY . .\n\nENV PORT=443\nENV SQL_server=\""+sys.argv[1]+"\"\nENV SQL_Password=\""+sys.argv[2]+"\"\nENV SQL_User=\""+sys.argv[3]+"\"\n\nEXPOSE 443\n\nCMD [ \"node\", \"index.js\" ]")
     file.close()
else:
 print("No args")
 sys.exit(127)
