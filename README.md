# Event Ticketing System

## Overview

This project is a **MERN stack** web application for an **online event ticketing system**. Users can browse, search, and purchase tickets for various events such as concerts, sports games, theater shows, and more. The system supports multiple user roles, event management, and a ticket booking system.

## Project Objectives

- Implement **CRUD operations** for users, events, and bookings.
- Develop a **functional and interactive** frontend and backend.
- Structure the project using **component-based design**.
- Integrate a **MongoDB database** for data persistence.

## User Roles

1. **Standard User:** Can browse events, book tickets, and view their booking history.
2. **Event Organizer:** Can create, update, and delete their own events.
3. **System Admin:** Has full control over the system, including managing users and events.

## Project Features

### 🎟️ Homepage

- Displays a list of upcoming events with details like **event name, date, location, and price**.

### 📄 Event Details Page

- Provides **detailed information** about each event.
- Users can **book tickets** directly from this page.

### 🛒 Ticket Booking System

- Users can **select ticket quantity** and view ticket availability.
- Checkout and booking confirmation process.

### 🔍 Search & Filter

- Users can search for events by **name, category, date, or location**.
- Filtering options for better event discovery.

### 🏠 User Dashboard

- Displays **booked tickets and event history**.
- Users can track their past and upcoming events.

### ⚙️ Admin Panel

- Allows **event organizers** to add, update, and delete events.
- **Admins** can manage users and oversee the entire system.

### 🗄️ Database Integration

- **MongoDB** is used to store event details, bookings, and user information.
- Ensures **data persistence and security**.

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT-based authentication
- **Version Control:** Git & GitHub

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/osamaloay/TicketsBooking.git
   cd event-ticketing-system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. Start the frontend:
   ```bash
   cd client
   npm start
   ```

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit changes:
   ```bash
   git commit -m "Added a new feature"
   ```
4. Push to GitHub and create a Pull Request.

## License

This project is licensed under the **MIT License**.



