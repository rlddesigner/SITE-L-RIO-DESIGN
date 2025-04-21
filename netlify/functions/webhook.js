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
        from: 'Lírio D. Design <vendas@lliriodesign.shop>',
        to: [email],
        subject: '💌 Sua capa está pronta!',
        html: `
          <table width="100%" style="background:#fffaf7; font-family: 'Segoe UI', sans-serif; padding: 40px;">
            <tr>
              <td align="center">
                <img src="https://lliriodesign.netlify.app/assets/logo.png" alt="Lírio D. Design" width="120" style="margin-bottom: 20px;" />
                <h2 style="color:#217c67;">📩 Sua capa está pronta!</h2>
  
                <p style="font-size: 1rem; color: #444;">
                  Olá! 🌷<br><br>
                  Obrigada pela sua compra. Aqui está o link para baixar sua capa pré-pronta:
                </p>
  
                <a href="${capa.link_arquivos}" style="display:inline-block; margin: 20px auto; background:#F27C46; color:#fff; padding: 12px 24px; border-radius: 30px; font-weight:bold; text-decoration:none;">
                  📁 Acessar Arquivos
                </a>
  
                <p style="font-size: 0.95rem; color: #555;">
                  Se tiver dúvidas ou quiser suporte, é só responder este e-mail 💖
                </p>
  
                <hr style="margin: 40px 0; border: none; border-top: 1px solid #ffd8b5;" />
  
                <p style="font-size: 0.85rem; color: #999;">
                  Com carinho,<br>
                  <strong style="color:#217c67;">Lírio D. Design</strong><br>
                  <a href="https://lliriodesign.shop" style="color:#217c67; text-decoration:none;">www.lliriodesign.shop</a><br><br>
  
                  <a href="https://instagram.com/lliriodesign" target="_blank" style="margin-right: 10px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram" />
                  </a>
                  <a href="mailto:lliriodesign@gmail.com" style="margin-right: 10px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="20" alt="Email" />
                  </a>
                </p>
              </td>
            </tr>
          </table>
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