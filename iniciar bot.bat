@echo off
cd /d "%~dp0"

:menu
cls
echo ================================
echo          BOT WHATSAPP
echo ================================
echo.
echo [1] Procurar atualizacao
echo [2] Iniciar bot
echo [3] Sair
echo.
set /p opcao=Escolha: 

if "%opcao%"=="1" goto atualizar
if "%opcao%"=="2" goto iniciar
if "%opcao%"=="3" goto sair

goto menu

:atualizar
echo.
echo Procurando atualizacoes...
git pull
echo.
pause
goto iniciar

:iniciar
echo.
echo Iniciando bot...
node bot.js
pause
goto sair

:sair
exit