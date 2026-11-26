import json
import re
import os

# repo_root is AV-SAFE root
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Prefer ml-service/weights, fall back to backend/ml/weights
ml_service_weights = os.path.join(repo_root, 'ml-service', 'weights', 'phishing_model_weights.json')
backend_weights = os.path.join(repo_root, 'backend', 'ml', 'weights', 'phishing_model_weights.json')

if os.path.exists(ml_service_weights):
    weights_source = ml_service_weights
elif os.path.exists(backend_weights):
    weights_source = backend_weights
else:
    raise FileNotFoundError(f"No trained weights found at {ml_service_weights} or {backend_weights}")

with open(weights_source, 'r', encoding='utf-8') as f:
    model_json = json.load(f)

# Sync to backend/ml/weights
os.makedirs(os.path.dirname(backend_weights), exist_ok=True)
with open(backend_weights, 'w', encoding='utf-8') as f:
    json.dump(model_json, f, indent=2)
print(f'Updated Backend weights: {backend_weights}')

# 1. Update web-app copy
web_weights_path = os.path.join(repo_root, 'web-app', 'src', 'lib', 'phishing_model_weights.json')
with open(web_weights_path, 'w', encoding='utf-8') as f:
    json.dump(model_json, f, indent=2)
print(f'Updated Web Application weights: {web_weights_path}')

# 2. Update Chrome Extension (extension/phishingEngine.js)
ext_path = os.path.join(repo_root, 'extension', 'phishingEngine.js')
with open(ext_path, 'r', encoding='utf-8') as f:
    ext_content = f.read()

json_str = json.dumps(model_json, indent=2)
new_ext = re.sub(r'const modelWeights = \{[\s\S]*?\};', f'const modelWeights = {json_str};', ext_content, count=1)
with open(ext_path, 'w', encoding='utf-8') as f:
    f.write(new_ext)
print(f'Updated Chrome Extension: {ext_path}')

# 3. Update Android Kotlin (android-app/app/src/main/java/com/phishguard/PhishingEngine.kt)
kt_path = os.path.join(repo_root, 'android-app', 'app', 'src', 'main', 'java', 'com', 'phishguard', 'PhishingEngine.kt')
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
print(f'Updated Android App: {kt_path}')
