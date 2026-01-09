
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, requireRole } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/company', auth, async (req,res)=>{
  const meta = await prisma.meta.findUnique({ where: { id:'singleton' } });
  res.json(meta?.company || {});
});

router.put('/company', auth, requireRole('admin'), async (req,res)=>{
  const data = req.body || {};
  const meta = await prisma.meta.upsert({
    where: { id:'singleton' },
    update: { company: data },
    create: { id:'singleton', company: data, targets: {} }
  });
  res.json(meta.company);
});

router.get('/targets', auth, async (req,res)=>{
  const meta = await prisma.meta.findUnique({ where: { id:'singleton' } });
  res.json(meta?.targets || {});
});

router.put('/targets', auth, requireRole('admin'), async (req,res)=>{
  const data = req.body || {};
  const meta = await prisma.meta.upsert({
    where: { id:'singleton' },
    update: { targets: data },
    create: { id:'singleton', company: {}, targets: data }
  });
  res.json(meta.targets);
});

export default router;
