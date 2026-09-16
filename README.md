# Mobilité

Application personnelle pour dérouler une séance de mobilité : les exercices
s'enchaînent tout seuls, un disque façon Time Timer montre le temps restant, et
un personnage pictogramme rejoue le mouvement en direct, au tempo.

Construite à partir de la planche photo « MOBILITE » (29 exercices).

## État : prototype

6 exercices sur 29 sont implémentés (n° 1, 4, 12, 18, 19, 24), un par famille de
position, pour valider le style avant de dessiner le reste.

Les **29 photos** sont en revanche déjà découpées depuis le PDF d'origine
(`public/photos/exo-01.jpg` … `exo-29.jpg`).

## Lancer

```sh
npm install
npm run dev      # développement
npm run build    # site statique dans dist/
```

`?poses` ouvre la planche de contrôle des schémas : chaque exercice y est montré
animé, pose clé par pose clé, à côté de sa photo d'origine. C'est l'outil pour
régler un bonhomme sans jouer une séance entière.

## Comment c'est fait

| Fichier | Rôle |
| --- | --- |
| `src/lib/pose.ts` | Ossature des poses, épaisseurs du corps, interpolation, cadrage auto |
| `src/components/Figure.tsx` | Le personnage animé, en boucle au tempo de l'exercice |
| `src/components/TimeTimer.tsx` | Le disque de temps qui se vide |
| `src/engine/useSession.ts` | Déplie une séance en étapes et déroule le décompte |
| `src/data/exercises.ts` | Le catalogue : nom, consigne, durée, tempo, poses clés |
| `src/data/sessions.ts` | Les séances |
| `src/lib/cues.ts` | Bips, vibrations, annonces vocales |
| `src/lib/wakeLock.ts` | Empêche l'écran de s'éteindre pendant la séance |

### Le repère des poses

Toutes les coordonnées vivent dans un repère de 200 × 140 unités, sol à
`y = 125`. Les poses ne décrivent qu'une ossature : `Figure` l'épaissit en
personnage cerné d'un contour. Le cadre de vue est recalculé par exercice à
partir de la boîte englobante de toutes les poses clés, chair comprise : sans
ça, un exercice allongé serait minuscule sur un téléphone.

### Le contour sans coutures

Chaque groupe de membres est tracé deux fois : épais dans la couleur du
contour, puis un peu plus fin dans la couleur du fond. La seconde passe efface
les contours internes du groupe et il ne reste que la silhouette. Les membres
arrière forment un groupe à part, dessiné en premier, donc le contour du corps
passe devant eux — c'est ce qui sépare les deux jambes. `armsBehind` fait
passer le bras avant dans ce groupe arrière, pour les poses où la main revient
toucher le corps.

La couleur du fond est lue dans `--figure-paper` : elle doit correspondre au
fond réel derrière la figure, sinon l'intérieur du personnage jure.

### Le son porte l'information

Sur les exercices au sol, l'écran est au plafond et on ne le regarde pas. Les
bips de début, de fin et de décompte ont donc des timbres nettement distincts,
et le prochain exercice est annoncé à voix haute pendant la transition.

## Reste à faire

- Dessiner les 23 exercices manquants (nommer, écrire la consigne, poser les poses clés)
- Éditeur de séances : composer, régler les durées, réordonner
- Historique local des séances
- Publication sur GitHub Pages
