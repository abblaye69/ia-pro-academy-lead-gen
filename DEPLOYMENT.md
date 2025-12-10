# 🚀 GUIDE DE DÉPLOIEMENT COMPLET - IA PRO ACADEMY

**Système Automatisé de Génération de Leads**  
**Date**: 10 Décembre 2025  
**Version**: 3.0 (Make Edition)

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du système](#vue-densemble)
2. [Fichiers à créer](#fichiers-à-créer)
3. [Déploiement sur Netlify](#déploiement-netlify)
4. [Configuration Make.com](#configuration-make)
5. [Tests & Validation](#tests)
6. [Lancement Marketing](#lancement)

---

## 🎯 VUE D'ENSEMBLE DU SYSTÈME

### Architecture

```
Prospect → Landing Page (HTML/JS)
         ↓
   Netlify Function (Proxy Sécurisé)
         ↓
   HubSpot CRM (Source Unique de Vérité)
         ↓
   Make.com (Orchestration)
         ↓
   Mailchimp (Envoi Email + Kit de Démarrage)
```

### Stack Technique
- **Frontend**: HTML5 + TailwindCSS + JavaScript Vanilla
- **Backend**: Netlify Functions (Serverless)
- **CRM**: HubSpot (API Key: `8345ebeb-7683-424f-8f98-c20c63a5aa57`)
- **Automatisation**: Make.com
- **Emailing**: Mailchimp

---

## 📁 FICHIERS À CRÉER

### Structure du projet

```
ia-pro-academy-lead-gen/
├── frontend/
│   ├── index.html
│   └── js/
│       └── main.js
├── netlify/
│   └── functions/
│       └── submit-lead.js
├── netlify.toml
├── package.json
└── README.md
```

### 1. netlify.toml

```toml
[build]
  functions = "netlify/functions"
  publish = "frontend"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 2. package.json

```json
{
  "name": "ia-pro-academy-backend",
  "version": "1.0.0",
  "dependencies": {
    "node-fetch": "^2.6.7"
  }
}
```

### 3. netlify/functions/submit-lead.js

**Note**: Le code complet (100+ lignes) se trouve dans le document Flowith section 3.
Voici les éléments clés:

- Validation des données (email, name, consent)
- Séparation prénom/nom
- Appel API HubSpot avec `process.env.HUBSPOT_ACCESS_TOKEN`
- Gestion des doublons (code 409)
- Proprietés: `ia_academy_source: "landing_page_v2"`

---

## 🚀 DÉPLOIEMENT SUR NETLIFY

### Étape 1: Préparer le Repository

1. Crée tous les fichiers listés ci-dessus dans le repo GitHub
2. Commit et push vers `main`

### Étape 2: Connecter à Netlify

1. Va sur https://app.netlify.com/start
2. Clique sur "GitHub"
3. Sélectionne `ia-pro-academy-lead-gen`
4. Configuration:
   - **Build command**: (laisser vide)
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`

### Étape 3: Configurer les Variables d'Environnement (⚠️ CRITIQUE)

1. Dans Netlify → Site settings → Environment variables
2. Ajoute:
   - **Key**: `HUBSPOT_ACCESS_TOKEN`
   - **Value**: `8345ebeb-7683-424f-8f98-c20c63a5aa57`

### Étape 4: Déployer

1. Clique sur "Deploy site"
2. Attends que le build se termine (2-3 minutes)
3. Récupère l'URL: `https://[nom-aléatoire].netlify.app`

---

## ⚙️ CONFIGURATION MAKE.COM

### Créer le Scénario

**Nom**: "IA Academy: HubSpot to Mailchimp"

#### Module 1: Trigger HubSpot

- **App**: HubSpot CRM
- **Événement**: Watch CRM Objects
- **Configuration**:
  - Object Type: `Contacts`
  - Limit: `10`
  - Properties to Watch: `ia_academy_source`, `firstname`, `lastname`, `email`

#### Module 2: Filtre

- **Label**: "Source is Landing Page"
- **Condition**: `ia_academy_source` [Equal to] `landing_page_v2`

#### Module 3: Action Mailchimp

- **App**: Mailchimp
- **Événement**: Add/Update Subscriber
- **Configuration**:
  - List ID: Ta liste "Audience IA Pro"
  - Email Address: `{{email}}` (depuis HubSpot)
  - Status: `Subscribed`
  - Tags: `LEAD_MAGNET_REQ` (⚠️ Ce tag déclenche l'email automatique)
  - First Name: `{{firstname}}`
  - Last Name: `{{lastname}}`

#### Activation

1. Sauvegarde le scénario
2. Active le scheduling (Run immediately ou toutes les 15 min)

---

## ✅ TESTS & VALIDATION

### Checklist Pré-Lancement

- [ ] Landing page accessible via l'URL Netlify
- [ ] Formulaire envoie les données (vérifie les logs Netlify Functions)
- [ ] Contact apparait dans HubSpot avec `ia_academy_source = landing_page_v2`
- [ ] Make détecte le nouveau contact (vérifie les logs)
- [ ] Contact ajouté à Mailchimp avec tag `LEAD_MAGNET_REQ`
- [ ] Email de bienvenue reçu (dans les 5 min)

### Test Complet

1. Ouvre la landing page en navigation privée
2. Remplis avec: `test.ia.academy@yopmail.com`
3. Soumets le formulaire
4. Vérifie:
   - Message de succès sur la page
   - Contact dans HubSpot (attends 30 secondes)
   - Logs Make.com (vérifie l'exécution)
   - Contact dans Mailchimp (attends 1-2 min)
   - Email reçu sur https://yopmail.com

---

## 📣 LANCEMENT MARKETING

### Première Semaine (J+0 à J+7)

**LinkedIn** (3 posts):
1. **Jour 1**: "Pourquoi 90% des prompts échouent" + lien kit
2. **Jour 3**: Sondage "Utilisez-vous l'IA pour..."
3. **Jour 7**: Cas d'usage concret + témoignage

**TikTok/IG Reels** (2 vidéos courtes):
1. "L'IA ne remplacera pas ton job, mais..." (hook viral)
2. Démo: "J'automatise mes emails en 2 minutes avec l'IA"

**Email Signature**:
Ajoute: "🎁 Nouveau: Mon kit de démarrage IA (Gratuit) → [lien]"

### Métriques à Suivre

- **Leads captures**: Objectif 50 en semaine 1
- **Taux de conversion**: 15-25% (visiteurs → leads)
- **Taux d'ouverture email**: 30-40%
- **Engagement LinkedIn**: 100+ interactions par post

---

## 📚 RESSOURCES COMPLÉMENTAIRES

### Codes Sources Complets

Tous les codes (HTML, JS, Functions) sont disponibles dans le document Flowith:
https://flowith.io/conv/f33b07d8-9c34-41a1-81a3-314954d5a5ed

Sections:
- Section 2: Code Frontend (index.html + main.js)
- Section 3: Code Backend (submit-lead.js)
- Section 4: Guide Make.com détaillé
- Section 6: Plan social media 30 jours

### Propriétés HubSpot à Créer

Dans HubSpot > Settings > Properties, crée:

1. **ia_academy_consent**
   - Type: Single checkbox
   - Field type: Boolean

2. **ia_academy_source**
   - Type: Single-line text
   - Field type: Text

### Support

Si problème:
1. Vérifie les logs Netlify Functions
2. Vérifie les logs Make.com
3. Teste l'API HubSpot manuellement

---

## 🎯 PROCHAINES ÉTAPES

1. **Immédiat**: Créer les fichiers manquants dans GitHub
2. **Aujourd'hui**: Déployer sur Netlify + configurer Make
3. **Demain**: Tester le flux complet
4. **Cette semaine**: Lancer les premiers posts LinkedIn/TikTok
5. **J+7**: Analyser les premières métriques et optimiser

---

**© 2025 IA Pro Academy | Système prêt pour mise en production**
