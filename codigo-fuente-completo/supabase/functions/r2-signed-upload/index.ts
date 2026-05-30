import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    const { companyId, fileName, mimeType, sizeBytes } = await req.json();
    if (!companyId || !fileName || !mimeType) throw new Error('Faltan datos del archivo');
    if (Number(sizeBytes || 0) > 25 * 1024 * 1024) throw new Error('Archivo demasiado grande');

    const objectKey = `${companyId}/${crypto.randomUUID()}-${sanitize(fileName)}`;

    // En producción aquí se firma el PUT contra Cloudflare R2 con AWS Signature V4.
    // Se deja el contrato listo para conectar al SDK/firma que prefieras en Edge Runtime.
    return Response.json({
      objectKey,
      uploadUrl: null,
      publicUrl: `${Deno.env.get('R2_PUBLIC_URL')}/${objectKey}`,
      message: 'Contrato listo: conectar firma R2 antes de producción.'
    }, { headers: corsHeaders() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 400, headers: corsHeaders() });
  }
});

function sanitize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-').replace(/-+/g, '-');
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}
