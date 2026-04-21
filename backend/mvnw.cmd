@REM ----------------------------------------------------------------------------
@REM Maven wrapper script for Windows
@REM ----------------------------------------------------------------------------
@echo off

set MAVEN_PROJECTBASEDIR=%~dp0

@REM Find JAVA_HOME
if not "%JAVA_HOME%"=="" goto javaHomeSet
for %%i in (java.exe) do set JAVA_EXE=%%~$PATH:i
if not "%JAVA_EXE%"=="" goto javaFound
echo.
echo Error: JAVA_HOME is not set and no 'java' command could be found in PATH.
echo Please set JAVA_HOME to your JDK installation directory.
echo.
exit /b 1

:javaHomeSet
set JAVA_EXE=%JAVA_HOME%\bin\java.exe
if exist "%JAVA_EXE%" goto javaFound
echo Error: JAVA_HOME is set but java.exe not found at: %JAVA_EXE%
exit /b 1

:javaFound
set WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar
set WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties

@REM Download maven-wrapper.jar if missing
if exist "%WRAPPER_JAR%" goto wrapperReady
echo Downloading Maven Wrapper...
"%JAVA_EXE%" -cp "" org.apache.maven.wrapper.MavenWrapperMain %* 2>nul
if not exist "%WRAPPER_JAR%" (
    powershell -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar' -OutFile '%WRAPPER_JAR%'"
)

:wrapperReady
"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
