
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Default: 70% of delivered revenue for each active driver.
 * Period is a string like "2026-W03" or "2026-01-07".
 */
export async function calculatePayouts(period){
  const drivers = await prisma.driver.findMany({ where: { active: true } });
  const created = [];

  for (const d of drivers){
    const orders = await prisma.order.findMany({
      where: {
        driverId: d.id,
        status: { in: ['DELIVERED_ON_TIME','DELIVERED_LATE'] }
      }
    });

    const revenue = orders.reduce((s,o)=> s + o.revenue, 0);
    const amount = revenue * 0.70;

    if (amount > 0){
      const row = await prisma.payout.create({
        data: { driverId: d.id, amount, period, status: 'PENDING' }
      });
      created.push(row);
    }
  }

  return created;
}
