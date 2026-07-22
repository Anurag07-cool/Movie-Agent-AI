import os

# Define the root structure
pack_name = "Arcane Dominion"
base_path = os.path.join(os.getcwd(), pack_name)

folders = [
    "assets/minecraft/lang",
    "assets/minecraft/optifine/cit/swords",
    "assets/minecraft/optifine/cit/staffs",
    "assets/minecraft/optifine/cit/spellbooks",
    "assets/minecraft/optifine/cit/armor",
    "assets/minecraft/textures/item",
    "assets/minecraft/textures/models/armor",
    "assets/minecraft/models/item"
]

# 1. Create Folders
for folder in folders:
    os.makedirs(os.path.join(base_path, folder), exist_ok=True)

# 2. Create pack.mcmeta
mcmeta = {
    "pack": {
        "pack_format": 15,
        "description": "§dArcane Dominion§7 - Advanced Magic CIT"
    }
}

with open(os.path.join(base_path, "pack.mcmeta"), "w") as f:
    f.write(str(mcmeta).replace("'", '"'))

# 3. Create a sample CIT Property (Fire Sword)
fire_sword_prop = """type=item
matchItems=diamond_sword netherite_sword
model=./fire_sword.json
nbt.display.Name=ipattern:*Fire Sword*"""

with open(os.path.join(base_path, "assets/minecraft/optifine/cit/swords/fire_sword.properties"), "w") as f:
    f.write(fire_sword_prop)

# 4. Create the JSON model for the Fire Sword
fire_sword_json = """{
  "parent": "minecraft:item/handheld",
  "textures": {
    "layer0": "minecraft:item/fire_sword"
  }
}"""

with open(os.path.join(base_path, "assets/minecraft/optifine/cit/swords/fire_sword.json"), "w") as f:
    f.write(fire_sword_json)

# 5. Create Language File
lang_json = '{"item.minecraft.diamond_sword": "Arcane Blade"}'
with open(os.path.join(base_path, "assets/minecraft/lang/en_us.json"), "w") as f:
    f.write(lang_json)

print(f"✅ Structure for '{pack_name}' generated successfully!")
print("Next step: Add your .png textures to the assets/minecraft/textures/item folder.")