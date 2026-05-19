/**
 * Utilitaire d'envoi d'email.
 *
 * En développement : le lien est loggé dans la console et retourné dans la réponse API.
 * En production : configurez un provider SMTP via les variables d'environnement :
 *   EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *
 * Pour un provider cloud (Resend, Mailgun…), remplacez sendEmail() par l'appel SDK correspondant.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log("\n─────────────────────────────────────────");
    console.log(`📧 [DEV] Email à : ${to}`);
    console.log(`📌 Sujet  : ${subject}`);
    console.log(`📝 Texte  : ${text}`);
    console.log("─────────────────────────────────────────\n");
    return;
  }

  // Production : implémentez ici votre provider (nodemailer, Resend, SendGrid…)
  // Exemple avec nodemailer :
  // const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, ... });
  // await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, text });
  throw new Error("Aucun provider email configuré en production.");
}

export function resetPasswordEmailTemplate(resetUrl: string, expiresInMinutes = 60) {
  return {
    subject: "Réinitialisation de votre mot de passe – 2A Acteurs de l'Avenir",
    text: `Vous avez demandé à réinitialiser votre mot de passe.\n\nCliquez sur ce lien (valable ${expiresInMinutes} min) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h1 style="color:#1A4D4F;font-size:22px;margin-bottom:8px;">Réinitialisation du mot de passe</h1>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Vous avez demandé à réinitialiser votre mot de passe.<br/>
          Cliquez sur le bouton ci-dessous (lien valable <strong>${expiresInMinutes}&nbsp;minutes</strong>) :
        </p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1A4D4F;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#999;font-size:13px;">
          Si vous n&rsquo;êtes pas à l&rsquo;origine de cette demande, ignorez cet e-mail.
          Votre mot de passe ne sera pas modifié.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#bbb;font-size:12px;">2A – Acteurs de l&rsquo;Avenir · Libreville, Gabon</p>
      </div>
    `,
  };
}
