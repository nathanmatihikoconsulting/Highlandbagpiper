export function emailClientVerification(code: string) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2 style="margin:0 0 10px 0">Your verification code</h2>
    <p>Use this code to send your enquiry:</p>
    <p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p>
    <p style="color:#555">This code expires in 15 minutes.</p>
    <hr />
    <p style="color:#777;font-size:12px">Highland Bagpiper — Find a trusted Highland bagpiper for ceremonies and events.</p>
  </div>`;
}

export function emailPiperNotification(enquiry: any, piper: any) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2 style="margin:0 0 10px 0">New enquiry</h2>
    <p><b>Event:</b> ${enquiry.eventType}</p>
    <p><b>Date:</b> ${enquiry.eventDate} &nbsp; <b>Time:</b> ${enquiry.eventTime}</p>
    <p><b>Location:</b> ${enquiry.location}</p>
    <p><b>Client:</b> ${enquiry.clientName} &nbsp; (${enquiry.clientEmail}, ${enquiry.clientPhone})</p>
    <hr />
    <p><b>Message</b></p>
    <p style="white-space:pre-wrap">${enquiry.message}</p>
    <hr />
    <p style="color:#777;font-size:12px">Reply directly to the client (Reply-To is set to their email).</p>
  </div>`;
}
