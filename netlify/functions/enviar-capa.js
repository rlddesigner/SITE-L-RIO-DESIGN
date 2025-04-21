const emailjs = require('@emailjs/nodejs');
const { createClient } = require('@supabase/supabase-js');

const client = supabase.createClient(
    'https://tcnonaprqfcpqmscrbkg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw'
  );
  emailjs.init("avKNQkuVniC59Omdz");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);

  const email = body.email;
  const codigo = body.codigo;

  if (!email || !codigo) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltando dados" })
    };
  }

  const { data, error } = await supabase
    .from("preprontas")
    .select("*")
    .eq("codigo", codigo)
    .single();

  if (error || !data) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Capa não encontrada" })
    };
  }

  const { link_arquivos } = data;

  try {
    await emailjs.send("service_vafq5zq", "template_l3x34bo", {
      email: email,
      codigo: codigo,
      link_arquivos: link_arquivos
    });

    // Marcar como vendida
    await supabase
      .from("preprontas")
      .update({ disponivel: false, reservada: false })
      .eq("codigo", codigo);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao enviar o e-mail", detalhes: err })
    };
  }
};