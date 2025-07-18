import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { syncPlayer } from '../../utils/Utilities';

dotenv.config();
mongoose.connect(process.env.MONGO_URI!);

const syncPlayerData = async () => {
  console.log('🔁 Running 6-month sync job...');
  const result = await syncPlayer(25, 35);
  console.log('✅ Sync complete.');
  return result;
};

cron.schedule('*/10 * * * *', async () => {
  const result = await syncPlayerData();
  console.log('Sync result:', result);
});

console.log('📆 Cron job registered...');
