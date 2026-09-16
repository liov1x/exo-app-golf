# -*- coding: utf-8 -*-
"""
Fiche de validation des exercices.

La planche MOBILITE ne porte aucun texte : chaque nom et chaque consigne est
une lecture des photos, qui doit être confirmée avant qu'on dessine le schéma.
Ce script relit `docs/catalogue.json` et en sort de quoi valider : des planches
en images, photo à côté du texte proposé, et un tableau en Markdown.

    python3 tools/fiche-validation.py
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, 'public', 'photos')
DOCS = os.path.join(ROOT, 'docs')

REGULAR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

BG = (14, 17, 22)
TXT = (238, 242, 247)
MUT = (141, 153, 169)
ORANGE = (232, 97, 60)
BLUE = (61, 139, 212)
LINE = (38, 46, 58)

STATUTS = {
    'valide': ('validé', (108, 178, 122)),
    'propose': ('à valider', (214, 170, 74)),
    'incertain': ('question pour toi', (216, 92, 92)),
}

PHOTO_X = 160
PHOTO_W, PHOTO_H = 590, 150
TEXT_X, TEXT_W = 800, 700
SHEET_W = 1560
PER_SHEET = 10


def wrap(draw, text, font, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        trial = f'{cur} {w}'.strip()
        if draw.textlength(trial, font=font) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def photo_strip(ids):
    """Les photos d'un exercice, mises bout à bout quand il en compte plusieurs."""
    imgs = [Image.open(os.path.join(PHOTOS, f'exo-{i:02d}.jpg')).convert('RGB') for i in ids]
    h = min(i.height for i in imgs)
    imgs = [i.resize((int(i.width * h / i.height), h), Image.LANCZOS) for i in imgs]
    strip = Image.new('RGB', (sum(i.width for i in imgs) + 8 * (len(imgs) - 1), h), BG)
    x = 0
    for i in imgs:
        strip.paste(i, (x, 0))
        x += i.width + 8
    return strip


def row_height(draw, ex, fonts):
    _, cue_f, _, _ = fonts
    lines = len(wrap(draw, ex['consigne'], cue_f, TEXT_W))
    extra = len(wrap(draw, ex['question'], cue_f, TEXT_W)) if 'question' in ex else 0
    return max(200, 110 + lines * 30 + (extra * 30 + 16 if extra else 0))


def sheet(exercices, title, path, fonts):
    name_f, cue_f, tag_f, head_f = fonts
    probe = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    heights = [row_height(probe, e, fonts) for e in exercices]
    img = Image.new('RGB', (SHEET_W, 90 + sum(heights) + 20), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 32), title, font=head_f, fill=TXT)

    y = 90
    for ex, h in zip(exercices, heights):
        d.line([(40, y), (SHEET_W - 40, y)], fill=LINE, width=1)
        label = '+'.join(str(p) for p in ex['photos'])
        d.text((44, y + 26), label, font=name_f, fill=ORANGE)

        strip = photo_strip(ex['photos'])
        scale = min(PHOTO_W / strip.width, PHOTO_H / strip.height)
        strip = strip.resize((int(strip.width * scale), int(strip.height * scale)), Image.LANCZOS)
        img.paste(strip, (PHOTO_X, y + 22))

        ty = y + 22
        d.text((TEXT_X, ty), ex['nom'], font=name_f, fill=TXT)
        ty += 40
        for line in wrap(d, ex['consigne'], cue_f, TEXT_W):
            d.text((TEXT_X, ty), line, font=cue_f, fill=MUT)
            ty += 30

        ty += 6
        tags = f"{ex['position']} · {ex['duree']} s"
        if ex.get('bilateral'):
            tags += ' · G/D'
        if ex.get('tenue'):
            tags += ' · tenue'
        d.text((TEXT_X, ty), tags, font=tag_f, fill=BLUE)
        text, colour = STATUTS[ex['statut']]
        d.text((TEXT_X + d.textlength(tags, font=tag_f) + 24, ty), text, font=tag_f, fill=colour)

        if 'question' in ex:
            ty += 34
            for line in wrap(d, '→ ' + ex['question'], cue_f, TEXT_W):
                d.text((TEXT_X, ty), line, font=cue_f, fill=STATUTS['incertain'][1])
                ty += 30
        y += h

    img.save(path)
    print(path, img.size)


def markdown(exercices, path):
    lines = [
        '# Catalogue des exercices',
        '',
        "La planche MOBILITE ne porte aucun texte. Chaque nom et chaque consigne",
        "ci-dessous est une lecture des photos : **validé** veut dire confirmé par",
        "Lionel, **à valider** que la lecture est nette mais pas confirmée,",
        "**question** qu'il faut une réponse avant de dessiner.",
        '',
        "Régénérer les planches images : `python3 tools/fiche-validation.py`",
        '',
        '| # | Nom | Consigne | Position | Durée | Statut |',
        '| --- | --- | --- | --- | --- | --- |',
    ]
    for ex in exercices:
        num = '+'.join(str(p) for p in ex['photos'])
        tags = f"{ex['duree']} s"
        if ex.get('bilateral'):
            tags += ' · G/D'
        if ex.get('tenue'):
            tags += ' · tenue'
        lines.append(
            f"| {num} | {ex['nom']} | {ex['consigne']} | {ex['position']} | {tags} | {STATUTS[ex['statut']][0]} |"
        )

    questions = [e for e in exercices if 'question' in e]
    if questions:
        lines += ['', '## Questions en attente', '']
        for ex in questions:
            lines.append(f"- **{'+'.join(str(p) for p in ex['photos'])}** — {ex['question']}")

    notes = [e for e in exercices if 'dessin' in e]
    if notes:
        lines += ['', '## Notes de dessin', '']
        for ex in notes:
            lines.append(f"- **{'+'.join(str(p) for p in ex['photos'])}** — {ex['dessin']}")

    open(path, 'w').write('\n'.join(lines) + '\n')
    print(path)


def main():
    data = json.load(open(os.path.join(DOCS, 'catalogue.json')))
    exercices = data['exercices']
    fonts = (
        ImageFont.truetype(BOLD, 27),
        ImageFont.truetype(REGULAR, 22),
        ImageFont.truetype(REGULAR, 19),
        ImageFont.truetype(BOLD, 34),
    )
    for n in range(0, len(exercices), PER_SHEET):
        lot = exercices[n:n + PER_SHEET]
        first = lot[0]['photos'][0]
        last = lot[-1]['photos'][-1]
        sheet(
            lot,
            f'Fiche de validation — exercices {first} à {last}',
            os.path.join(DOCS, f'fiche-{n // PER_SHEET + 1}.png'),
            fonts,
        )
    markdown(exercices, os.path.join(DOCS, 'catalogue.md'))


if __name__ == '__main__':
    main()
