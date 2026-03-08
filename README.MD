# Krili — Backend

API REST pour la plateforme de location de matériel entre particuliers **Krili**.  
Développée avec Express.js (ESM), MongoDB/Mongoose, authentification JWT + Google OAuth 2.0, et paiements Stripe.

---

## Stack technique

| Outil                   | Version | Rôle                       |
| ----------------------- | ------- | -------------------------- |
| Node.js                 | 18      | Runtime                    |
| Express                 | 4       | Framework HTTP             |
| MongoDB + Mongoose      | 9       | Base de données NoSQL      |
| JWT (`jsonwebtoken`)    | 9       | Authentification stateless |
| Passport.js             | 0.7     | Google OAuth 2.0           |
| Bcryptjs                | 2.4     | Hachage des mots de passe  |
| Joi                     | 17      | Validation des entrées     |
| Nodemailer              | 7       | Envoi d'emails (SMTP)      |
| Stripe                  | 20      | Paiement en ligne          |
| dotenv                  | 16      | Variables d'environnement  |
| Vercel (`@vercel/node`) |         | Déploiement serverless     |

---

## Prérequis

- Node.js 18
- Une instance MongoDB (locale ou MongoDB Atlas)
- Compte Stripe (clés API)
- Application Google OAuth configurée (Client ID + Secret)
- Serveur SMTP pour les emails (Gmail, Brevo, etc.)

---

## Installation et démarrage

```bash
# Cloner le dépôt
git clone https://github.com/ahmedaitbella/krili-backend.git
cd krili-backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# puis éditer .env avec vos valeurs

# Démarrer en mode développement (nodemon)
npm run dev

# Démarrer en production
npm start
```

Le serveur démarre sur `http://localhost:3000`.

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=3000

# Base de données
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/krili

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire
JWT_REFRESH_SECRET=votre_secret_refresh_jwt_different_et_aleatoire

# Session (Passport)
SESSION_SECRET=votre_secret_session

