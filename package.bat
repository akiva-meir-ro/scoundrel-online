@echo off
echo Installing dependencies...
npm install

echo Building the project...
npm run build

echo Packaging complete. The single file is in dist/index.html
echo You can rename it to scoundrel-game.html and share it.
pause