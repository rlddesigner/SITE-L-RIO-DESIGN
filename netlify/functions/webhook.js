// Arquivo: /functions/webhook.js (Netlify Functions)

// Instalar antes: npm install @supabase/supabase-js node-fetch nodemailer

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = 'https://tcnonaprqfcpqmscrbkg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const payload = JSON.parse(event.body);

  // 1. Extrai o nome do produto e e-mail do cliente
  const nomeProduto = payload.product_name;
  const emailCliente = payload.customer_email;

  // 2. Busca no Supabase a capa pelo codigo (assumindo que o nome do produto tem o mesmo codigo)
  const { data, error } = await supabase
    .from('preprontas')
    .select('*')
    .eq('codigo', nomeProduto)
    .single();

  if (error || !data) {
    return { statusCode: 404, body: 'Capa não encontrada.' };
  }

  // 3. Marca como indisponível
  await supabase
    .from('preprontas')
    .update({ disponivel: false })
    .eq('codigo', nomeProduto);

  // 4. Envia o e-mail com os arquivos (usando nodemailer + Gmail ou Resend)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'SEU_EMAIL@gmail.com',
      pass: 'SUA_SENHA_DE_APP',
    },
  });

  const mailOptions = {
    from: 'Lírio D. Design <lliriodesign@gmail.com>',
    to: emailCliente,
    subject: 'Sua capa está pronta! 💖',
    html: `
      <h3>Olá!</h3>
      <p>Obrigado pela sua compra da capa <strong>${data.titulo}</strong>.</p>
      <p>Aqui estão os arquivos: <a href="${data.link_arquivos}">clique para baixar</a>.</p>
      <p>Se tiver qualquer dúvida, é só me chamar. 🌷</p>
      <p>Com carinho,<br>Lírio D. Design</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: 'Tudo certo! E-mail enviado.' };
  } catch (err) {
    return { statusCode: 500, body: 'Erro ao enviar e-mail.' };
  }
};
