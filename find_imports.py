import os
import re

package_names = set()
src_dir = 'c:/Users/Sameer Thakur/WabMeta/src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                # Find imports
                imports = re.findall(r"from\s+'([^']+)'", content)
                imports += re.findall(r'from\s+"([^"]+)"', content)
                for imp in imports:
                    if not imp.startswith('.'):
                        if imp.startswith('@'):
                            # Handle scoped packages @react-oauth/google
                            match = re.match(r'(@[^/]+/[^/]+)', imp)
                            if match:
                                package_names.add(match.group(1))
                            else:
                                package_names.add(imp.split('/')[0])
                        else:
                            package_names.add(imp.split('/')[0])

print("\n".join(sorted(package_names)))
