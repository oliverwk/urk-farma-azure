#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
i = 1
newlin = """
"""
print("Hoeveelheid argumenten bij "+sys.argv[0]+":", len(sys.argv))
if len(sys.argv) > 3:
    for file in ["cert.pem", "privkey.pem", "ca.pem"]:
         content = sys.argv[i].replace("%20"," ").replace("|", newlin)
         file = open("./tls/"+file, "w")
         file.writelines(content)
         file.close()
         i += 1
else:
   print("No files provided.")
   sys.exit(127)
