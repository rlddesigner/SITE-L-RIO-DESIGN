const { createClient } = require('@supabase/supabase-js');
const emailjs = require('@emailjs/nodejs');

const supabase = createClient(
  'https://tcnonaprqfcpqmscrbkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw'
  );

  exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Método não permitido' };
    }
  
    const eventBody = JSON.parse(event.body || '{}');
    console.log("🔍 Payload recebido:", JSON.stringify(eventBody));
  
    // Pegar os dados corretos do JSON da Yampi:
    const email = eventBody?.resource?.customer?.data?.email;
    const codigo = eventBody?.resource?.items?.data?.[0]?.sku;
  
    console.log("📬 Dados recebidos:", { email, codigo });
  
    if (!email || !codigo) {
      return {
        statusCode: 400,
        body: 'Email ou código ausente.'
      };
    }
  
    // Buscar no Supabase
    const { data: capa, error } = await supabase
      .from('preprontas')
      .select('*')
      .eq('codigo', codigo)
      .single();
  
    if (error || !capa) {
      return { statusCode: 404, body: 'Capa não encontrada.' };
    }
  
    try {
      await emailjs.send('service_vafq5zq', 'template_l3x34bo', {
        email,
        codigo: capa.codigo,
        link_arquivos: capa.link_arquivos
      }, {
        publicKey: 'avKNQkuVniC59Omdz', // ✅ emailjs versão nova exige isso
      });
  
      // Atualiza status da capa no Supabase
      await supabase
        .from('preprontas')
        .update({ disponivel: false, reservada: false })
        .eq('codigo', codigo);
  
      return {
        statusCode: 200,
        body: 'Enviado com sucesso.',
      };
    } catch (err) {
      console.error("❌ Erro ao enviar e-mail:", err);
      return {
        statusCode: 500,
        body: 'Erro ao enviar e-mail.',
      };
    }
  };