# Google OAuth 2.0
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASSWORD=votre_mot_de_passe_application
SMTP_FROM_EMAIL=noreply@krili.ma

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend (utilisé dans les liens emails et CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Structure du projet

```text
src/
 app.js              # Configuration Express (CORS, sessions, routes)
 server.js           # Point d'entrée (connexion DB + écoute)
 config/
    database.js     # Connexion Mongoose
    env.js          # Export des variables d'environnement
    passport.js     # Stratégie Google OAuth
 controllers/        # Logique des requêtes HTTP (9 fichiers)
 services/           # Logique métier découplée (3 fichiers)
 models/             # Schémas Mongoose (5 modèles)
 routes/             # Définition des routes Express (9 fichiers)
 middlewares/
    auth.middleware.js   # Vérification JWT
    error.middleware.js  # Gestion centralisée des erreurs
 validations/        # Schémas de validation Joi (7 fichiers)
 utils/
     jwt.js          # Signature et vérification des tokens
     password.js     # Hachage et comparaison (bcrypt)
api/
 index.js            # Entrée serverless Vercel
```

---

## Modèles de données

### User

Champs clés : `name`, `firstName`, `lastName`, `email`, `password`, `phone`, `imageUrl`, `address` (ville + coords), `role` (`tenant` | `owner` | `both`), `googleId`, `isEmailVerified`, `otp`, `resetPasswordToken`, `rating`, `refreshTokenHash` (hash SHA-256 du refresh token courant)

### Equipment

Champs clés : `ownerId`, `name`, `description`, `category`, `pricePerDay`, `images[]`, `address` (ville + coords), `availabilityRanges[]`, `status`, `characteristics` (marque, année, état), `features[]`, `numberOfRentals`, `rating`

### Rental

Champs clés : `renterId`, `equipmentId`, `ownerId`, `startDate`, `endDate`, `numberOfDays`, `rentalAmount`, `depositAmount`, `totalAmount`, `stripeSessionId`, `paymentStatus`, `rentalStatus`, `qrCode`

### Evaluation

Champs clés : `locationId` (ref Rental), `evaluatorId`, `evaluateeId`, `rating` (1-5), `comment`, `type` (`tenant_to_owner` | `owner_to_tenant`)

### Favorite

Champs clés : `userId`, `equipmentIds[]`

---

## Référence API

Toutes les routes sont préfixées par `/api`.

### Authentification `/api/auth`

| Méthode | Route              | Auth | Description                          |
| ------- | ------------------ | ---- | ------------------------------------ |
| POST    | `/register`        |      | Créer un compte                                           |
| POST    | `/login`           |      | Connexion (retourne access token + refresh token)         |
| POST    | `/refresh`         |      | Renouveler l'access token via le refresh token            |
| POST    | `/logout`          | JWT  | Invalider le refresh token courant                        |
| POST    | `/forgot-password` |      | Demander un lien de réinitialisation                      |
| POST    | `/reset-password`  |      | Réinitialiser le mot de passe                             |
| POST    | `/change-password` | JWT  | Changer le mot de passe                                   |
| GET     | `/google`          |      | Initier OAuth Google                                      |
| GET     | `/google/callback` |      | Callback OAuth Google                                     |
| POST    | `/send-otp`        |      | Envoyer un code OTP par email                             |
| POST    | `/verify-otp`      |      | Vérifier le code OTP                                      |

### Utilisateurs `/api/users`

| Méthode | Route        | Auth | Description                      |
| ------- | ------------ | ---- | -------------------------------- |
| GET     | `/`          | JWT  | Lister tous les utilisateurs     |
| GET     | `/profile`   | JWT  | Profil de l'utilisateur connecté |
| PUT     | `/profile`   | JWT  | Modifier son profil              |
| GET     | `/search?q=` |      | Rechercher des utilisateurs      |
| GET     | `/:id`       | JWT  | Profil d'un utilisateur par ID   |
| PUT     | `/:id`       | JWT  | Modifier un utilisateur          |
| DELETE  | `/:id`       | JWT  | Supprimer un utilisateur         |

### Équipements `/api/equipments`

| Méthode | Route                       | Auth | Description                 |
| ------- | --------------------------- | ---- | --------------------------- |
| GET     | `/`                         |      | Lister tous les équipements |
| GET     | `/search?q=`                |      | Recherche textuelle         |
| GET     | `/nearby?lat=&lng=&radius=` |      | Équipements à proximité     |
| GET     | `/:id`                      |      | Détail d'un équipement      |
| POST    | `/`                         | JWT  | Créer une annonce                          |
| PUT     | `/:id`                      | JWT + Propriétaire | Modifier une annonce      |
| DELETE  | `/:id`                      | JWT + Propriétaire | Supprimer une annonce     |

### Locations `/api/rentals`

| Méthode | Route          | Auth | Description                         |
| ------- | -------------- | ---- | ----------------------------------- |
| POST    | `/`            | JWT  | Créer une location (vérification anti-chevauchement de dates) |
| GET     | `/`            | JWT  | Lister les locations                                          |
| GET     | `/:id`         | JWT  | Détail d'une location                                         |
| PUT     | `/:id`         | JWT + Propriétaire | Modifier une location                       |
| DELETE  | `/:id`         | JWT + Propriétaire | Supprimer une location                      |
| PATCH   | `/:id/payment` | JWT + Propriétaire | Mettre à jour le statut de paiement         |
| PATCH   | `/:id/status`  | JWT + Propriétaire | Mettre à jour le statut de location         |

### Évaluations `/api/evaluations`

| Méthode | Route           | Auth | Description                  |
| ------- | --------------- | ---- | ---------------------------- |
| POST    | `/`             | JWT  | Créer une évaluation         |
| GET     | `/`             | JWT  | Lister les évaluations       |
| GET     | `/user/:userId` | JWT  | Évaluations d'un utilisateur |
| GET     | `/:id`          | JWT  | Détail d'une évaluation      |
| PUT     | `/:id`          | JWT  | Modifier une évaluation      |
| DELETE  | `/:id`          | JWT  | Supprimer une évaluation     |

### Favoris `/api/favorites`

| Méthode | Route            | Auth | Description            |
| ------- | ---------------- | ---- | ---------------------- |
| GET     | `/:userId`       | JWT  | Liste des favoris      |
| POST    | `/add`           | JWT  | Ajouter un favori      |
| POST    | `/remove`        | JWT  | Retirer un favori      |
| POST    | `/toggle`        | JWT  | Basculer un favori     |
| DELETE  | `/:userId/clear` | JWT  | Vider tous les favoris |

### Paiements `/api/payments`

| Méthode | Route            | Auth             | Description                    |
| ------- | ---------------- | ---------------- | ------------------------------ |
| POST    | `/create-intent` | JWT              | Créer un PaymentIntent Stripe  |
| POST    | `/webhook`       | Stripe Signature | Webhook de confirmation Stripe |

---

## Authentification JWT

### Tokens email/mot de passe

- **Access token** signé avec `JWT_SECRET`, valide **15 minutes** — envoyé dans `Authorization: Bearer <token>`
- **Refresh token** signé avec `JWT_REFRESH_SECRET`, valide **7 jours** — retourné dans la réponse de `/login` et `/register`
- Le refresh token est haché en SHA-256 et stocké dans `user.refreshTokenHash` ; il est **rotatif** (nouveau token à chaque utilisation)
- Pour renouveler : `POST /api/auth/refresh` avec `{ refreshToken }` → retourne `{ token, refreshToken }`
- Pour déconnecter : `POST /api/auth/logout` (avec JWT) → invalide le hash en base
- Réponse type login/register : `{ user: { id, name, email, role }, token, refreshToken }`

### Tokens Google OAuth

- Token unique signé avec `JWT_SECRET`, valide **7 jours** (compatibilité backward)
- Pas de mécanisme de refresh pour les sessions Google

### Middleware `authorizeOwner`

Middleware de protection supplémentaire disponible après `verifyToken` :

```js
authorizeOwner(Model, ...ownerFields)
```

- Récupère la ressource par `req.params.id`
- Vérifie que `req.user.id` correspond à au moins l'un des champs `ownerFields`
- Retourne **403** si l'utilisateur n'est pas propriétaire, **404** si la ressource n'existe pas
- Appliqué sur les routes `PUT`/`DELETE` des équipements et `PUT`/`DELETE`/`PATCH` des locations

### Validation anti-chevauchement de dates

Lors de la création d'une location (`POST /api/rentals`), le backend vérifie l'absence de chevauchement :

- Requête MongoDB sur les locations actives (`rentalStatus` ≠ `cancelled` / `completed`)
- Critère : `startDate < endDate_demandé && endDate > startDate_demandé`
- Retourne **409** avec `{ message, conflictingRental: { startDate, endDate } }` si conflit détecté

## Flux Google OAuth

1. Frontend redirige vers `GET /api/auth/google`
2. Passport redirige vers la page de consentement Google
3. Google rappelle `GET /api/auth/google/callback`
4. Backend crée ou trouve l'utilisateur, génère un JWT
5. Redirection vers le frontend : `FRONTEND_URL/auth/google/callback?token=<jwt>&setup=1`

## Paiement Stripe

1. Frontend appelle `POST /api/payments/create-intent` avec `{ rentalId, amount }`
2. Backend crée un PaymentIntent et retourne `{ clientSecret, paymentIntentId }`
3. Frontend collecte les données de carte et confirme le paiement (Stripe.js)
4. Stripe envoie un événement `payment_intent.succeeded` au webhook
5. Backend met à jour le statut de paiement de la location en `paid`

---

## Déploiement (Vercel)

Le fichier `vercel.json` route toutes les requêtes vers `api/index.js` :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index.js" }]
}
```

S'assurer que toutes les variables d'environnement sont configurées dans les paramètres du projet Vercel.
