import { Resend } from 'resend';

  const resend = new Resend('re_HjBxcq9T_MZ9GhyWBuRyWG8VBaU9J3zmq'); // sua API KEY

  export default async (req) => {
    try {
      const { para, assunto, titulo, link } = req.body;
      console.log("PARA:", para, typeof para);
  
      const { data, error } = await resend.emails.send({
        from: 'Lírio Design <noreply@liriodesign.shop>',
        to: para,
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
        return new Response(JSON.stringify({ error: 'Erro ao enviar e-mail' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Erro geral na função:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };