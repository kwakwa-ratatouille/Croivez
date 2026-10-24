# Lit le texte visible sur des images (reconnaissance de texte intégrée à Windows).
# Usage : powershell -File scripts/ocr.ps1 <dossier d'images> <fichier de sortie .json>
# Sortie : { "nom-du-fichier": "texte lu", ... }
param([string]$Dossier, [string]$Sortie)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Attendre($op, [Type]$type) { $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
$moteur = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$res = @{}
foreach ($f in Get-ChildItem -Path $Dossier -File) {
  try {
    $fichier = Attendre ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
    $flux = Attendre ($fichier.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $dec = Attendre ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($flux)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Attendre ($dec.GetSoftwareBitmapAsync([Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8, [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied)) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $ocr = Attendre ($moteur.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $res[$f.Name] = $ocr.Text
    $flux.Dispose()
  } catch { $res[$f.Name] = '' }
}
$res | ConvertTo-Json -Compress | Out-File -FilePath $Sortie -Encoding utf8
