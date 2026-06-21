# CarGuard AI — Cahier des charges fonctionnel (complet)

> Document de référence des fonctionnalités du SaaS, destiné à générer des angles
> marketing pour les réseaux sociaux. Tout ce qui suit décrit des fonctionnalités
> réellement implémentées dans le produit.

---

## 1. Le produit en une phrase

**CarGuard AI** est une application web/mobile qui transforme n'importe quel
acheteur de voiture d'occasion en inspecteur averti : guidé pas à pas depuis son
smartphone, il prend des photos, des vidéos et un enregistrement sonore du
véhicule, et reçoit en quelques minutes un **rapport d'inspection IA** complet
avec un **score de confiance**, les **vices détectés**, des **arguments de
négociation** et les **bonnes questions à poser au vendeur**.

- **Cible** : acheteurs particuliers de voitures d'occasion (FR + EN), et
  secondairement les pros (revendeurs, mandataires).
- **Marché** : France et international (interface FR/EN, données véhicule
  US/EU).
- **Modèle** : paiement à l'inspection (sans abonnement obligatoire).
- **Promesse** : éviter le « vice caché » qui coûte des milliers d'euros, et
  négocier en position de force — sans être mécanicien.

---

## 2. Proposition de valeur (problèmes résolus)

1. **Peur de l'arnaque** : l'acheteur lambda ne sait pas repérer un moteur HS, une
   peinture refaite, un compteur trafiqué.
2. **Pas d'accès à un mécano** au moment de la visite (souvent un particulier, le
   week-end, à distance).
3. **Asymétrie d'information** face au vendeur → CarGuard rééquilibre.
4. **Négociation** : transformer chaque défaut en argument chiffré.
5. **Rapidité & coût** : une pré-inspection IA en minutes, à une fraction du prix
   d'une expertise physique.

---

## 3. Parcours utilisateur (de A à Z)

1. **Création de compte** (email + mot de passe, Supabase Auth).
2. **Démarrage d'une inspection** → **paiement** (Stripe, à l'inspection).
3. **Identification du véhicule** :
   - Saisie du **VIN** (décodage gratuit) **ou** de la **plaque** (recherche
     payante via fournisseur) → **auto-remplissage** des données.
   - **Ou** « je n'ai ni VIN ni plaque » → questionnaire guidé.
   - **Écran de validation** unique : toutes les infos véhicule en un bloc,
     éditables, puis validation.
4. **Photos extérieures guidées** (8 angles).
5. **Module Moteur & Mécanique** (12 étapes guidées : photos / vidéos / son /
   questionnaires).
