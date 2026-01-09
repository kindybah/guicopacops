
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, requireRole } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', auth, async (req,res)=>{
  if (req.user.role === 'partner' && req.user.partnerId){
    const p = await prisma.partner.findMany({ where: { id: req.user.partnerId }});
    return res.json(p);
  }
  return res.json(await prisma.partner.findMany({ orderBy: { name:'asc' } }));
});

router.post('/', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const data = req.body || {};
  const row = await prisma.partner.create({ data: {
    name: data.name,
    contact: data.contact || null,
    phone: data.phone || null,
    notes: data.notes || null,
    active: !!data.active
  }});
  res.json(row);
});

router.put('/:id', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const { id } = req.params;
  const data = req.body || {};
  const row = await prisma.partner.update({ where: { id }, data: {
    name: data.name,
    contact: data.contact ?? null,
    phone: data.phone ?? null,
    notes: data.notes ?? null,
    active: typeof data.active === 'boolean' ? data.active : undefined
  }});
  res.json(row);
});

router.delete('/:id', auth, requireRole('admin','dispatcher'), async (req,res)=>{
  const { id } = req.params;
  await prisma.partner.delete({ where: { id } });
  res.json({ ok:true });
});

export default router;
