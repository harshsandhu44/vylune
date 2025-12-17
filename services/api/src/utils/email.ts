import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { z } from 'zod';

const sesClient = new SESv2Client({});

const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
});

export async function sendEmail(email: z.infer<typeof EmailSchema>) {
  const validatedEmail = EmailSchema.parse(email);

  const command = new SendEmailCommand({
    FromEmailAddress: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [validatedEmail.to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: validatedEmail.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: validatedEmail.html,
            Charset: 'UTF-8',
          },
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
