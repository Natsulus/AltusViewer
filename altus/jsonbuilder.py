import os
import json

iconSizes = os.listdir("./icons")

for size in iconSizes:
    files = os.listdir("./icons/" + size)
    data = {}
    for file in files:
        path = "icons/" + size + "/" + file
        key = "[" + os.path.splitext(file)[0] + "]"
        data[key] = {"url": "https://natsulus.github.io/AltusViewer/altus/" + path, "size": 24, "type": "image"}
    file = open("./data/icons-" + size + ".json", "w")
    file.write(json.dumps(data, sort_keys=True,indent=4, separators=(',', ': ')));
    file.close();
    
