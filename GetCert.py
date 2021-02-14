import sys
i = 0
print(sys.argv)
if len(sys.argv) > 3:
    for file in ["cert.pem", "privkey.pem", "ca.pem"]:
         file = open(file, "w")
         file.writelines(sys.argv[i])
         file.close()
         i += 1
else:
   print("No files provided.")
   sys.exit(127)
