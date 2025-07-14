# 🏡 Student Housing Platform – Backend API

A full-featured backend system for a **Student Housing Platform**, built using **Node.js**, **Express**, and **MongoDB**.  
This API enables college students to discover and book verified housing units near their universities while allowing property owners to manage their listings and appointments.

---

## 🚀 Project Overview

The platform connects **students** looking for off-campus housing with **property owners** offering verified units for rent.

### 🎓 Students can:

- Browse available verified units
- Book appointments to view units
- Save units to their favorites
- Leave reviews after visiting a unit
- Register using email/password or Google OAuth

### 🧑‍💼 Property owners can:

- Add housing units with required documents
- Manage their own units
- Approve or reject appointment requests
- View reviews left by students

### 🛡️ Admins can:

- Manage all users and units
- Approve/reject unit verification requests
- Moderate the platform

---

## 🧠 Core Technologies

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT Authentication** + **Google OAuth (Passport)**
- **Multer** + **Sharp** + **Cloudinary** for file uploads
- **Email Verification** with token system

---

## 📁 Folder Structure

```
.
├── controllers/
├── models/
├── routes/
├── utils/
├── middlewares/
├── app.js
└── server.js
```

---

## 🧩 Mongoose Schemas

### 🔸 User

```js
{
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  verified: { type: Boolean, default: false },
  favorites: [ObjectId],
}
```

### 🔸 Unit

```js
{
  title: String,
  description: String,
  price: Number,
  address: {
    city: String,
    area: String,
    street: String,
  },
  images: [String],
  documents: {
    electricityBill: String,
    titleDeed: String,
    idCard: String
  },
  owner: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'deleted'], default: 'pending' },
  isVerified: { type: Boolean, default: false }
}
```

### 🔸 Appointment

```js
{
  unit: { type: ObjectId, ref: 'Unit' },
  user: { type: ObjectId, ref: 'User' },
  date: Date,
  status: { type: String, enum: ['pending', 'confirmed', 'refused', 'cancelled'], default: 'pending' }
}
```

### 🔸 Review

```js
{
  unit: { type: ObjectId, ref: 'Unit' },
  user: { type: ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}
```

### 🔸 Request (Admin)

```js
{
  user: { type: ObjectId, ref: 'User' },
  unit: { type: ObjectId, ref: 'Unit' },
  type: { type: String, enum: ['unitVerification'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: String
}
```

---

## 🧭 API Routes

### 🧑‍🎓 `/api/users`

- `POST /signup` – Sign up
- `POST /login` – Login with email
- `GET /login/google` – Google login
- `PATCH /updateMe` – Update profile
- `PATCH /updateMyPassword` – Change password
- `POST /forgotPassword` – Send reset token
- `PATCH /resetPassword/:token` – Reset password
- `POST /favorites` – Add unit to wishlist
- `GET /favorites` – Get wishlist
- `DELETE /favorites` – Remove from wishlist
- `GET /my-requests` – View my submitted requests
- `GET /` – Admin: Get all users

---

### 🏠 `/api/units`

- `POST /` – Add a unit with documents
- `GET /` – Browse all verified units
- `GET /:unitId` – Get a specific unit
- `PATCH /:unitId` – Edit own unit
- `DELETE /:unitId` – Delete own unit
- `GET /my-units` – Get units owned by logged-in user

---

### 📅 `/api/units/:unitId/appointments`

- `POST /` – Book an appointment
- `PATCH /:appointmentId/confirm` – Owner confirms
- `PATCH /:appointmentId/refuse` – Owner refuses
- `PATCH /:appointmentId/cancel` – User cancels
- `GET /` – Owner: view all appointments on a unit

---

### ✍️ `/api/units/:unitId/reviews`

- `POST /` – Add review (if user has visited)
- `GET /` – List reviews
- `PATCH /:reviewId` – Edit review
- `DELETE /:reviewId` – Remove review

---

### 🛡 `/api/admin`

- `GET /units` – List all units
- `GET /users` – List all users
- `GET /requests` – View unit verification requests
- `PATCH /units/:id/status` – Approve/suspend/delete unit
- `PATCH /users/:id/status` – Change user status
- `PATCH /requests/:id` – Approve/reject requests

---

## 🔐 Access Control

| Route                  | Access        |
| ---------------------- | ------------- |
| `/users/*`             | Public / Auth |
| `/units` (POST, PATCH) | Auth + Owner  |
| `/appointments`        | Auth          |
| `/admin/*`             | Admin only    |

---

## 📌 Indexing Strategy

| Collection    | Indexed Fields                  |
| ------------- | ------------------------------- |
| `User`        | `email` (unique)                |
| `Unit`        | `owner`, `status`, `isVerified` |
| `Appointment` | `user`, `unit`, `status`        |
| `Review`      | Compound index on `user + unit` |
| `Request`     | `user`, `status`                |

---

## 📬 Email & File Handling

- **Email verification & password reset** via token
- **File uploads** via Multer → resized using Sharp → stored on Cloudinary
- Uploadable files:
  - Housing images
  - Electricity bill
  - Title deed
  - ID card

---

## 🛠 Setup Instructions

```bash
git clone https://github.com/your-username/student-housing-api.git
cd student-housing-api
npm install
```

Create a `.env` file with:

```
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
```

Run the server:

```bash
npm run dev
```

---

## ✨ Future Improvements

- Notifications (email/SMS) for appointment changes
- Chat between student and unit owner
- University geolocation + map filtering
- Admin dashboard UI

---

## 📌 Notes

- The project does **not** use any background scheduler
- All appointment logic is **user-triggered and real-time**
- Written in **modular structure** for easy scaling

---

## 👨‍💻 Author

Made with 💻 by **Ahmed Shehab**
