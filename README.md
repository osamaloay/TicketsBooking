# Event Ticketing System

## Overview

This project is a full-stack web application built using the MERN (MongoDB, Express.js, React.js, Node.js) stack, designed to provide a comprehensive online event ticketing system. Users can easily browse, search, and purchase tickets for various events, including concerts, sports games, theater shows, and more. The system incorporates robust user role management, event management, and a seamless ticket booking process.

## Project Objectives

* Implement complete CRUD (Create, Read, Update, Delete) operations for users, events, and bookings.
* Develop a responsive and interactive frontend and a scalable backend.
* Structure the project using a component-based design for maintainability.
* Integrate MongoDB for persistent data storage.
* Implement secure JWT-based authentication.

## User Roles

* **Standard User:**
    * Browse and search for events.
    * Book tickets.
    * View booking history.
* **Event Organizer:**
    * Create, update, and delete their own events.
* **System Admin:**
    * Manage all users and events.
    * Oversee the entire system.

## Project Features

### 🎟️ Homepage

* Displays a curated list of upcoming events with essential details: event name, date, location, and price.

### 📄 Event Details Page

* Provides comprehensive information about each event.
* Enables users to book tickets directly from the page.

### 🛒 Ticket Booking System

* Allows users to select ticket quantities and view real-time ticket availability.
* Facilitates a smooth checkout and booking confirmation process.

### 🔍 Search & Filter

* Enables users to search for events by name, category, date, or location.
* Offers filtering options for refined event discovery.

### 🏠 User Dashboard

* Displays a personalized view of booked tickets and event history.
* Allows users to track past and upcoming events.

### ⚙️ Admin Panel

* Provides event organizers with tools to add, update, and delete events.
* Provides Admins with tools to manage users and system.

### 🗄️ Database Integration

* Utilizes MongoDB with Mongoose ODM for efficient data storage of event details, bookings, and user information.
* Ensures data persistence and security.

## Technologies Used

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens)
* **Version Control:** Git & GitHub

## Setup & Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/osamaloay/TicketsBooking.git](https://www.google.com/search?q=https://github.com/osamaloay/TicketsBooking.git)
    cd TicketsBooking
    ```

2.  **Install backend dependencies:**

    ```bash
    npm install
    ```

3.  **Start the backend server:**

    ```bash
    npm run start
    ```

4.  **Navigate to the client directory:**

    ```bash
    cd client
    ```

5.  **Install frontend dependencies:**

    ```bash
    npm install
    ```

6.  **Start the frontend application:**

    ```bash
    npm run start
    ```

## Contributing

1.  **Fork the repository.**
2.  **Create a feature branch:**

    ```bash
    git checkout -b feature-your-feature-name
    ```

3.  **Commit your changes:**

    ```bash
    git commit -m "Add your feature description"
    ```

4.  **Push to GitHub:**

    ```bash
    git push origin feature-your-feature-name
    ```

5.  **Create a Pull Request.**


## License

This project is licensed under the MIT License