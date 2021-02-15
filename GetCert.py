#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
i = 1
print("Hoeveelheid argumenten:", len(sys.argv))
if len(sys.argv) > 3:
    for file in ["cert.pem", "privkey.pem", "ca.pem"]:
         file = open("./tls/"+file, "w")
         file.writelines(sys.argv[i].replace("%20"," "))
         file.close()
         i += 1
else:
   print("No files provided.")
   sys.exit(127)
