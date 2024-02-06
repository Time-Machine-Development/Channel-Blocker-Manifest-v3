#!/bin/bash

manifest_file="./manifest.json"
images_folder="./images"
ui_folder="./ui"
destination_folder="./dist"

# Delete the existing dist folder
rm -rf "$destination_folder"

# Run npm run build in content-scripts folder
cd content-scripts
npm run build
cd ..

# Run npm run build in service-worker folder
cd service-worker
npm run build
cd ..

# Run npm run build in ui folder
cd ui
npm run build
cd ..

# Create the destination folder if it doesn't exist
mkdir -p "$destination_folder/images"

# Copy the contents of the images folder
cp "$manifest_file" "$destination_folder"
cp -r "$images_folder"/* "$destination_folder/images"

# Copy HTML files from the ui folder and its subfolders
# find "$ui_folder/settings" -name "*.html" -exec cp {} "$destination_folder/settings/{}" \;
# find "$ui_folder/popup" -name "*.html" -exec cp {} "$destination_folder/popup/{}" \;
cp -v "$ui_folder"/settings/*.html "$destination_folder/ui/settings/"
cp -v "$ui_folder"/popup/*.html "$destination_folder/ui/popup/"

echo "Files copied to ./dist folder."
