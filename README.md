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

Pour voir l'action du pixel de suivi dans les logs, on peut recharger la page.

## Données observées

On collecte plusieurs données, selon les actions effectuées.

***

Tout d'abord, le pixel de suivi se charge automatiquement et permet d'obtenir l'adresse IP de l'utilisateur, ainsi que son `user-agent`. Par exemple :

```json
{
    "cookies": {},
    "event": "Chargement Pixel",
    "ip_address": "172.24.0.1",
    "timestamp": "2026-02-27T20:38:08.389405",
    "url_params": {
        "page": "accueil"
    },
    "user_agent": "Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0"
}
```

Ensuite, le fait d'accepter les cookies créer un identifiant unique, et permet de stocker des informations sur l'utilisateur, ici simplement un `tracker_id` et une adresse IP :

```json
{
    "cookies": {},
    "details": {
        "action": "Consentement Accepté",
        "tracker_id": "user_43z4ke6zc"
    },
    "event": "Consentement Accepté",
    "ip_address": "172.24.0.1",
    "timestamp": "2026-02-27T20:28:28.361896"
}
```

En refusant les cookies, on a simplement l'adresse IP et un profil type :

```json
{
    "cookies": {},
    "details": {
        "action": "Consentement Refusé",
        "tracker_id": "profil_anonyme"
    },
    "event": "Consentement Refusé",
    "ip_address": "172.24.0.1",
    "timestamp": "2026-03-02T02:10:32.556638"
}
```

Enfin, nous pouvons traquer une activité spécifique au service d'achat (dans notre cas), avec les ajouts au panier par exemple, et les associer au profil de l'utilisateur, selon son consentement :

```json
{
    "cookies": {},
    "details": {
        "action": "Ajout Panier",
        "price": "449.99",
        "product": "Tablette Tab 10\"",
        "tracker_id": "user_43z4ke6zc"
    },
    "event": "Ajout Panier",
    "ip_address": "172.24.0.1",
    "timestamp": "2026-02-27T20:28:35.718576"
}
```

## Implications

Les données collectées et les mécanismes mis en place illustrent les concepts suivants :

- **Profilage :** La collecte passive de l'adresse IP et du `user-agent` permet de déduire l'environnement de l'utilisateur (navigateur, système d'exploitation) de manière invisible, dès l'ouverture de la page.
- **Corrélation :** La génération d'un `tracker_id` permet de relier des actions apparemment indépendantes (clics, ajouts de multiples produits au panier) à une seule et même entité. Le comportement d'achat est ainsi reconstruit.
- **Suivi dans le temps :** L'identifiant est stocké localement dans le navigateur. Lors des visites ultérieures, les nouvelles actions sont rattachées au profil existant, illustrant la persistance de la collecte.

## Limites de la démonstration

Cette application est un simulateur fonctionnant entièrement en local. Contrairement à un environnement réel, aucune donnée n'est envoyée vers des services tiers externes. Le suivi inter-sites (cross-site tracking), qui permet de pister un utilisateur d'un site web à un autre via des cookies tiers, n'est pas implémenté ici.

De plus, davantage de données pourraient être reccueillies, comme les articles survolés par la souris, et donc l'intérêt potentiel de l'utilisateur.

## Correction

Pour le pixel de suivi, une extension de blocage de requêtes, comme [uBlock origin](https://ublockorigin.com/), permet de bloquer efficacement tout suivi.

Pour les cookies, on peut considérer deux approches distinctes, en gardant en tête qu'on veut limiter le suivi :

1. On refuse simplement les cookies via la banière. Dans notre cas, aucun cookie n'est stocké, mais certains sites peuvent stocker des cookies de fonctionnement minimal, même en refusant dans la banière. De plus, refuser les cookies de tous les sites peut être long et prenant, ce qui nous amène à la seconde approche.
2. Accepter tous les cookies, peut-être automatiquement (par exemple avec [I still don't care about cookies](https://github.com/OhMyGuus/I-Still-Dont-Care-About-Cookies)), et supprimer tous les cookies automatiquement à la fermeture du navigateur. L'inconvénient est que si la session reste ouverte longtemps, ou que les cookies inter-sites sont utilisés, on peut quand même être profilé, si notre adresse IP et notre `user-agent` sont corrélés.

## Scénarios de tests

> **Pré-requis** : le pixel de suivi est désactivé par les bloqueurs de requêtes, il faut les désactiver pour observer son action dans les logs.

Ces scénarios permettent de générer et de comparer des comportements observables.

### Scénario 1 : Collecte passive sans interaction

1. Lancer le docker et ouvrir <http://localhost:8080>.
2. Ne cliquer sur aucun bouton de la bannière.
3. Rafraîchir les logs dans la console en bas de page.
4. **Observation :** L'événement `Chargement Pixel` est enregistré avec l'adresse IP et le User-Agent, prouvant la collecte de données avant tout consentement.

### Scénario 2 : Consentement et corrélation de profil

1. Cliquer sur "Accepter le suivi" dans la bannière.
2. Ajouter le "Laptop Pro 15"" au panier.
3. Ajouter la "Tablette Tab 10"" au panier.
4. Rafraîchir les logs.
5. **Observation :** L'événement `Consentement Accepté` génère un identifiant unique (ex: `user_43z4ke6zc`). Les événements `Ajout Panier` partagent tous cet identifiant exact. Les actions sont corrélées, et l'entreprise pourrait par exemple afficher des prix différents selon l'utilisateur et son comportement.

### Scénario 3 : Refus de consentement et anonymisation

1. Effacer le stockage local du navigateur (ou utiliser une fenêtre de navigation privée).
2. Recharger la page.
3. Cliquer sur "Refuser" dans la bannière.
4. Ajouter un produit au panier.
5. Rafraîchir les logs.
6. **Observation :** En comparaison au scénario précédent, l'action d'ajout est bien enregistrée, mais le `tracker_id` est assigné à la valeur `profil_anonyme`. La corrélation précise du profil est bloquée.
