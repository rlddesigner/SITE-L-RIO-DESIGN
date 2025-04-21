const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(
  'https://tcnonaprqfcpqmscrbkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw'
  );

  const resend = new Resend('re_cK2mKp55_3H3rRBiSyjTRcpxM23cNF6pk');
  exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Método não permitido' };
    }
  
    const eventBody = JSON.parse(event.body || '{}');
    const email = eventBody?.resource?.customer?.data?.email;
    const codigo = eventBody?.resource?.items?.data?.[0]?.sku?.data?.sku;
  
    if (!email || !codigo) {
      return {
        statusCode: 400,
        body: 'Email ou código ausente.'
      };
    }
  
    const { data: capa, error } = await supabase
      .from('preprontas')
      .select('*')
      .eq('codigo', codigo)
      .single();
  
    if (error || !capa) {
      return { statusCode: 404, body: 'Capa não encontrada.' };
    }
  
    try {
      await resend.emails.send({
        from: 'Lírio D. Design <@lliriodesign.shop>',
        to: [email],
        subject: '💌 Sua capa está pronta!',
        html: `
          <p>Olá! 🌷</p>
          <p>Obrigada pela sua compra. Aqui está o link para baixar sua capa pré-pronta:</p>
          <p><a href="${capa.link_arquivos}" target="_blank">📁 Acessar Arquivos</a></p>
          <p>Se tiver dúvidas ou quiser suporte, é só responder este e-mail. 💖</p>
          <br>
          <p>Com carinho,</p>
          <p><strong>Lírio D. Design</strong></p>
        `
      });
  
      await supabase
        .from('preprontas')
        .update({ disponivel: false, reservada: false })
        .eq('codigo', codigo);
  
      return {
        statusCode: 200,
        body: 'Enviado com sucesso via Resend.',
      };
    } catch (err) {
      console.error("Erro ao enviar com Resend:", err);
      return {
        statusCode: 500,
        body: 'Erro ao enviar e-mail.',
      };
    }
  };