# Food Ordering Website

A modern food ordering website built with React and Node.js.

## Features
- User authentication
- Browse restaurants and menus
- Add items to cart
- Place orders
- Order tracking
- User reviews and ratings

## Tech Stack
- Frontend: React.js, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Project Structure
```
food-ordering/
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Restaurants
- GET /api/restaurants - Get all restaurants
- GET /api/restaurants/:id - Get restaurant details
- GET /api/restaurants/:id/menu - Get restaurant menu

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get user orders
- GET /api/orders/:id - Get order details

## Contributing
Feel free to submit issues and enhancement requests. 