import { Resend } from 'resend';

  const resend = new Resend('re_HjBxcq9T_MZ9GhyWBuRyWG8VBaU9J3zmq'); // sua API KEY

  export default async (req) => {
    try {
      const { para, assunto, titulo, link } = JSON.parse(req.body);
  
      const { data, error } = await resend.emails.send({
        from: 'Lírio Design <noreply@liriodesign.shop>',
        to: [para],
        subject: assunto,
        html: `
          <h2>🌸 Sua capa está pronta!</h2>
          <p>Olá! Obrigada por confiar na Lírio Design.</p>
          <p>Aqui está sua capa: <strong>${titulo}</strong></p>
          <p>Você pode baixar os arquivos no link abaixo:</p>
          <a href="${link}" target="_blank">${link}</a>
          <br/><br/>
          <p>Qualquer dúvida é só responder esse e-mail 💖</p>
        `,
      });
  
      if (error) {
        console.error('Erro ao enviar e-mail:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Erro ao enviar e-mail.' }),
        };
      }
  
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'ok' }),
      };
    } catch (err) {
      console.error('Erro geral na função:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  };