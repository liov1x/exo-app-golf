# Mobilité

Application personnelle pour dérouler une séance de mobilité : les exercices
s'enchaînent tout seuls, un disque façon Time Timer montre le temps restant, et
un personnage pictogramme rejoue le mouvement en direct, au tempo.

Construite à partir de la planche photo « MOBILITE » (29 exercices).

## État : prototype

6 exercices sur 28 sont implémentés (n° 1, 4, 12, 18, 19, 24), un par famille de
position, pour valider le style avant de dessiner le reste. Trois d'entre eux
(12, 18, 24) portent encore un mouvement faux, relevé pendant la validation du
catalogue et pas encore corrigé.

La planche compte 29 photos mais 28 exercices : les 27 et 28 sont deux vues du
même mouvement.

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
contour, puis exactement une épaisseur de contour plus fin dans la couleur du
fond. La seconde passe efface les contours internes du groupe et il ne reste
que la silhouette.

La couleur du fond est lue dans `--figure-paper` : elle doit correspondre au
fond réel derrière la figure, sinon l'intérieur du personnage jure.

### La colonne est une courbe

Le tronc n'est pas un segment épaules–bassin mais une Bézier. Chaque pose porte
un `bend` : de combien la colonne s'écarte de la droite épaules–bassin, au
milieu du dos. Il s'interpole comme les articulations, donc **le dos s'arrondit
au fil du mouvement** au lieu de basculer d'un bloc.

Le sens est donné par la perpendiculaire à l'axe épaules → bassin, tournée d'un
quart de tour horaire à l'écran. De profil tête à gauche, une valeur négative
bombe le dos vers le haut — c'est le dos rond ; de face, une valeur positive
incline le buste à droite.

Sans `bend`, tous les personnages étaient des bâtons articulés. Trois exemples
de ce que la courbure apporte :

| Exercice | Ce que dit la colonne |
| --- | --- |
| Bascule à quatre pattes | dos plat à l'aplomb des mains, franchement rond une fois reculé |
| Inclinaison debout | une colonne qui s'incline, et non un buste qui bascule d'une pièce |
| Planche | volontairement droite : c'est la consigne de l'exercice |

Quand le dos s'arrondit, la tête suit : son orientation se règle pose par pose
(menton rentré sur un dos rond). Une tête restée dans l'axe trahit aussitôt
une colonne qu'on aurait oublié de courber.

### Une seule graisse de trait

L'épaisseur du contour est fixée en **pixels** (`OUTLINE_PX`), pas en unités du
repère. Chaque schéma étant cadré sur son propre mouvement, donc zoomé
différemment, une épaisseur en unités donnerait un trait gras ici et fin là.
`Figure` mesure son zoom réel à l'écran et reconvertit. `MIN_VIEW` borne en
plus le cadrage, pour que les personnages restent à des échelles comparables.

Même règle pour la tête : son cercle est tracé avec une épaisseur simple,
puisque le trait y est centré sur le chemin. Une épaisseur double y donnait un
contour deux fois plus gras que celui du corps.

### Premier plan, second plan

Les membres du fond forment un groupe dessiné en premier : le contour du corps
passe devant eux, et ils sont un peu plus fins (`BODY.far`). On sait donc quel
bras est devant.

Trois réglages par exercice, dans cet ordre de fréquence :

- `singleArm` / `singleLeg` — de profil, un mouvement symétrique superpose
  exactement les deux bras ou les deux jambes. Le membre du fond ne sort alors
  qu'en liseré collé à l'autre, et ça se lit comme un défaut de tracé : on n'en
  dessine qu'un. À laisser faux dès que les deux membres font des choses
  différentes (le genou qui monte en planche, la fente).
- `armsBehind` — quand la main revient toucher le corps, un bras dessiné devant
  fusionne avec le tronc en un pâté. Derrière, le contour du tronc le recoupe.
- `legInFront` — une cuisse qui repasse au-dessus du tronc, bassin enroulé,
  fusionne avec lui puisque les contours internes d'un même groupe s'effacent.
  Dessinée à part par-dessus, elle garde son contour. En échange, une couture
  apparaît à la hanche : à ne mettre que quand la jambe croise vraiment le corps.
- `noGround` — coupe le trait de sol, qui n'a pas de sens hors des vues
  orthogonales.

### Quand passer en trois quarts

Le modèle accepte n'importe quelle projection : une vue de trois quarts n'est
qu'un autre placement des articulations, avec `noGround`.

Essayé sur les genoux à la poitrine et sur le quatre-pattes : dans les deux cas
c'était moins lisible que le profil, le corps devenant une masse sans axe
clair. Ces deux schémas ont été refaits de profil.

Le trois quarts se justifie quand le profil cache le mouvement lui-même —
typiquement les rotations, où tout se passe dans la profondeur : la rotation
lombaire genoux au sol (n° 6) ou l'ouverture du bras à quatre pattes (n° 13).
Pas avant.

### Le son porte l'information

Sur les exercices au sol, l'écran est au plafond et on ne le regarde pas. Les
bips de début, de fin et de décompte ont donc des timbres nettement distincts,
et le prochain exercice est annoncé à voix haute pendant la transition.

## Reste à faire

- **Finir de faire valider le catalogue avant de dessiner.** La planche ne porte
  aucun texte : tout nom et toute consigne est une lecture des photos, et cette
  lecture s'est déjà trompée quatre fois sur six. `docs/catalogue.md` tient
  l'état de chaque exercice, et `docs/fiche-*.png` sert à le relire photo à
  l'appui (`python3 tools/fiche-validation.py` pour régénérer).
- Dessiner les exercices manquants (poses clés, courbure du dos, plans), en
  suivant les notes de dessin du catalogue
- Éditeur de séances : composer, régler les durées, réordonner
- Historique local des séances
- Publication sur GitHub Pages
