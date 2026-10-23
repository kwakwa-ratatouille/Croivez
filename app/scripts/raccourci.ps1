# Crée (ou recrée) le raccourci « Croivez » sur le Bureau, avec l'icône du logo.
# Les chemins sont calculés depuis l'emplacement de ce script : relancez-le si le dossier est déplacé ou renommé.
# Usage : powershell -ExecutionPolicy Bypass -File scripts\raccourci.ps1
$app = Split-Path -Parent $PSScriptRoot
$electron = Join-Path $app 'node_modules\electron\dist\electron.exe'
$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Croivez.lnk'

if (-not (Test-Path (Join-Path $app 'dist\index.html'))) {
  Write-Host "Compilation de l'app..."
  Push-Location $app; npm run build; Pop-Location
}

$sc = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$sc.TargetPath = $electron
$sc.Arguments = "`"$app`""
$sc.WorkingDirectory = $app
$sc.IconLocation = (Join-Path $app 'build\icon.ico') + ',0'
$sc.Description = 'Croivez, culture générale'
$sc.Save()
Write-Host "Raccourci créé : $lnk"
