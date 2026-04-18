import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'anshulsharma155@gmail.com'
const FROM = 'interviews@anshulsharma.net'
const FROM_NAME = 'Anshul Sharma'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STATUS_COPY: Record<string, { label: string; color: string; icon: string; body: string }> = {
  approved: {
    label: 'Approved',
    color: '#22c55e',
    icon: '✅',
    body: "Great news! Your application has been approved. I'll follow up shortly with next steps.",
  },
  time_suggested: {
    label: 'Interview Time Suggested',
    color: '#3b82f6',
    icon: '📅',
    body: "I've reviewed your application and would like to schedule a mock interview with you.",
  },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify the caller is an authenticated Supabase user (admin)
  // Uses a direct REST call to avoid ES256 JWT local-verification bug in edge runtime
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
    },
  })
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { to_email, applicant_name, new_status, suggested_time } = await req.json()

    const copy = STATUS_COPY[new_status] ?? STATUS_COPY.approved
    const timeBlock = suggested_time
      ? `<div style="margin:20px 0;padding:16px 20px;background:rgba(59,130,246,0.1);border-left:3px solid #3b82f6;border-radius:4px;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Proposed Time</p>
          <p style="margin:0;color:#93c5fd;font-size:15px;font-weight:600;">${suggested_time}</p>
        </div>`
      : ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,sans-serif;">
  <div style="max-width:540px;margin:40px auto;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
    <div style="background:${copy.color};padding:24px 32px;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Mock Interview Update</p>
      <h1 style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:700;">${copy.icon} ${copy.label}</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.7;">Hi <strong style="color:#fff;">${applicant_name}</strong>,</p>
      <p style="margin:0 0 20px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;">${copy.body}</p>
      ${timeBlock}
      <p style="margin:20px 0 0;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;">
        If you have any questions, simply reply to this email and I'll get back to you.
      </p>
    </div>
    <div style="padding:16px 32px;background:rgba(255,255,255,0.03);text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">anshulsharma.net · Reply directly to this email for any questions</p>
    </div>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM}>`,
        to: to_email,
        reply_to: ADMIN_EMAIL,
        subject: `Mock Interview Update: ${copy.label} ${copy.icon}`,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
