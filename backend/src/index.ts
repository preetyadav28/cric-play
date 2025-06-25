import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();
connectDB(); // ✅ Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
