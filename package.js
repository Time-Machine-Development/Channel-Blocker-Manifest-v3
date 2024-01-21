const fs = require("fs");

const enumsPath = "./dist/shared/enums.js";
const indexPath = "./dist/background/index.js";

const enumsContent = fs.readFileSync(enumsPath, "utf-8");
const indexContent = fs.readFileSync(indexPath, "utf-8");

const firstLineBreakIndex = indexContent.indexOf("\n");

fs.writeFileSync(indexPath, enumsContent + indexContent.substring(firstLineBreakIndex));
