$backendAlembic = Join-Path $PSScriptRoot "backend\.venv\Scripts\alembic.exe"
if (Test-Path $backendAlembic) {
    & $backendAlembic $args
} else {
    & alembic $args
}
