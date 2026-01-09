
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, requireRole } from '../middleware/auth.middleware.js';
import { calculatePayouts } from '../services/payout.service.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/generate', auth, requireRole('admin'), async (req,res)=>{
  const { period } = req.body || {};
  if (!period) return res.status(400).json({ message:'period is required' });
  const created = await calculatePayouts(period);
  res.json(created);
});

router.get('/', auth, requireRole('admin'), async (req,res)=>{
  const rows = await prisma.payout.findMany({ include: { driver: true }, orderBy: { createdAt:'desc' } });
  res.json(rows);
});

router.put('/:id/pay', auth, requireRole('admin'), async (req,res)=>{
  const { id } = req.params;
  const row = await prisma.payout.update({ where: { id }, data: { status:'PAID' } });
  res.json(row);
});

export default router;
