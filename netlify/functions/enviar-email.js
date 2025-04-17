import { Resend } from 'resend';

  const resend = new Resend('re_AHvj6A2S_5hjU4UZbnFTdmfoStmFn7c1i'); // sua API KEY

  export default async (req) => {
    try {
      const bodyText = await req.text(); // <- ler o corpo cru
      const body = JSON.parse(bodyText); // <- converter em JSON
  
      const { para, assunto, titulo, link } = body;
  
      console.log("📨 Campo 'para' recebido:", para);
  
      if (!para || typeof para !== 'string') {
        return new Response(
          JSON.stringify({ error: "'para' é obrigatório e deve ser uma string" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      const { error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: para,
        subject: assunto || 'Sua capa está pronta!',
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
        console.error("Erro ao enviar e-mail:", error);
        return new Response(
          JSON.stringify({ error: 'Erro ao enviar e-mail', details: error }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (err) {
      console.error("Erro geral na função:", err);
      return new Response(JSON.stringify({ error: 'Erro no servidor', details: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };