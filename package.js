const fs = require("fs");

const enumsPath = "./dist/shared/enums.js";
const indexPath = "./dist/background/index.js";
const settingsPath = "./dist/ui/settings/scripts/index.js";

const enumsContent = fs.readFileSync(enumsPath, "utf-8");
const indexContent = fs.readFileSync(indexPath, "utf-8");
const settingsContent = fs.readFileSync(settingsPath, "utf-8");

const firstLineBreakIndex = indexContent.indexOf("\n");
const firstLineBreakSetting = settingsContent.indexOf("\n");

fs.writeFileSync(indexPath, enumsContent + indexContent.substring(firstLineBreakIndex));
fs.writeFileSync(settingsPath, enumsContent + settingsContent.substring(firstLineBreakSetting));
