@echo off
if exist "%~dp0backend\.venv\Scripts\alembic.exe" (
    "%~dp0backend\.venv\Scripts\alembic.exe" %*
) else (
    alembic %*
)
