
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/login', async (req,res)=>{
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message:'Email and password are required.' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message:'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message:'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role, driverId: user.driverId, partnerId: user.partnerId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { email: user.email, role: user.role, driverId: user.driverId, partnerId: user.partnerId }
  });
});

export default router;
