// Arquivo: /functions/webhook.js

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Configurações do Supabase
const SUPABASE_URL = 'https://tcnonaprqfcpqmscrbkg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuração do Resend
const resend = new Resend('re_C6iVdbTW_FFXKQn4NzoseNR9YuEvAdzMv');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const nomeProduto = payload.product_name;
    const emailCliente = payload.customer_email;

    // Buscar a capa pelo código (nome do produto = código)
    const { data, error } = await supabase
      .from('preprontas')
      .select('*')
      .eq('codigo', nomeProduto)
      .single();

    if (error || !data) {
      return { statusCode: 404, body: 'Capa não encontrada.' };
    }

    // Atualizar status para indisponível
    await supabase
      .from('preprontas')
      .update({ disponivel: false })
      .eq('codigo', nomeProduto);

    // Enviar e-mail com os arquivos
    await resend.emails.send({
      from: 'Lírio D. Design <contato@seusite.com>',
      to: emailCliente,
      subject: '🌸 Sua capa está pronta!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Olá!</h2>
          <p>Obrigado por adquirir a capa <strong>${data.titulo}</strong>.</p>
          <p>Aqui estão os arquivos da sua capa: <a href="${data.link_arquivos}">Clique aqui para baixar</a>.</p>
          <p>Se tiver qualquer dúvida, estou à disposição 💌</p>
          <p>Com carinho,<br><strong>Lírio D. Design</strong></p>
        </div>
      `
    });

    return { statusCode: 200, body: 'Email enviado com sucesso!' };

  } catch (err) {
    console.error('Erro:', err);
    return { statusCode: 500, body: 'Erro ao processar o webhook.' };
  }
};