
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, requireRole } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', auth, async (req,res)=>{
  // admin/dispatcher can see all; driver sees self
  if (req.user.role === 'driver' && req.user.driverId){
    const d = await prisma.driver.findMany({ where: { id: req.user.driverId }});
    return res.json(d);
  }
  return res.json(await prisma.driver.findMany({ orderBy: { name:'asc' } }));
});

router.post('/', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const data = req.body || {};
  const row = await prisma.driver.create({ data: {
    name: data.name,
    phone: data.phone || null,
    vehicle: data.vehicle || null,
    area: data.area || null,
    photo: data.photo || null,
    active: !!data.active
  }});
  res.json(row);
});

router.put('/:id', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const { id } = req.params;
  const data = req.body || {};
  const row = await prisma.driver.update({ where: { id }, data: {
    name: data.name,
    phone: data.phone ?? null,
    vehicle: data.vehicle ?? null,
    area: data.area ?? null,
    photo: data.photo ?? null,
    active: typeof data.active === 'boolean' ? data.active : undefined
  }});
  res.json(row);
});

router.delete('/:id', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const { id } = req.params;
  await prisma.driver.delete({ where: { id } });
  res.json({ ok:true });
});

router.get('/:id/kpi', auth, async (req,res)=>{
  const { id } = req.params;
  if (req.user.role === 'driver' && req.user.driverId !== id) return res.status(403).json({ message:'Forbidden' });

  const orders = await prisma.order.findMany({ where: { driverId: id } });
  const delivered = orders.filter(o=> String(o.status).startsWith('DELIVERED'));
  const onTime = orders.filter(o=> o.status === 'DELIVERED_ON_TIME');

  res.json({
    totalOrders: orders.length,
    delivered: delivered.length,
    onTimeRate: delivered.length ? (onTime.length / delivered.length) : 0,
    revenue: delivered.reduce((s,o)=> s + o.revenue, 0)
  });
});

export default router;
