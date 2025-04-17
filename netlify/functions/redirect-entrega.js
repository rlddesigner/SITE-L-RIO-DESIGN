exports.handler = async (event) => {
    const codigo = event.queryStringParameters?.capa || "SEM_CODIGO";
  
    return {
      statusCode: 302,
      headers: {
        Location: `/entrega.html?capa=${codigo}`,
      },
    };
  };
  