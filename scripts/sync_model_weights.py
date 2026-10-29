import json
import re

with open('src/lib/phishing_model_weights.json', 'r', encoding='utf-8') as f:
    model_json = json.load(f)

# 1. Update Chrome Extension (extansion/phishingEngine.js)
ext_path = 'extansion/phishingEngine.js'
with open(ext_path, 'r', encoding='utf-8') as f:
    ext_content = f.read()

json_str = json.dumps(model_json, indent=2)
new_ext = re.sub(r'const modelWeights = \{[\s\S]*?\};', f'const modelWeights = {json_str};', ext_content, count=1)
with open(ext_path, 'w', encoding='utf-8') as f:
    f.write(new_ext)
print('Updated Chrome Extension: extansion/phishingEngine.js')

# 2. Update Android Kotlin (android-app/app/src/main/java/com/phishguard/PhishingEngine.kt)
kt_path = 'android-app/app/src/main/java/com/phishguard/PhishingEngine.kt'
with open(kt_path, 'r', encoding='utf-8') as f:
    kt_content = f.read()

means_entries = ',\n'.join([f'            "{k}" to {v}' for k, v in model_json['means'].items()])
means_str = f'val means = mapOf(\n{means_entries}\n        )'

stds_entries = ',\n'.join([f'            "{k}" to {v}' for k, v in model_json['stds'].items()])
stds_str = f'val stds = mapOf(\n{stds_entries}\n        )'

weights_dict = {feat: w for feat, w in zip(model_json['features'], model_json['weights'])}
weights_entries = ',\n'.join([f'            "{k}" to {v}' for k, v in weights_dict.items()])
weights_str = f'val weights = mapOf(\n{weights_entries}\n        )'

bias_str = f'val bias = {model_json["bias"]}'

kt_content = re.sub(r'val means = mapOf\([\s\S]*?\)', means_str, kt_content, count=1)
kt_content = re.sub(r'val stds = mapOf\([\s\S]*?\)', stds_str, kt_content, count=1)
kt_content = re.sub(r'val weights = mapOf\([\s\S]*?\)', weights_str, kt_content, count=1)
kt_content = re.sub(r'val bias = [\d\.\-]+', bias_str, kt_content, count=1)

with open(kt_path, 'w', encoding='utf-8') as f:
    f.write(kt_content)
print('Updated Android App: android-app/.../PhishingEngine.kt')

