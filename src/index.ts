import express from 'express';
import usersRoutes from './routes/users.routes';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import whatsappRoutes from './routes/whatsapp.routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5174", 
  "https://localhost:5174", 
  "http://localhost:3002", 
  "http://localhost:3008", 
  "http://10.230.139.174:5174/"
];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the origin is in the allowed list or is undefined (for non-browser requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    credentials: true, // Allow cookies and credentials
    
  })
);

app.use(express.json({ limit: "10mb" })); // Adjust the limit as needed
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

//Middleware for parsing form data
app.use(express.json()); // For parsing JSON request bodies
app.use(cookieParser()); // For parsing cookies

app.use(express.json());
app.use("/users", usersRoutes);   
app.use("/whatsapp", whatsappRoutes);


mongoose
  .connect("mongodb+srv://root:Cassandra12@cluster0.6uhtjk8.mongodb.net/SBC?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3002,'0.0.0.0', () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 