
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, requireRole } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', auth, async (req,res)=>{
  // role filtering
  if (req.user.role === 'driver' && req.user.driverId){
    return res.json(await prisma.order.findMany({ where: { driverId: req.user.driverId }, orderBy:{ createdAt:'desc' } }));
  }
  if (req.user.role === 'partner' && req.user.partnerId){
    return res.json(await prisma.order.findMany({ where: { partnerId: req.user.partnerId }, orderBy:{ createdAt:'desc' } }));
  }
  return res.json(await prisma.order.findMany({ orderBy:{ createdAt:'desc' } }));
});

router.post('/', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const data = req.body || {};
  const row = await prisma.order.create({ data: {
    orderNo: data.orderNo || null,
    revenue: Number(data.revenue || 0),
    status: data.status,
    notes: data.notes || null,
    driverId: data.driverId || null,
    partnerId: data.partnerId || null
  }});
  res.json(row);
});

router.put('/:id', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const { id } = req.params;
  const data = req.body || {};
  const row = await prisma.order.update({ where: { id }, data: {
    orderNo: data.orderNo ?? null,
    revenue: typeof data.revenue === 'number' ? data.revenue : Number(data.revenue || 0),
    status: data.status,
    notes: data.notes ?? null,
    driverId: data.driverId ?? null,
    partnerId: data.partnerId ?? null
  }});
  res.json(row);
});

router.delete('/:id', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const { id } = req.params;
  await prisma.order.delete({ where: { id } });
  res.json({ ok:true });
});

export default router;
