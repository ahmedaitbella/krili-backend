# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register
- **POST** `/auth/register`
- **Body**: `{ name, email, password }`

### Login
- **POST** `/auth/login`
- **Body**: `{ email, password }`

### Google OAuth
- **GET** `/auth/google` - Redirect to Google login
- **GET** `/auth/google/callback` - OAuth callback

### OTP
- **POST** `/auth/send-otp` - Send OTP to email
  - Body: `{ email }`
- **POST** `/auth/verify-otp` - Verify OTP
  - Body: `{ email, otp }`

### TOTP/2FA
- **POST** `/auth/enable-totp` - Enable 2FA
  - Body: `{ email }`
- **POST** `/auth/verify-totp` - Verify TOTP token
  - Body: `{ email, token }`
- **POST** `/auth/disable-totp` - Disable 2FA
  - Body: `{ email }`

---

## User Endpoints

### Get All Users (Admin) 🔒
- **GET** `/users?role=tenant&page=1&limit=10`

### Get User by ID 🔒
- **GET** `/users/:id`

### Get Current User Profile 🔒
- **GET** `/users/profile`

### Update User Profile 🔒
- **PUT** `/users/profile`
- **Body**: `{ firstName, lastName, phone, imageUrl, address, role }`

### Update User (Admin) 🔒
- **PUT** `/users/:id`

### Delete User (Admin) 🔒
- **DELETE** `/users/:id`

### Search Users
- **GET** `/users/search?q=john&page=1&limit=10`

---

## Materiel Endpoints

### Get All Materiels
- **GET** `/materiels?category=camping&minPrice=10&maxPrice=100&city=Paris&status=available&page=1&limit=10`

### Get Materiel by ID
- **GET** `/materiels/:id`

### Search Materiels
- **GET** `/materiels/search?q=tent&page=1&limit=10`

### Get Nearby Materiels
- **GET** `/materiels/nearby?lat=48.8566&lng=2.3522&maxDistance=5000`

### Create Materiel 🔒
- **POST** `/materiels`
- **Body**:
```json
{
  "ownerId": "userId",
  "name": "Camping Tent",
  "description": "4-person tent",
  "category": "camping",
  "pricePerDay": 25,
  "images": ["url1", "url2"],
  "address": {
    "city": "Paris",
    "neighborhood": "Marais",
    "coords": { "lat": 48.8566, "lng": 2.3522 }
  },
  "characteristics": {
    "brand": "Quechua",
    "year": 2023,
    "condition": "like new"
  },
  "features": ["waterproof", "easy setup"]
}
```

### Update Materiel 🔒
- **PUT** `/materiels/:id`

### Delete Materiel 🔒
- **DELETE** `/materiels/:id`

---

## Rental Endpoints

### Get All Rentals 🔒
- **GET** `/rentals?renterId=userId&ownerId=userId&rentalStatus=confirmed&paymentStatus=paid&page=1&limit=10`

### Get Rental by ID 🔒
- **GET** `/rentals/:id`

### Create Rental 🔒
- **POST** `/rentals`
- **Body**:
```json
{
  "renterId": "userId",
  "equipmentId": "materielId",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05"
}
```

### Update Rental 🔒
- **PUT** `/rentals/:id`
- **Body**: `{ rentalStatus, paymentStatus, handoverDate, returnDate, renterComment, ownerComment }`

### Update Payment Status 🔒
- **PATCH** `/rentals/:id/payment`
- **Body**: `{ paymentStatus: "paid", stripeSessionId }`

### Update Rental Status 🔒
- **PATCH** `/rentals/:id/status`
- **Body**: `{ rentalStatus: "completed" }`

### Delete Rental 🔒
- **DELETE** `/rentals/:id`

---

## Evaluation Endpoints

### Get All Evaluations 🔒
- **GET** `/evaluations?evaluatorId=userId&evaluateeId=userId&type=tenant_to_owner&page=1&limit=10`

### Get Evaluation by ID 🔒
- **GET** `/evaluations/:id`

### Get User Evaluations 🔒
- **GET** `/evaluations/user/:userId`

### Create Evaluation 🔒
- **POST** `/evaluations`
- **Body**:
```json
{
  "locationId": "rentalId",
  "evaluatorId": "userId",
  "evaluateeId": "userId",
  "rating": 5,
  "comment": "Great renter!",
  "type": "owner_to_tenant"
}
```

### Update Evaluation 🔒
- **PUT** `/evaluations/:id`

### Delete Evaluation 🔒
- **DELETE** `/evaluations/:id`

---

## Favorite Endpoints

### Get User Favorites 🔒
- **GET** `/favorites/:userId`

### Add to Favorites 🔒
- **POST** `/favorites/add`
- **Body**: `{ userId, materialId }`

### Remove from Favorites 🔒
- **POST** `/favorites/remove`
- **Body**: `{ userId, materialId }`

### Toggle Favorite 🔒
- **POST** `/favorites/toggle`
- **Body**: `{ userId, materialId }`

### Clear All Favorites 🔒
- **DELETE** `/favorites/:userId/clear`

---

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

---

## Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found
- `500` Internal Server Error

---

## Categories
- `camping`
- `sports`
- `tools`
- `photography`
- `audio`
- `vehicles & bikes`
- `electronics`
- `other`

## Rental Status
- `confirmed`
- `ongoing`
- `completed`
- `cancelled`

## Payment Status
- `pending`
- `paid`
- `refunded`

## Evaluation Types
- `tenant_to_owner`
- `owner_to_tenant`
