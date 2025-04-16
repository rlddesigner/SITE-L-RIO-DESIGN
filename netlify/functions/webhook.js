const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tcnonaprqfcpqmscrbkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbm9uYXBycWZjcHFtc2NyYmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzYzOTQsImV4cCI6MjA2MDIxMjM5NH0.0yyj8uPdF3C3eQGPrFBWVvHuczCnHKhnXGsbBpN96Xw'
);

exports.handler = async (event) => {
  console.log("🔥 Webhook recebido:");
  console.log(event.body);

  try {
    const body = JSON.parse(event.body);

    if (body.event !== 'purchase.approved') {
      return {
        statusCode: 200,
        body: 'Evento ignorado (não é uma compra aprovada)',
      };
    }

    const email = body.purchase.customer.email;
    const codigo = body.purchase.product.name;

    const { data: capa, error } = await supabase
      .from('preprontas')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error || !capa) {
      return {
        statusCode: 404,
        body: 'Capa não encontrada no Supabase.',
      };
    }

    const driveLink = capa.link_arquivos;

    await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mlsn.9f858c0f036a94e459d89ae1445792ff7b96afb57354159f8f0da08ee26c1d66',
      },
      body: JSON.stringify({
        from: {
          email: 'no-reply@test-r83ql3ppwdmgzw1j.mlsender.net',
          name: 'Lírio D. Design',
        },
        to: [{ email }],
        subject: '📦 Sua capa pré-pronta está disponível!',
        html: `
          <h2 style="color:#217c67;">🌸 Obrigada por sua compra!</h2>
          <p>Você pode baixar os arquivos da sua capa no link abaixo:</p>
          <p><a href="${driveLink}" style="font-weight: bold;">▶ Acessar arquivos da capa</a></p>
          <hr />
          <h3>📌 Antes de editar no Photoshop:</h3>
          <p>Instale as fontes primeiro. Elas estão em arquivos .zip na pasta.</p>
          <ol>
            <li>Extraia o ZIP</li>
            <li>Dê dois cliques nas fontes</li>
            <li>Clique em “Instalar”</li>
          </ol>
          <p>Com carinho, <br>Lírio D. Design</p>
        `,
      }),
    });

    await supabase
      .from('preprontas')
      .update({
        disponivel: false,
        reservada: true,
        reserva_expira_em: null,
      })
      .eq('codigo', codigo);

    return {
      statusCode: 200,
      body: 'E-mail enviado e capa atualizada!',
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Erro interno: ${err.message}`,
    };
  }
};
