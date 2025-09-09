import dotenv from 'dotenv';
import express from 'express';
import db from './db.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customer.js';
import userRoutes from './routes/user.js';
import swaggerDocs  from "./swagger.js";
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';
import productImageRoutes from './routes/product_images.js';
import paymentRoutes from './routes/payments.js';
import cors from 'cors';

const app = express();
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  } 
));
dotenv.config();

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/users', userRoutes);
app.use('/categories',categoryRoutes);
app.use('/products',productRoutes);
app.use('/product-images',productImageRoutes);
app.use('/payments',paymentRoutes);

const start = async () => {
  const port = process.env.PORT || 3005;
  while (true) {
    try {
      await db.query('SELECT 1');
      console.log('Connected to Postgres.');
      swaggerDocs(app, port);
      app.listen(port, () =>
        console.log(`Server listening at http://localhost:${port}`)
      );
      break;
    } catch (err) {
      console.log("ERRROR>>",err);
      console.log('Postgres not ready, retrying in 2s...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

start();
