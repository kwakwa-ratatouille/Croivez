# Télécharge les images d'un pack et les aplatit sur fond clair puis sur fond sombre (logos transparents),
# pour que la reconnaissance de texte de Windows (scripts/ocr.ps1) puisse lire ce qui est écrit dessus.
# Usage : python -I scripts/ocr-prepare.py <pack> <dossier>
import io, json, os, sys, time, urllib.request
from PIL import Image

pack, dossier = sys.argv[1], sys.argv[2]
os.makedirs(dossier, exist_ok=True)
items = json.load(open(f'public/packs/culture/{pack}.json', encoding='utf8'))
for i, it in enumerate(items):
    url = it.get('img')
    if not url or os.path.exists(os.path.join(dossier, f'{i}-c.png')):
        continue
    for essai in range(5):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Croivez/0.1 (app perso de quiz)'})
            data = urllib.request.urlopen(req, timeout=25).read()
            im = Image.open(io.BytesIO(data)).convert('RGBA')
            im.thumbnail((800, 800))
            for suffixe, fond in (('c', (255, 255, 255)), ('s', (40, 40, 40))):
                f = Image.new('RGB', im.size, fond)
                f.paste(im, mask=im.split()[3])
                f.save(os.path.join(dossier, f'{i}-{suffixe}.png'))
            break
        except Exception as e:
            time.sleep(3 * (essai + 1))
    time.sleep(0.35)
print(pack, 'prêt')
