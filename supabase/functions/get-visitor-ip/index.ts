import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the client's IP from headers (set by edge infrastructure)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    
    // Priority: CF > X-Forwarded-For (first IP) > X-Real-IP
    let clientIP = cfConnectingIP || 
                   (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 
                   realIP || 
                   'unknown';

    console.log(`Detected visitor IP: ${clientIP}`);
    console.log(`Headers - X-Forwarded-For: ${forwardedFor}, X-Real-IP: ${realIP}, CF-Connecting-IP: ${cfConnectingIP}`);

    return new Response(
      JSON.stringify({ 
        ip: clientIP,
        detectedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in get-visitor-ip function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
