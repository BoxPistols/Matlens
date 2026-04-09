@echo off
:: =============================================================================
::  Matlens — Windows 用起動スクリプト
::  ダブルクリックで起動、またはコマンドプロンプトで: start.bat
:: =============================================================================
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

echo.
echo  __  __       _   ____  ____
echo ^|  \/  ^| __ _^| ^|_^|  _ \^| __ )
echo ^| ^|\/^| ^|/ _` ^| __^| ^| ^| ^|  _ \
echo ^| ^|  ^| ^| (_^| ^| ^|_^| ^|_^| ^| ^|_) ^|
echo ^|_^|  ^|_^|\__,_^|\__^|____/^|____/
echo   研究・実験データ管理システム v3
echo.
echo ============================================================
echo.

set PORT=8080
set HOST=localhost
set INDEX_FILE=%~dp0index.html

:: index.html 確認
if not exist "%INDEX_FILE%" (
  echo [ERROR] index.html が見つかりません: %INDEX_FILE%
  pause
  exit /b 1
)

echo [OK]   index.html を確認しました

:: ポート使用確認
netstat -an 2>nul | findstr ":%PORT% " >nul
if %errorlevel% == 0 (
  echo [WARN]  ポート %PORT% は使用中です。ポート 8081 を試みます。
  set PORT=8081
)

set URL=http://%HOST%:%PORT%/index.html

:: Python 3 を優先
where python3 >nul 2>&1
if %errorlevel% == 0 (
  echo [OK]   Python 3 を検出しました
  echo.
  echo ============================================================
  echo   Matlens が起動します
  echo   URL: %URL%
  echo   停止: Ctrl + C
  echo ============================================================
  echo.
  start "" "%URL%"
  cd /d "%~dp0"
  python3 -m http.server %PORT% --bind %HOST%
  goto :end
)

:: python コマンドを試す
where python >nul 2>&1
if %errorlevel% == 0 (
  python --version 2>&1 | findstr "Python 3" >nul
  if %errorlevel% == 0 (
    echo [OK]   Python 3 を検出しました
    echo.
    echo ============================================================
    echo   Matlens が起動します
    echo   URL: %URL%
    echo   停止: Ctrl + C
    echo ============================================================
    echo.
    start "" "%URL%"
    cd /d "%~dp0"
    python -m http.server %PORT% --bind %HOST%
    goto :end
  )
)

:: Node.js / npx を試す
where npx >nul 2>&1
if %errorlevel% == 0 (
  echo [OK]   Node.js (npx) を検出しました
  echo.
  echo ============================================================
  echo   Matlens が起動します
  echo   URL: %URL%
  echo   停止: Ctrl + C
  echo ============================================================
  echo.
  timeout /t 2 /nobreak >nul
  start "" "%URL%"
  cd /d "%~dp0"
  npx --yes serve . --listen %PORT% --no-clipboard
  goto :end
)

:: PHP を試す
where php >nul 2>&1
if %errorlevel% == 0 (
  echo [OK]   PHP を検出しました
  echo.
  echo ============================================================
  echo   Matlens が起動します
  echo   URL: %URL%
  echo   停止: Ctrl + C
  echo ============================================================
  echo.
  start "" "%URL%"
  cd /d "%~dp0"
  php -S %HOST%:%PORT%
  goto :end
)

:: 何も見つからない場合
echo.
echo [ERROR] HTTPサーバーを実行できるランタイムが見つかりません。
echo.
echo 以下のいずれかをインストールしてください:
echo   - Python 3: https://www.python.org/downloads/
echo               ※ インストール時に「Add Python to PATH」にチェック
echo   - Node.js:  https://nodejs.org/
echo.
pause
exit /b 1

:end
endlocal
