# 🚀 GerAI — Système de Gestion RH Intelligente
Bienvenue dans GerAI ! Cette version inclut une infrastructure conteneurisée pour Keycloak, un système de simulation d'API (MSW) et un tableau de bord dynamique par rôle.
## 📋 Table des matières
- [Prérequis](#prérequis)
- [Installation Rapide](#installation-rapide)
- [Infrastructure Keycloak (Docker)](#infrastructure-keycloak-docker)
- [Simulation API avec MSW](#simulation-api-avec-msw)
- [Lancement de l'application](#lancement-de-lapplication)
- [Comptes de Test](#comptes-de-test)
- [Résolution de problèmes](#résolution-de-problèmes)
## ✅ Prérequis
Avant de commencer, installe ces outils :
- **Node.js** : v22.x (LTS)
- **Yarn** : `npm install -g yarn`
- **Docker Desktop** : v28.x ou plus récent (Indispensable pour Keycloak)
- **Angular CLI v21** : `npm install -g @angular/cli@21`
## 📦 Installation Rapide
Cloner le projet :
```bash
git clone https://github.com/votre-repo/GerAI.git
cd GerAI
```
Installer les dépendances :
```bash
yarn install
```
## 🔐 Infrastructure Keycloak (Docker)
Le projet utilise désormais Docker Compose pour automatiser la base de données et l'importation de la configuration.
### Étape 1 : Lancer les services
Assure-toi que Docker Desktop est ouvert, puis lance à la racine :
```bash
docker compose up -d --build
```
**Ce que cela fait automatiquement :**
- 🐘 Démarre une base de données PostgreSQL dédiée.
- 🔑 Lance Keycloak 26.5.5.
- 🎨 Applique le thème personnalisé (dossier `themes/mon-theme`).
- 📥 Importe le Realm (utilisateurs, rôles CHEF/EMPLOYE, clients) depuis `realm-export.json`.
### Étape 2 : Vérification
Rends-toi sur [http://localhost:8080](http://localhost:8080). Si la page de login affiche le logo GerAI, le thème et Keycloak fonctionnent !
## 🛠 Simulation API avec MSW
Pour tester l'application sans backend réel (Spring Boot), nous utilisons MSW (Mock Service Worker). Il intercepte les requêtes HTTP et renvoie des données factices (notifications, tâches, etc.).
- **Activation** : MSW est configuré pour s'activer automatiquement en mode développement.
- **Fichiers clés** :
  - `src/mocks/handlers` : Gère la logique.
  - `src/main.ts` : Démarre le "Worker" au lancement de l'app.
## ▶️ Lancement de l'application
Une fois Keycloak démarré via Docker :
Lancer Angular :
```bash
yarn start
```
**Accès** :
Ouvre [http://localhost:4200](http://localhost:4200). Tu seras redirigé vers la page de login Keycloak.
## 👤 Comptes de Test
Grâce à l'import automatique du Realm, tu peux utiliser ces comptes immédiatement :
| Rôle | Username | Fonctionnalités |
| :--- | :--- | :--- |
| Chef | mariem | Gestion équipe, Validation demandes, KPIs |
| Employé | nour | Mes tâches, Dépôt de congés, Profil |
## 🔧 Résolution de problèmes
### Keycloak ne met pas à jour les rôles/utilisateurs
Si tu modifies le fichier `realm-export.json`, Docker ne le ré-importera pas si la DB existe déjà.
**Solution :**
```bash
docker compose down -v
docker compose up -d --build
```
*(Le `-v` supprime les anciens volumes et force le ré-import)*

👩‍💻 Développé par Nour El Houda Boussaidi & Mariem Saadaoui