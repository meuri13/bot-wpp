@echo off
cd /d "%~dp0"
title Bot WhatsApp - Laboratorio Veterinario

:menu
cls
echo ================================
echo        BOT WHATSAPP - LAB
echo ================================
echo.
echo [1] Procurar atualizacao e iniciar
echo [2] Iniciar bot
echo [3] Sair
echo.
set /p opcao="Escolha uma opcao: "

if "%opcao%"=="1" goto atualizar
if "%opcao%"=="2" goto iniciar
if "%opcao%"=="3" exit

echo Opcao invalida!
timeout /t 2 >nul
goto menu

:atualizar
cls
echo Buscando atualizacoes no GitHub...
git pull origin main
echo.
pause
goto iniciar

:iniciar
cls
echo Iniciando o Bot WhatsApp...
npm start

:: Quando o bot for encerrado (ex: pressionando Ctrl+C), o script continua daqui:
echo.
echo ========================================
echo   Enviando dados atualizados pro Git...
echo ========================================
git add .
git commit -m "Atualizacao automatica ao desligar bot"
git push origin main
echo.
echo Dados salvos no GitHub com sucesso!
pause