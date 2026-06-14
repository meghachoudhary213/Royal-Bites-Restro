# Royal Bites

A premium full-stack restaurant automation website with luxury sunset glassmorphism design.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB

## Features

- Premium landing page with glassmorphism UI
- Menu showcase with glass cards
- Table booking form (saved to MongoDB)
- Order inquiry form (saved to MongoDB)
- Floating chatbot (menu, booking, timing, order status, WhatsApp)
- Floating WhatsApp button with pre-filled message
- Admin dashboard for bookings & inquiries
- Fully responsive design

## Folder Structure

```
RoyalBites/
├── client/                          # React frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js               # API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Glassmorphism navbar
│   │   │   ├── Hero.jsx             # Hero section
│   │   │   ├── Menu.jsx             # Menu glass cards
│   │   │   ├── BookingForm.jsx      # Table booking
│   │   │   ├── InquiryForm.jsx      # Order inquiry
│   │   │   ├── Chatbot.jsx          # Floating chatbot
│   │   │   ├── WhatsAppButton.jsx   # WhatsApp CTA
│   │   │   └── Footer.jsx
│   │   ├── data/
│   │   │   └── menu.js              # Menu & restaurant data
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   └── AdminDashboard.jsx   # Admin panel
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                          # Express backend
│   ├── models/
│   │   ├── Booking.js
│   │   └── Inquiry.js
│   ├── routes/
│   │   ├── bookings.js
│   │   ├── inquiries.js
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── package.json                     # Root scripts
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas connection string)

## Setup

1. **Install dependencies**

```bash
cd RoyalBites
npm install
cd client && npm install
cd ../server && npm install
```

2. **Configure environment**

Copy `server/.env.example` to `server/.env` and update:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/royal-bites
ADMIN_PASSWORD=royalbites2026
WHATSAPP_NUMBER=1234567890
```

3. **Start MongoDB** (if running locally)

4. **Run the app**

```bash
# From root — runs both client & server
npm run dev
```

Or separately:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

## URLs

| Page | URL |
|------|-----|
| Website | http://localhost:5173 |
| Admin Dashboard | http://localhost:5173/admin |
| API Health | http://localhost:5000/api/health |

## Admin Access

- **URL:** `/admin`
- **Default password:** `royalbites2026` (set via `ADMIN_PASSWORD` in `.env`)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | List bookings |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete booking |
| POST | `/api/inquiries` | Create inquiry |
| GET | `/api/inquiries` | List inquiries |
| PATCH | `/api/inquiries/:id/status` | Update inquiry status |
| DELETE | `/api/inquiries/:id` | Delete inquiry |
| POST | `/api/auth/login` | Admin login |

## Design Theme

- **Colors:** Deep navy, sunset orange, golden yellow, soft pink, warm cream
- **Style:** Glassmorphism, luxury sunset gradients, premium typography (Playfair Display + Inter)

## License

MIT
