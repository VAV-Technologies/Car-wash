// Sweep test rows from all phone namespaces used by the test suite.
import { db } from './_env.mjs';

const PREFIXES = ['628555100%', '628555200%', '628999%', '628123456789', '6288888%', '628555%'];

let totalBookings = 0, totalCustomers = 0;
for (const p of PREFIXES) {
  const filter = p.includes('%') ? { type: 'like', val: p } : { type: 'eq', val: p };
  const q = db.from('customers').select('id, phone');
  const { data: custs } = filter.type === 'like' ? await q.like('phone', filter.val) : await q.eq('phone', filter.val);
  for (const c of custs || []) {
    const { count: bc } = await db.from('bookings').delete({ count: 'exact' }).eq('customer_id', c.id);
    totalBookings += bc || 0;
  }
  const dq = db.from('customers').delete({ count: 'exact' });
  const { count: cc } = filter.type === 'like' ? await dq.like('phone', filter.val) : await dq.eq('phone', filter.val);
  totalCustomers += cc || 0;
}

console.log(`Cleanup: deleted ${totalBookings} bookings + ${totalCustomers} customers across test namespaces`);
