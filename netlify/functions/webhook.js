const { createClient } = require('@supabase/supabase-js');
const emailjs = require('@emailjs/nodejs');

const supabase = createClient(
  'https://tcnonaprqfcpqmscrbkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw'
  );

  emailjs.init("avKNQkuVniC59Omdz");

  exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método não permitido'
    };
  }

  const payload = JSON.parse(event.body || '{}');

  // Pega os dados do JSON da Yampi
  const email = payload.resource?.customer?.data?.email;
  const codigo = payload.resource?.items?.data?.[0]?.sku?.data?.sku;

  if (!email || !codigo) {
    return {
      statusCode: 400,
      body: 'Email ou código ausente.'
    };
  }

  // Busca a capa no Supabase
  const { data: capa, error } = await supabase
    .from('preprontas')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error || !capa) {
    return {
      statusCode: 404,
      body: 'Capa não encontrada no Supabase.'
    };
  }

  try {
    // Envia o e-mail
    await emailjs.send('service_vafq5zq', 'template_l3x34bo', {
      email,
      codigo: capa.codigo,
      link_arquivos: capa.link_arquivos
    });

    // Atualiza status da capa
    await supabase
      .from('preprontas')
      .update({ disponivel: false, reservada: false })
      .eq('codigo', codigo);

    return {
      statusCode: 200,
      body: 'Capa enviada com sucesso.'
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Erro ao enviar e-mail: ${err.message}`
    };
  }
};