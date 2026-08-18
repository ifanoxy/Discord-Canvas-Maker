# 🎨 Discord Canvas Maker

> **Studio Visuel de Création de Cartes, Bannières et Profils Discord.**  
> Générez du code Node.js Canvas en **TypeScript (typé strict)** ou **JavaScript** prêt pour vos bots Discord.  
> **100% Local (Zero-Backend)** et synchronisé avec la communauté via **GitHub Pull Requests**.

---

## ✨ Fonctionnalités Principales

- 🖱️ **Studio Visuel Intuitif** :
  - Outils vectoriels : Rectangles arrondis, Cercles, Triangles, Étoiles, Lignes, Arcs de cercle.
  - Outils Discord dédiés : Avatar Seul, Avatar + Statut de connexion, Bannières dégradées, Badges de rôle, Salons textuels `#`.
  - Jauges & Barres de progression multi-styles (Horizontales, Cercles, Jauges radiales, Segmentées, Verticales) avec **remplissage en dégradé personnalisable**.
- 🟢 **Snapping Intelligent & Raccourcis Illustrator** :
  - Maintenez la touche **`Ctrl`** pour afficher les lignes d'alignement vertes d'Adobe Illustrator (centre, début, fin, adjacence).
  - Raccourcis clavier : `Delete`, `Ctrl+C`, `Ctrl+V`, `Ctrl+D`, touches fléchées.
  - Grille magnétique personnalisable en pixels (`px`).
- 🎨 **20 Presets d'Arrière-Plan Géométriques & Modernes** :
  - Cyber Discord, Aurora Mesh, Synthwave Horizon, Low-Poly Mesh, Anneaux Quantiques, Prismes facettés, etc.
- 📦 **Architecture 100% Locale & Sécurisée** :
  - Tous vos projets et images restent stockés sur votre navigateur (`localStorage`).
  - Sauvegarde et Restauration complètes en fichier `.json` en 1 clic.
  - Aucun backend ni base de données requis.
- 🌐 **Workshop Communautaire GitHub** :
  - Explorez et clonez des templates partagés par d'autres développeurs.
  - Proposez vos propres créations au monde entier en soumettant une **Pull Request** sur le fichier `public/workshop/community-manifest.json`.
- ⚡ **Génération de Code Node.js Canvas & Export ZIP** :
  - Code TypeScript avec typage strict des options dynamiques (`options.userAvatar`, `options.xpBar`, etc.).
  - Export de packs multi-images complets sous forme d'archive `.zip`.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- npm ou pnpm ou yarn

### Installation
```bash
# 1. Cloner le dépôt
git clone https://github.com/ifanoxy/Discord-Canvas-Maker.git
cd Discord-Canvas-Maker

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

---

## 🌐 Déploiement Gratuit en 1 Clic

### Déploiement sur GitHub Pages (Automatique)
Le projet intègre un workflow GitHub Actions (`.github/workflows/deploy.yml`).
1. Allez dans **Settings** > **Pages** de votre dépôt GitHub.
2. Choisissez **GitHub Actions** comme source de déploiement.
3. Chaque push sur la branche `main` déploiera automatiquement votre site sur `https://<pseudo>.github.io/discord-canvas-maker/`.

### Déploiement sur Vercel / Netlify / Cloudflare Pages
Le projet est une application statique standard :
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

---

## 🤝 Partager un Modèle dans le Workshop (Pull Request)

1. Rendez-vous sur la page **Workshop** de l'application.
2. Cliquez sur **« Proposer un Modèle (PR GitHub) »**.
3. Choisissez le projet local à exporter et copiez le JSON généré.
4. Ouvrez le fichier `public/workshop/community-manifest.json` sur GitHub et collez votre bloc d'objet dans la liste.
5. Ouvrez une **Pull Request** : une fois acceptée, votre modèle sera automatiquement accessible à tous les utilisateurs !

---

## 📄 Licence
Ce projet est sous licence MIT — vous êtes libre de l'utiliser, le modifier et l'adapter pour tous vos projets de bots Discord.
