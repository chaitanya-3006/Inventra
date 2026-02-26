# 📦 Inventra — Smart Inventory & Reservation Management System

## 🚀 Overview

**Inventra** is a modern inventory and reservation management platform designed to handle real-time stock tracking, safe reservation workflows, and scalable business operations.

The system ensures that inventory is never oversold by implementing **concurrency-safe stock locking**, automated reservation handling, and real-time availability tracking.

Inventra is built using a **scalable full-stack architecture** with a Next.js frontend and a NestJS backend, making it production-ready and easy to extend.

---

## ✨ Core Features

### ✅ Inventory Management

* Create and manage inventory listings
* Track total, reserved, and available stock
* Update inventory dynamically
* Structured item categorization

### 🔄 Real-Time Stock Tracking

* Live calculation of:

  * Total Stock
  * Reserved Stock
  * Available Stock
* Prevents overselling scenarios

### 🧾 Reservation System

* Reservation creation and validation
* Concurrency-safe stock locking
* Reservation confirmation workflow
* Reservation cancellation workflow
* Automatic expiration of unused reservations

### 🔐 Reliability & Safety

* Atomic inventory updates
* Backend validation layer
* Scalable service-based architecture
* Audit logging for tracking system actions

---

## 🏗️ Tech Stack

### Frontend

* **Next.js**
* React + TypeScript
* Tailwind CSS
* Server Side Rendering (SSR)
* API Integration

### Backend

* **NestJS**
* Node.js
* TypeScript
* REST APIs
* Dependency Injection Architecture

### Database & Storage

* MongoDB
* Cloudinary (image storage)
* Multer (file uploads)

---

## 🧩 System Architecture

```
Next.js (Frontend)
        ↓
 REST API Communication
        ↓
NestJS Backend (Controllers → Services → Database)
        ↓
MongoDB Database
```

### Backend Structure

* **Controllers** → Handle incoming requests
* **Services** → Business logic
* **Modules** → Feature separation
* **DTOs** → Data validation
* **Guards & Middleware** → Security & validation

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/inventra.git
cd inventra
```

---

### 2️⃣ Setup Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on:

```
http://localhost:3001
```

---

### 3️⃣ Setup Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create `.env` file inside backend:

```env
PORT=3001
MONGO_URI=your_mongodb_connection
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET=your_secret
```

---

## 🔄 Reservation Workflow

1. User selects inventory item
2. System checks available stock
3. Stock is temporarily locked
4. Reservation created
5. User confirms or cancels
6. If expired → stock automatically released

---

## 📋 Audit Log (Concept)

Inventra records important system actions such as:

* Inventory updates
* Reservation creation/cancellation
* Stock changes
* Expiration events

This improves debugging, monitoring, and accountability.

---

## 📈 Future Improvements

* Authentication & Role-Based Access
* Dashboard analytics
* WebSocket real-time updates
* Payment integration
* Notification system
* Microservice architecture

---

## 📸 Screenshots

*Add UI screenshots here*

---

## 🤝 Contribution

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## 📄 License

MIT License © Inventra

---

## 💡 Author

Built with ❤️ to create a scalable and reliable inventory system.
