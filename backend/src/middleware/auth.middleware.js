
import jwt from 'jsonwebtoken';

export function auth(req,res,next){
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message:'No token' });
  try{
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch{
    return res.status(401).json({ message:'Invalid token' });
  }
}

export function requireRole(...roles){
  return (req,res,next)=>{
    if (!roles.includes(req.user.role)) return res.status(403).json({ message:'Forbidden' });
    next();
  };
}
