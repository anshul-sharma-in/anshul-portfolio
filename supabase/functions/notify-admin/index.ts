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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { applicant_name, applicant_email, applicant_phone, applicant_experience, applicant_message, preferred_time } =
      await req.json()

    const preferredTimeRow = preferred_time
      ? `<tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Preferred Time</td>
          <td style="padding:10px 0;color:#fde047;font-size:15px;font-weight:600;">📅 ${new Date(preferred_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
        </tr>`
      : ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
    <div style="background:#0D7377;padding:24px 32px;">
      <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;text-transform:uppercase;">New Application</p>
      <h1 style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:700;">Mock Interview Request</h1>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;width:130px;vertical-align:top;">Name</td>
          <td style="padding:10px 0;color:#fff;font-size:15px;">${applicant_name}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Email</td>
          <td style="padding:10px 0;color:#fff;font-size:15px;">${applicant_email}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Phone</td>
          <td style="padding:10px 0;color:#fff;font-size:15px;">${applicant_phone ?? 'Not provided'}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Experience</td>
          <td style="padding:10px 0;color:#fff;font-size:15px;">${applicant_experience ?? 'Not specified'}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Message</td>
          <td style="padding:10px 0;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;white-space:pre-wrap;">${applicant_message ?? 'No message'}</td>
        </tr>
        ${preferredTimeRow}
      </table>
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
        <a href="https://anshulsharma.net/interview" style="display:inline-block;padding:10px 20px;background:#0D7377;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Review on Dashboard →</a>
      </div>
    </div>
    <div style="padding:16px 32px;background:rgba(255,255,255,0.03);text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">Sent from anshulsharma.net · Reply to this email to contact the applicant directly</p>
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
        to: [ADMIN_EMAIL],
        reply_to: applicant_email,
        subject: `New Interview Application — ${applicant_name}`,
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
