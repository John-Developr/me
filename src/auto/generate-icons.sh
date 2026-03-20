#!/bin/bash

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ICONS_DIR="$SCRIPT_DIR/../components/icons"
OUTPUT_FILE="$ICONS_DIR/index.ts"

# Start fresh
echo "// AUTO-GENERATED FILE - DO NOT EDIT" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Loop through all .tsx files except index.ts
for file in "$ICONS_DIR"/*.tsx; do
  filename=$(basename -- "$file")
  name="${filename%.tsx}"

  if [ "$name" == "index" ]; then
    continue
  fi

  # 1️⃣ Check for default export
  if grep -q "export default" "$file"; then
    echo "export { default as $name } from \"./$name\";" >> "$OUTPUT_FILE"
  fi

  # 2️⃣ Check for named exports like: export { ArrowRight, ArrowRightV2 };
  # This handles multi-export per file
  grep -E "export[[:space:]]*{.*}" "$file" | while read -r line; do
    # Extract the part inside { … }
    exports=$(echo "$line" | sed -E 's/export[[:space:]]*{(.*)}/\1/' | tr -d ' ')
    # Write each export
    echo "export { $exports } from \"./$name\";" >> "$OUTPUT_FILE"
  done
done

echo "Icons index.ts generated successfully!"