6. **Son moteur** (enregistrement du démarrage, étape obligatoire).
7. **Documents** (carte grise, factures d'entretien, CT…).
8. **Génération du rapport** (analyse IA complète) → consultation + **export
   PDF**.
9. **Verrouillage** : une fois le rapport généré, l'inspection devient en lecture
   seule (intégrité du rapport) ; seul l'export PDF reste possible.

> UX pensée mobile : guides visuels à chaque étape, capture quasi instantanée
> (l'analyse IA lourde est concentrée sur l'écran final « génération du
> rapport »), reprise possible plus tard (brouillon auto-sauvegardé).

---

## 4. Le moteur d'analyse IA (cœur technologique)

Architecture **hybride, multi-IA**, chaque média confié au meilleur modèle :

- **Photos & documents → Anthropic Claude (vision)** : analyse fine des images
  (carrosserie, jauges, voyants, documents).
- **Vidéos & son → Google Gemini (audio + vidéo natifs)** : analyse de la
  vidéo complète **avec sa bande-son** (gros fichiers gérés via la Files API).
- **Données véhicule** : décodage VIN (NHTSA), recherche plaque (RegCheck FR),
  rappels & plaintes (NHTSA), valeur de marché.

Chaque résultat est **prudent et non-diagnostique** (« peut indiquer… »,
« à confirmer par un professionnel ») — positionnement responsable.

---

## 5. Détail des fonctionnalités

### 5.1 Analyse photo extérieure (8 angles guidés)
Avant, arrière, 2 côtés, 4 trois-quarts. L'IA recherche notamment :
- **Repeinture probable / différence de teinte** (réparation cachée),
- **Désalignement de panneaux, pare-chocs, hayon, portes** (choc passé),
- **Phare remplacé** (indice d'accident),
- **Dommages visibles**,
- Cohérence générale carrosserie.
→ Détecte les **accidents/réparations dissimulés** même quand la voiture
« brille ».

### 5.2 Module Moteur & Mécanique (12 étapes)
Chaque étape : un **guide visuel** + capture + analyse IA. Liste :
1. **Démarrage à froid** (vidéo) — démarrage long, claquements, fumée, ralenti.
2. **Voyants au tableau de bord** (2 photos : contact / moteur tournant).
3. **Échappement & montée en régime** (vidéo) — couleur de fumée
   (blanche/bleue/noire) + comportement en charge.
4. **Huile moteur — jauge** (photo) — niveau, couleur, « mayonnaise ».
5. **Dessous du bouchon d'huile** (photo) — émulsion eau/huile.
6. **Liquide de refroidissement** (photo) — traces d'huile, niveau.
7. **Fuites sous le moteur** (photo).
8. **Bruits au ralenti** (enregistrement **son** uniquement).
9. **Température moteur** (photo après conduite).
10. **Liquide sous la voiture après l'essai** (photo).
11. **Essai routier** (questionnaire à réponses pré-enregistrées — optionnel).
12. **Factures d'entretien** (documents — optionnel).

### 5.3 Analyse du son moteur (Gemini audio)
Écoute du démarrage et du ralenti pour repérer : **claquement / cognement,
cliquetis de distribution, sifflement de turbo anormal, ralenti instable,
ratés, couinement de courroie**, etc. → sous-scores + sons détectés +
recommandation. Le score audio **pèse dans le score de confiance global**.

### 5.4 Scanner de dommages cachés
Capture ciblée de zones suspectes pour une analyse vision dédiée.

### 5.5 Historique & rappels véhicule
- **Rappels constructeur** et **plaintes** (NHTSA).
- **Hook historique VIN payant** (NMVTIS US / fournisseur EU) — activable.

### 5.6 Contrôle de cohérence du kilométrage
Détecte un **kilométrage incohérent** (par rapport à l'âge, aux documents) →
**indice de compteur trafiqué**.

### 5.7 Estimation de la valeur de marché
Fourchette estimée + verdict **« au-dessus / dans / en-dessous du marché »** →
base objective de négociation.

### 5.8 Vérification des documents
Compte les documents fournis vs attendus (carte grise, entretien, CT, rapport
d'historique, facture d'achat) et signale les manquants clés.

### 5.9 Le rapport final
- **Score de risque global** + **score de confiance** + **recommandation**
  (acheter / négocier / inspection pro / éviter).
- **Points positifs** et **points à vérifier**.
- Détail par photo, par contrôle mécanique, son moteur.
- **Questions à poser au vendeur** et **au mécanicien**.
- **Arguments de négociation chiffrés** + **prix cible suggéré** + **message
  prêt à envoyer** au vendeur.
- **Prochaines étapes** recommandées.
- **Export PDF premium** (document de marque, partageable).
- **Demandes de photos complémentaires** générées automatiquement si besoin.

---

## 6. Exemples de vices cachés détectables (gold marketing)
Turbo HS · claquement / cognement bas moteur · **joint de culasse** (mayonnaise,
fumée blanche) · **distribution** (courroie humide / chaîne distendue) ·
**FAP/EGR colmaté** (fumée noire, voyant) · **boîte auto (DSG) à-coups** ·
**embrayage / volant moteur** · **injecteurs HS** (ralenti irrégulier,
démarrage difficile) · **surchauffe** (pompe à eau, thermostat) · **fuite
d'huile** · **alternateur / charge** · **compteur trafiqué** · **accident
réparé non déclaré**.

> Page d'exemples publique et bilingue : `/report-example?scenario=…&lang=fr|en`
> (13 rapports fictifs de véhicules français, un par vice).

---

## 7. Confiance, conformité & ton

- **Prudence affichée** : outil de **pré-diagnostic**, ne remplace pas un
  professionnel (mention systématique).
- **RGPD** : hébergement, suppression de compte avec **purge des médias**,
  politique de confidentialité, sous-traitants listés (Anthropic, Google,
  Supabase, Stripe).
- **CGV/CGU** + **renonciation au droit de rétractation** (exécution immédiate)
  au paiement.
- **Bilingue FR/EN**, routage multilingue, SEO (sitemap, OpenGraph, JSON-LD),
  **guides d'achat** (contenu éditorial) et **FAQ**.

---

## 8. Plateformes & technique

- **Web** (Next.js, mobile-first) + **app native** (Capacitor, App Store / Play
  Store) + **PWA** installable.
- **IA** : Claude (Anthropic) + Gemini (Google).
- **Infra** : Supabase (auth, base, stockage), Stripe (paiement), Vercel.
- **Capture** : appareil photo / vidéo / micro **natifs** du téléphone + import
  depuis la galerie.

---

## 9. Modèle économique

- **Paiement à l'inspection** (prix unitaire ~29 €, packs dégressifs).
- **Add-on** : rapport d'historique VIN payant (activable selon le marché).
- Sans abonnement obligatoire (acquisition simple : « je paie quand j'en ai
  besoin »).

---

## 10. Différenciateurs clés (pour les accroches)

1. **Multi-IA** : la seule à confier la **vidéo + le son** à une IA qui écoute
   réellement le moteur (pas juste des photos).
2. **Le son moteur analysé** : un argument spectaculaire (« l'IA entend ce que
   ton oreille ne perçoit pas »).
3. **Vices mécaniques ET fraudes** (compteur, accident caché) dans un seul
   rapport.
4. **De l'argument à l'euro** : négociation chiffrée + message prêt à envoyer.
5. **Accessible à tous** : pas besoin d'être mécanicien, depuis le parking du
   vendeur, en 10-15 min.
6. **Prudent et crédible** : ton non-diagnostique, recommande l'expert quand il
   faut.

---

## 11. Idées de cibles / personas (pour le ciblage de contenu)

- **Le primo-acheteur** anxieux (premier achat d'occasion).
- **Le particulier qui achète à distance** (annonce à 300 km).
- **Le parent** qui achète pour son enfant étudiant.
- **Le budget serré** (petite occasion, où un vice = catastrophe financière).
- **Le revendeur / mandataire** (gain de temps, sécurisation des achats).

*(Fin du cahier des charges — toutes les fonctionnalités décrites sont
implémentées dans le produit.)*
