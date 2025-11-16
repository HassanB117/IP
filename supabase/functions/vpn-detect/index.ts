import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip } = await req.json();
    
    if (!ip) {
      return new Response(
        JSON.stringify({ error: 'IP address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use ipwhois.io for VPN detection
    const response = await fetch(`http://ipwho.is/${ip}`);
    const data = await response.json();
    
    console.log('VPN detection data:', data);

    // Check for proxy indicators
    const isVpn = data.security?.is_proxy === true || 
                  data.security?.is_vpn === true ||
                  data.security?.is_tor === true ||
                  data.security?.is_relay === true ||
                  data.connection?.is_proxy === true;
    
    const vpnType = data.security?.is_tor ? 'Tor Network' :
                    data.security?.is_vpn ? 'VPN' :
                    data.security?.is_proxy ? 'Proxy' :
                    data.security?.is_relay ? 'Relay' :
                    'None Detected';

    return new Response(
      JSON.stringify({
        isVpn,
        vpnType,
        hosting: data.connection?.isp_hosting || false,
        org: data.connection?.org || 'Unknown'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in vpn-detect function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
