# CarGuard AI — Guide de tournage « filmer la vraie app »

> Méthode pour créer des vidéos promo crédibles en **enregistrant l'écran** de
> l'app et des rapports d'exemple. Aucun matériel, gratuit. Résultat : des MP4
> verticaux prêts pour Insta/TikTok/Meta Ads.

---

## 0. Mode capture épuré (à utiliser pour des rendus propres)
Ajoute **`&bare=1`** à n'importe quelle URL de rapport d'exemple : la page
affiche **uniquement le rapport** (sans en-tête, boutons ni bandeau) → parfait
pour l'enregistrement d'écran.

Exemples (FR) :
- `https://www.carguard-ai.com/report-example?scenario=turbo&lang=fr&bare=1`
- `…?scenario=knock&lang=fr&bare=1` · `…?scenario=head_gasket&lang=fr&bare=1`
- `…?scenario=rollback&lang=fr&bare=1` · `…?scenario=accident&lang=fr&bare=1`
- (sans `scenario=` = véhicule sain)

> Scénarios dispo : turbo, knock, head_gasket, timing_belt, dpf, gearbox,
> clutch, injectors, cooling, oil_leak, alternator, rollback, accident.

---

## 1. Comment enregistrer l'écran
**iPhone** : Réglages → Centre de contrôle → ajoute « Enregistrement d'écran ».
Puis balaie pour ouvrir le centre de contrôle → bouton ⏺️.
**Android** : balaie vers le bas → tuile « Enregistrement d'écran ».
**Ordinateur (qualité max)** : Chrome plein écran + **OBS Studio** (gratuit),
cadre en 1080×1920.

Astuce : sur téléphone, mets l'écran en **luminosité haute**, active le mode
**Ne pas déranger** (pas de notif qui pollue la capture).

---

## 2. Plans à filmer (la matière première)
Enregistre ces séquences une fois ; tu les réutiliseras dans plusieurs vidéos.

**A. Le rapport qui « fait peur » (le plus fort)**
- Ouvre `…?scenario=turbo&lang=fr&bare=1`.
- **Scrolle lentement** du haut (score rouge + recommandation) vers le bas
  (son moteur, négociation). Filme 10–15 s.
- Refais-le pour 3-4 scénarios marquants : `knock`, `head_gasket`, `rollback`,
  `accident`.

**B. Le parcours d'inspection (l'app en action)**
- Connecte-toi (compte admin = inspection gratuite).
- Filme : écran VIN/plaque → bloc de validation → une étape photo → une étape
  vidéo → l'étape son moteur → l'écran « génération du rapport ».
- Garde des bouts de 2-4 s par étape.

**C. Détails « gros plan »**
- Le score qui s'affiche, la section « arguments de négociation », les
  « questions à poser au vendeur ».

---

## 3. Montage (CapCut, gratuit, mobile ou PC)
1. Nouveau projet **9:16**.
2. Pose tes captures dans l'ordre du script (voir
   `CARGUARD_VIDEOS_PROMO.md`).
3. **Accélère** les passages longs (scroll, parcours) ×1.5 à ×2.
4. Ajoute le **texte à l'écran** (gros, gras, blanc) — surtout le HOOK des 3
   premières secondes.
5. **Zoom progressif** (effet « Ken Burns ») sur le score/les alertes.
6. **Musique** tendue/montante (bibliothèque CapCut) + 1 « whoosh » à chaque
   transition.
7. **Voix-off** : enregistre-la, ou utilise la voix IA FR de CapCut.
8. **Sous-titres incrustés** (la majorité regarde sans le son).
9. Export **1080×1920, 30 fps**.

---

## 4. Recette express (1 vidéo en 15 min) — « Vice caché turbo »
1. Capture A sur `turbo&bare=1` (scroll du score → son moteur). 12 s.
2. Capture B : 2-3 s d'une vraie voiture (ou b-roll Pexels) pour le hook.
3. Dans CapCut :
   - Plan 1 (0–3 s) : b-roll voiture + texte **« Cette voiture a l'air parfaite »**.
   - Plan 2 (3–8 s) : capture du score rouge + texte **« Mais l'IA a entendu ça 👂 »**.
   - Plan 3 (8–14 s) : section son moteur + texte **« Turbo HS détecté »**.
   - Plan 4 (14–18 s) : logo + **« Inspecte avant d'acheter — CarGuard AI »**.
4. Musique + sous-titres + export.

> Décline la même recette pour chaque vice en changeant l'URL `scenario=` et le
> texte du hook. Tu as 13 sujets prêts.

---

## 5. Idées de contenu (rappel)
- « Vice caché de la semaine » (1 vidéo / scénario).
- « Avant/Après négo » (le défaut → la remise).
- « 3 trucs que le vendeur ne te dira jamais ».

*(Les textes/hooks détaillés sont dans `CARGUARD_VIDEOS_PROMO.md`.)*
