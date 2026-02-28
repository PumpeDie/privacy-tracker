# Privacy Tracker - Projet Pratique 1

Ce projet simule un site e-commerce (TechShop) couplé à un serveur de suivi pour démontrer la collecte de données invisibles. L'objectif est de rendre observables des mécanismes de suivi banals, comme le **pixel de suivi** et la corrélation d'actions via un **identifiant de session**, suite à une interaction avec une bannière de consentement.

## Installation

Prérequis : Git, Docker et Docker Compose.

```
git clone https://github.com/PumpeDie/privacy-tracker
cd privacy-tracker
docker compose up --build
```

> Note : le flag `:z` dans `docker-compose.yml` est présent sur les chemins pour la compatibilité avec SELinux.

Pour accéder au site web : <http://localhost:8080>.

Les actions de l'utilisateur sont interceptées et journalisées par le serveur de suivi local (<http://localhost:5000>), et affichées dans la section "Console de suivi" en bas de la page web.

Pour voir l'action du pixel de suivi, on peut recharger la page.

## Données observées

## Implications

## Limites de la démonstration

## Scénarios de tests

