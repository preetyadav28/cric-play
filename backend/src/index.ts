import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import teamRoutes from './routes/team.routes';

dotenv.config();
connectDB(); // ✅ Connect to MongoDB

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.use('/api/teams', teamRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
