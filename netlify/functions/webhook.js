const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido' };
  }

  const { email, codigo } = JSON.parse(event.body || '{}');

  if (!email || !codigo) {
    return {
      statusCode: 400,
      body: 'E-mail ou código da capa ausente.',
    };
  }
const supabase = createClient(
  'https://tcnonaprqfcpqmscrbkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw'
);

const { data: capa, error } = await supabase
    .from('preprontas')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error || !capa) {
    return {
      statusCode: 404,
      body: 'Capa não encontrada.',
    };
  }

  // Enviar e-mail com EmailJS (via fetch)
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'origin': 'http://localhost',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: 'SEU_SERVICE_ID',
      template_id: 'SEU_TEMPLATE_ID',
      user_id: 'SUA_PUBLIC_KEY',
      template_params: {
        email,
        codigo: capa.codigo,
        link_arquivos: capa.link_arquivos
      }
    })
  });

  if (!response.ok) {
    return {
      statusCode: 500,
      body: 'Erro ao enviar e-mail.',
    };
  }

  // Atualizar status da capa
  await supabase
    .from('preprontas')
    .update({ disponivel: false, reservada: false })
    .eq('codigo', codigo);

  return {
    statusCode: 200,
    body: 'E-mail enviado com sucesso.',
  };
};