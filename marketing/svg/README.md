# CarGuard AI — Clips SVG animés (promo réseaux / ads)

3 « vidéos » vectorielles animées, format vertical **9:16 (1080×1920)**, aux
couleurs de la marque. Légères, nettes à toute taille, modifiables en texte.

- `promo-hero.svg` — logo + scanner + tagline (boucle 7 s)
- `promo-vice-cache.svg` — « Elle a l'air parfaite… » → vice caché + score (8 s)
- `promo-parcours.svg` — 4 étapes (photos/vidéos/son/rapport) qui se cochent (9 s)
- `index.html` — galerie d'aperçu

## Aperçu
Ouvre `index.html` dans un navigateur, ou ouvre chaque `.svg` directement.
Les animations CSS tournent en boucle automatiquement.

## Les transformer en MP4 (pour Instagram/TikTok/Meta Ads)
Le plus simple — **enregistrement d'écran** :
1. Ouvre le `.svg` seul dans Chrome, en plein écran (zoom pour cadrer le 9:16).
2. Enregistre l'écran :
   - **Windows** : `Win + Alt + R` (Xbox Game Bar)
   - **Mac** : `Cmd + Shift + 5`
   - ou **OBS Studio** (gratuit) pour un cadrage précis 1080×1920.
3. Laisse tourner 1–2 boucles, coupe, exporte en MP4.

Option avancée (rendu automatique, sans écran) : un script Puppeteer qui
capture des frames + ffmpeg → MP4. (Je peux te le fournir si besoin.)

## Personnaliser
Tout est éditable dans un éditeur de texte :
- **Textes** : balises `<text>` (accroches, scores, CTA).
- **Couleurs** : `#E50914` / `#FF2A2A` (rouge), `#0B0B12` (fond).
- **Durées** : valeurs `7s` / `8s` / `9s` dans le `<style>`.
- Duplique `promo-vice-cache.svg` et change le texte pour décliner chaque vice
  (turbo, claquement, joint de culasse, compteur trafiqué…).
