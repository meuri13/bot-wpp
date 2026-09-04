@echo off
cd /d "C:\Users\marin\OneDrive\Desktop\bot-wpp"

:menu
cls
echo ==============================
echo  INICIANDO O BOT
echo ==============================
echo.
echo [1] Procurar atualizacao e iniciar
echo [2] Iniciar bot direto
echo [3] Sair
echo.
set /p opcao="Escolha uma opcao: "

if "%opcao%"=="1" goto atualizar
if "%opcao%"=="2" goto iniciar
if "%opcao%"=="3" exit

goto menu

:atualizar
cls
echo Puxando atualizacoes do GitHub...
git pull origin main
echo.
pause
goto iniciar

:iniciar
cls
echo ==============================
echo  BOT RODANDO
echo ==============================
echo.

node bot.js

echo.
echo ==============================
echo  ENVIANDO DADOS PRO GIT...
echo ==============================
git add .
git commit -m "Atualizacao automatica ao desligar"
git push origin main

echo.
echo ==============================
echo  O BOT FOI ENCERRADO
echo ==============================
pause
