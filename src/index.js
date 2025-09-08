import dotenv from 'dotenv';
import express from 'express';
import db from './db.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customer.js';
import userRoutes from './routes/user.js';
import swaggerDocs  from "./swagger.js";
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';

const app = express();
app.use(express.json());
dotenv.config();

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/users', userRoutes);
app.use('/categories',categoryRoutes);
app.use('/products',productRoutes);



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
      console.log('Postgres not ready, retrying in 2s...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

start();
