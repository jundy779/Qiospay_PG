// api/qiospay-callback.js
// Next.js API Route - Vercel serverless
export default async function handler(req, res) {
    if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }
    
    
    try {
    const body = req.body || {};
    
    
    // Env vars (set di Vercel dashboard)
    const EXPECTED_API_KEY = process.env.QIOS_API_KEY || '';
    const EXPECTED_MERCHANT = process.env.QIOS_MERCHANT_CODE || '';
    
    
    // Prefer header x-api-key (or Authorization: Bearer <key>)
    const headerApiKey = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, '')) || '';
    
    
    let verified = false;
    if (headerApiKey && EXPECTED_API_KEY) {
    verified = headerApiKey === EXPECTED_API_KEY;
    } else {
    // Fallback: check merchant_code or api_key in body
    if ((body.merchant_code && EXPECTED_MERCHANT && body.merchant_code === EXPECTED_MERCHANT) || (body.api_key && EXPECTED_API_KEY && body.api_key === EXPECTED_API_KEY)) {
    verified = true;
    }
    }
    
    
    if (!verified) {
    console.warn('QiosPay callback: verification failed', { headerApiKey: !!headerApiKey, merchant: body.merchant_code || null });
    return res.status(401).json({ status: 'unauthorized' });
    }
    
    
    // Extract fields (adapt to the live payload you get)
    const orderRef = body.order_id || body.reference || body.buyer_reff || null;
    const amount = parseInt(body.amount || 0, 10);
    const statusRaw = (body.status || body.type || '').toString().toUpperCase();
    const status = (statusRaw === 'CR' || statusRaw === 'PAID') ? 'PAID' : (statusRaw === 'DB' || statusRaw === 'REFUND') ? 'DEBIT' : (body.payment_status || '').toUpperCase() || 'UNKNOWN';
    const qrisRef = body.payment_reference || body.issuer_reff || null;
    const timestamp = body.date || new Date().toISOString();
    
    
    console.log('QiosPay callback verified:', { orderRef, amount, status, qrisRef, timestamp });
    
    
    // ====== IDEMPOTENCY (example pseudo-logic) ======
    // TODO: replace with real DB calls (Supabase, Postgres, Mongo, etc.)
    // const existing = await DB.getOrderByRef(orderRef);
    // if (existing && existing.status === 'PAID') return res.status(200).json({ status: 'ok', note: 'already_paid' });
    // if (existing && existing.amount && existing.amount !== amount) { await DB.logMismatch(...); return res.status(400).json({ status: 'error', message: 'amount_mismatch' }); }
    // await DB.updateOrderStatus(orderRef, { status: 'PAID', amount, qrisRef, paidAt: timestamp });
    
    
    // If processing heavy tasks, push to background queue then return 200 immediately.
    
    
    return res.status(200).json({ status: 'ok' });
    } catch (err) {
    console.error('QiosPay callback error:', err);
    return res.status(500).json({ status: 'error', message: 'internal_server_error' });
    }
    }