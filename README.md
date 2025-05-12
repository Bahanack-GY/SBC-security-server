# Secure Canal Backend

## Overview
This is a Node.js/Express backend application that provides API endpoints for user management and WhatsApp messaging. It uses MongoDB for data storage and integrates with a WhatsApp client service.

## Features
- **User Management**: Create, login, and manage admin users.
- **Link Management**: Create, edit, delete, and retrieve links.
- **WhatsApp Integration**: Send messages via WhatsApp.

## API Endpoints
### User Routes
- `POST /users/admin/create` - Create an admin user
- `POST /users/admin/login` - Login as an admin
- `POST /users/create-link` - Create a new link
- `PUT /users/edit-link/:id` - Edit an existing link
- `DELETE /users/delete-link/:id` - Delete a link
- `GET /users/get-links` - Retrieve all links
- `GET /users/get-link/:code/:phone` - Retrieve a specific link

### WhatsApp Routes
- `GET /whatsapp` - Hello World endpoint
- `POST /whatsapp/sendMessage` - Send a WhatsApp message

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd secure-canal-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3002
   MONGODB_URI=mongodb+srv://root:Cassandra12@cluster0.6uhtjk8.mongodb.net/SBC?retryWrites=true&w=majority&appName=Cluster0
   ```

4. **Run the server**:
   ```bash
   npm start
   ```

## Usage
- The server runs on port 3002 by default.
- Ensure MongoDB is running and accessible.
- Use the provided API endpoints to interact with the application.

## License
This project is licensed under the MIT License. 