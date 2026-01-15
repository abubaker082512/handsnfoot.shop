# React + Supabase E-Commerce Store – Project Specification

This `.md` file is for my AI code editor to generate a **fully functional e-commerce website** using **React + Supabase**. The store must include:

- A **banner slideshow Hero section**
- **Featured Products section**
- **Top Products section**
- **Individual Product Pages**
- **Shopping Cart**
- **Checkout Flow**
- **Order Summary**
- **Payment (Mock or Real)**
- **User Auth**
- **Admin Product Management**
- **About Us Page**
- Fully responsive and production ready

---

## 🚀 Tech Stack
- Frontend: **React + Vite**
- UI: **TailwindCSS**
- Backend: **Supabase**
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Storage: Supabase Storage (for product images)

---

## 📁 Project Structure
/src
├── components
│ ├── Navbar.jsx
│ ├── Footer.jsx
│ ├── HeroSlider.jsx
│ ├── ProductCard.jsx
│ ├── FeaturedProducts.jsx
│ ├── TopProducts.jsx
│ ├── CartDrawer.jsx
│
├── pages
│ ├── Home.jsx
│ ├── Products.jsx
│ ├── ProductDetails.jsx
│ ├── Cart.jsx
│ ├── Checkout.jsx
│ ├── OrderSuccess.jsx
│ ├── About.jsx
│ ├── Login.jsx
│ ├── Signup.jsx
│
├── context
│ ├── CartContext.jsx
│
├── supabase
│ ├── client.js
│
├── App.jsx
├── main.jsx



---

## 🗄️ Supabase Database Schema

### **products**
| Field | Type | Required |
|-------|------|----------|
| id | uuid | yes |
| name | text | yes |
| description | text | yes |
| price | numeric | yes |
| category | text | yes |
| rating | float | optional |
| stock | int | yes |
| featured | boolean | yes |
| top_product | boolean | yes |
| image | text | yes |
| created_at | timestamp | yes |

---

### **users**
(Managed by Supabase Auth)

---

### **orders**
| Field | Type |
|-------|------|
| id | uuid |
| user_id | uuid |
| order_items | json |
| total_price | numeric |
| status | text (pending / paid / shipped) |
| created_at | timestamp |

---

## 🧑‍💻 Core Functionalities

### 🏠 Home Page
- Hero Section with **slideshow banners**
- Featured Products Section
- Top Products Section
- CTA buttons → Shop Now

---

## 🛍 Product Pages
### Products Page
- Product grid
- Filters
- Search
- Pagination

### Product Details Page
- Product image
- Description
- Price
- Add to cart button

---

## 🛒 Cart System
- Add to cart
- Remove from cart
- Increase / decrease quantity
- Cart summary sidebar and full page

---

## 💳 Checkout Flow
Pages required:

1️⃣ Cart Page  
2️⃣ Checkout Page  
3️⃣ Order Summary  
4️⃣ Order Confirmation

Payment can be:

- Fake / Mock
OR
- Real payment integration (Stripe preferred)

---

## 👤 Authentication
- Login
- Signup
- Logout
- Persistent user session

---

## ⚙️ Admin Panel (Simple)
- Only accessible to admin user
- Add product
- Update product
- Delete product

---

## ℹ️ About Us Page
Must include:
- Brand Story
- Mission Statement
- Contact info

---

## 🎨 UI Requirements
- Clean Modern UI
- Fully Responsive
- Smooth animations
- Consistent theme

---

## ✅ Final Deliverables
- Fully Working React e-commerce site
- Connected to Supabase
- Can view products
- Can add to cart
- Complete checkout flow
- Orders stored in DB
- Authentication working
- Admin CRUD ready
- Fully responsive

---

## 🧪 Testing
- Test on Desktop + Mobile
- Test login
- Test adding products
- Test checkout
- Test orders

---

## 🎯 Final Goal
A **complete real e-commerce store** that is ready for deployment.

