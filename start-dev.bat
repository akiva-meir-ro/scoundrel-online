@echo off
REM Start the Vite dev server in the background
start npm run dev

REM Wait a few seconds for the server to start
timeout /t 3 /nobreak

REM Open the browser to localhost:5173 (Vite's default port)
start http://localhost:5173

REM Keep the window open
cmd /k
