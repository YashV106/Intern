@echo off
cd /d internshala-clone-main\internarea
call npm run build
exit /b %errorlevel%
