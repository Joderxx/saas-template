import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, template: React.ReactNode) {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject,
    react: template
  })
}

