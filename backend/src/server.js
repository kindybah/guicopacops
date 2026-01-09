import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import driversRoutes from './routes/drivers.routes.js';
import partnersRoutes from './routes/partners.routes.js';
import payoutsRoutes from './routes/payouts.routes.js';
import metaRoutes from './routes/meta.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // allows base64 driver photo in demo

app.get('/health', (_,res)=> res.json({ ok:true, service:'guicopac-ops-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/meta', metaRoutes);

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log(`Guicopac Ops API running on :${port}`));
