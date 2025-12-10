// pages/index.js
export default function Home() {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1>QiosPay Callback Listener</h1>
        <p>Endpoint: <code>/api/qiospay-callback</code></p>
        <p>Deploy this to Vercel and set <code>QIOS_API_KEY</code> & <code>QIOS_MERCHANT_CODE</code> in Environment Variables.</p>
      </main>
    );
  }
  