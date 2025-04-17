fetch('/.netlify/functions/enviar-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      para: email,
      assunto: 'Sua capa está pronta!',
      titulo: capa.titulo,
      link: capa.link_arquivos,
    }),
  })
  // netlify/functions/enviar-email.js
console.log("Requisição recebida:", req.body);
console.log("Enviando e-mail para:", para);

import { Resend } from 'resend';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { para, assunto, titulo, link } = req.body;

  const resend = new Resend('re_HjBxcq9T_MZ9GhyWBuRyWG8VBaU9J3zmq');

  try {
    const { data, error } = await resend.emails.send({
        from: 'Lírio Design <noreply@liriodesign.shop>',
      to: [para],
      subject: assunto,
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
    console.log("Resposta do Resend:", data, error);

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
