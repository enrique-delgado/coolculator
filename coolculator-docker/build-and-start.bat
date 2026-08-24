@echo off
setlocal
cd /d "%~dp0"

echo Starting coolculator (backend + frontend) via Docker Compose...
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:8081
echo.

docker compose up --build -d

echo.
echo.
echo Go to http://localhost:8081

endlocal

