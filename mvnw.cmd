@echo off
where mvn >nul 2>nul
if %errorlevel%==0 (
  mvn %*
  exit /b %errorlevel%
)
set "MAVEN_VERSION=3.9.14"
set "MAVEN_BASE=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%\workly"
set "MAVEN_CMD=%MAVEN_BASE%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd"
if not exist "%MAVEN_CMD%" (
  echo Maven was not found. Downloading Maven %MAVEN_VERSION%...
  if not exist "%MAVEN_BASE%" mkdir "%MAVEN_BASE%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip'; $z=Join-Path $env:TEMP 'workly-maven.zip'; Invoke-WebRequest -UseBasicParsing $u -OutFile $z; Expand-Archive -Force $z '%MAVEN_BASE%'; Remove-Item $z"
  if errorlevel 1 exit /b 1
)
call "%MAVEN_CMD%" %*
exit /b %errorlevel%
