# HandsnFoot E-Commerce Store

A modern, full-featured e-commerce platform for luxury watches and premium footwear built with React, Vite, TailwindCSS, and Supabase.

## 🚀 Features

- **Modern UI/UX**: Premium design with smooth animations and responsive layouts
- **Product Management**: Browse, search, filter, and sort products
- **Shopping Cart**: Add/remove items, update quantities with persistent storage
- **Checkout Flow**: Complete checkout process with mock payment gateway
- **User Authentication**: Sign up, login, and user session management
- **Admin Dashboard**: Full CRUD operations for product management
- **Hero Slider**: Auto-rotating banner slideshow
- **Featured & Top Products**: Curated product sections
- **Product Details**: Detailed product pages with related products
- **Order Confirmation**: Order success page with order details

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend)

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd d:\handnfoot.shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials (see SUPABASE_SETUP.md)
   ```bash
   cp .env.example .env
   ```

4. **Configure Supabase**
   - Follow the instructions in `SUPABASE_SETUP.md` to set up your database

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── HeroSlider.jsx
│   ├── ProductCard.jsx
│   ├── FeaturedProducts.jsx
│   ├── TopProducts.jsx
│   └── CartDrawer.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetails.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── OrderSuccess.jsx
│   ├── About.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Admin.jsx
├── context/            # React Context providers
│   ├── CartContext.jsx
│   └── AuthContext.jsx
├── supabase/           # Supabase client
│   └── client.js
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API

## 🔑 Admin Access

To access the admin dashboard:
1. Sign up with the email: `admin@handsnfoot.shop`
2. Or modify the `isAdmin()` function in `src/context/AuthContext.jsx`

## 📦 Mock Data

The application includes mock product data for development and testing. Once Supabase is configured, the app will automatically switch to using the database.

## 🌐 Deployment

This project can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Make sure to set your environment variables in your deployment platform.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, contact: info@handsnfoot.shop
