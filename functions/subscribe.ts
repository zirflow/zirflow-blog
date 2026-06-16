export interface Env {
  N8N_WEBHOOK_URL: string;
  RESEND_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        '<!doctype html><html><body style="font-family:sans-serif;padding:40px;background:#07090f;color:#f3f5fa"><h1>邮箱格式不正确</h1><p>请返回重试。</p><a href="/" style="color:#4d8dff">← 返回首页</a></body></html>',
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 1. Send welcome email via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Zirflow Blog <blog@zirflow.com>',
          to: [email],
          subject: '欢迎订阅 Zirflow Blog！',
          text: '感谢你的订阅！\n\n我是 Zirflow 团队。你以后会在第一时间收到我们的最新文章——珠三角企业 AI 自动化落地的真实案例和实战经验。\n\n这是我们的第一封信，后续内容会陆续发送。如果你想进一步了解 Zirflow 如何帮你跑通业务，随时回复这封邮件。\n\nZirflow 臻孚科技\nhttps://zirflow.com',
        }),
      });
    } catch (emailErr) {
      console.error('Welcome email error (non-fatal):', emailErr);
    }

    // 2. Call n8n webhook (stores subscriber in Baserow)
    try {
      await fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog.zirflow.com' }),
      });
    } catch (n8nErr) {
      console.error('n8n webhook error (non-fatal):', n8nErr);
    }

    // Return success page
    return new Response(
      `<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>订阅成功 · Zirflow Blog</title>
<style>body{font-family:'Inter',sans-serif;padding:60px 20px;background:#07090f;color:#f3f5fa;text-align:center}h1{font-size:28px;margin-bottom:12px;color:#f3f5fa}p{color:#c4cbd9;max-width:400px;margin:0 auto 24px;line-height:1.6}.btn{display:inline-block;padding:12px 24px;border-radius:8px;background:linear-gradient(135deg,#4d8dff,#2a6cf0);color:#fff;text-decoration:none;font-weight:600}</style></head>
<body>
<h1>✓ 订阅成功！</h1>
<p>欢迎邮件已发送到你的邮箱，请查收。</p>
<p style="color:var(--muted);font-size:14px;margin-bottom:24px">Zirflow 团队会在有新的自动化案例和实战内容时第一时间通知你。</p>
<a href="/" class="btn">← 回到博客</a>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err) {
    console.error('Subscribe handler error:', err);
    return new Response(
      '<!doctype html><html><body style="font-family:sans-serif;padding:40px;background:#07090f;color:#f3f5fa"><h1>出错了</h1><p>请稍后重试或邮件联系 hi@zirflow.com</p><a href="/" style="color:#4d8dff">← 返回首页</a></body></html>',
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
};
