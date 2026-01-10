# 🏠 Room Finder Website

A modern web application that helps users find rental rooms and allows room owners to manage their listings.  
Built as part of an assignment using **Next.js** and **Supabase**, with a focus on clean UI, usability, and real-world features.

---

## 🚀 Live Demo

🔗 **Deployed Application:**  
https://room-finder-theta.vercel.app/

🔗 **GitHub Repository:**  
https://github.com/sudharsan-051006/Room-finder

---

## ✨ Features

### 👤 Room Finder (Viewer)
- Browse available rooms without login
- Search by **location** (priority)
- Filter by:
  - Price
  - Property type (1 BHK, 2 BHK, Bed, etc.)
  - Tenant preference (Bachelor, Family, Girls, Working)
- View multiple room images using an image carousel
- View owner contact details
- Pagination for better performance and UX
- Dark / Light mode support

---

### 🏠 Room Owner
- Email OTP (magic link) authentication
- Add new room listings
- Upload multiple images per room
- Edit existing room details
- Delete room listings
- View and manage only their own rooms via dashboard

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend / BaaS:** Supabase
  - Authentication (Email OTP)
  - Database (PostgreSQL)
  - Storage (Room Images)
- **Deployment:** Vercel

---

## 🔐 Authentication & Security

- Room owners authenticate using **email OTP** (no passwords).
- Viewers can access room listings without login.
- Ownership is enforced so that room owners can manage only their own listings.
- Public access is read-only.
- Image uploads are restricted to authenticated owners.
- Row-level access logic is validated through application behavior.

---

## 🧠 Design Decisions

- **No login for viewers** to keep browsing simple and frictionless.
- **Description field** added for extensibility, shown only in detailed view to keep cards clean.
- **Image carousel** used instead of separate pages for better UX.
- Avoided unnecessary features like reviews to keep scope aligned with requirements.

---

## 📌 Future Enhancements

- Reviews and ratings
- Saved/favorite rooms
- Owner profile details
- Advanced location filters (map view)

---

## 🧪 Local Setup

```bash
git clone https://github.com/sudharsan-051006/Room-finder.git
cd Room-finder
npm install
npm run dev
