#!/bin/sh

set -e

mkdir -p build/js/

# Start with the header
cat > build/js/ladder.js << 'EOF'
/*
 * LADDER GAME - JavaScript Port
 * A classic arcade game originally written for CPM operating system
 * Converted from Java to JavaScript for HTML5 Canvas
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1335 USA
 */

"use strict";

EOF

# Function to extract class/utility content, removing imports and exports
extract_content() {
	local file=$1
	# Remove: "use strict", import statements, let/const/var declarations, and export statements
	sed -e '1,/^"use strict";$/d' \
		-e '/^import .*/d' \
		-e '/^let [A-Za-z]/d' \
		-e '/^const [A-Za-z]/d' \
		-e '/^var [A-Za-z]/d' \
		-e '/^export default/d' \
		-e '/^if (typeof module/,/^\s*}$/d' \
		"$file"
}

# Concatenate files in dependency order
echo "// Creature base class" >> build/js/ladder.js
extract_content js/src/Creature.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// Level class" >> build/js/ladder.js
extract_content js/src/Level.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// Lad class" >> build/js/ladder.js
extract_content js/src/Lad.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// Barrel class" >> build/js/ladder.js
extract_content js/src/Barrel.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// BarrelProducer class" >> build/js/ladder.js
extract_content js/src/BarrelProducer.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// GameEngine class" >> build/js/ladder.js
extract_content js/src/GameEngine.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// Browser and rendering code (GameCanvas, UI, event handlers)" >> build/js/ladder.js
# GameCanvas.js doesn't have CommonJS wrapper, just remove "use strict"
sed '/^"use strict";$/d' js/src/GameCanvas.js >> build/js/ladder.js

echo "" >> build/js/ladder.js
echo "// Built: $(date)" >> build/js/ladder.js

# Syntax check
node --check build/js/ladder.js
if [ $? -ne 0 ]; then
	echo "ERROR: Syntax error in generated ladder.js"
	exit 1
fi

echo "build/js/ladder.js created and validated"
