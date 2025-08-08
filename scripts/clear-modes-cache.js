#!/usr/bin/env node

/**
 * Script to clear modes cache and restart the extension
 * This helps when DEFAULT_MODES are not updating properly
 */

const fs = require("fs")
const path = require("path")

console.log("🧹 Clearing Researcherry modes cache...\n")

// Paths to clear
const pathsToClear = [
	// VS Code extension storage
	path.join(
		process.env.HOME || process.env.USERPROFILE,
		".vscode-oss/extensions/researcherrycoderinc.researcherry-*/globalStorage/researcherrycoderinc.researcherry",
	),
	path.join(
		process.env.HOME || process.env.USERPROFILE,
		".vscode/extensions/researcherrycoderinc.researcherry-*/globalStorage/researcherrycoderinc.researcherry",
	),

	// Project-specific cache
	path.join(process.cwd(), ".researcherry"),
	path.join(process.cwd(), ".researcherry", ".researcherry-modes"),
]

console.log("Paths to clear:")
pathsToClear.forEach((p) => console.log(`  - ${p}`))

console.log("\nTo clear the cache:")
console.log("1. Close VS Code completely")
console.log("2. Delete the extension storage folders (if they exist):")
console.log(
	"   - ~/.vscode-oss/extensions/researcherrycoderinc.researcherry-*/globalStorage/researcherrycoderinc.researcherry",
)
console.log(
	"   - ~/.vscode/extensions/researcherrycoderinc.researcherry-*/globalStorage/researcherrycoderinc.researcherry",
)
console.log("3. Reopen VS Code")
console.log('4. Run the command: "Researcherry: Clear Modes Cache"')
console.log('5. Or use Command Palette (Ctrl+Shift+P) and search for "Clear Modes Cache"')

console.log("\nAlternative solution:")
console.log("1. Uninstall the extension")
console.log("2. Delete the extension folder completely")
console.log("3. Install the extension again")

console.log("\nThis will force the extension to reload all DEFAULT_MODES from the latest version.")
