import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VirusTotalAnalysisStats {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout: number;
}

interface VirusTotalResult {
  engine_name: string;
  category: string;
  result: string;
  method: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      console.error("No URL provided");
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!apiKey) {
      console.error("VirusTotal API key not configured");
      return new Response(
        JSON.stringify({ error: "VirusTotal API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scanning URL: ${url}`);

    // Step 1: Submit URL for scanning
    const urlId = btoa(url).replace(/=/g, '');
    
    // First, try to get existing analysis
    let analysisResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      }
    });

    let analysisData;
    
    if (analysisResponse.status === 404) {
      // URL not in database, submit for scanning
      console.log("URL not found, submitting for scan...");
      
      const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(url)}`
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error(`VirusTotal submit error: ${submitResponse.status} - ${errorText}`);
        return new Response(
          JSON.stringify({ error: `VirusTotal API error: ${submitResponse.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const submitData = await submitResponse.json();
      const analysisId = submitData.data?.id;
      
      if (analysisId) {
        // Wait briefly and fetch analysis results
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
          headers: {
            'x-apikey': apiKey,
            'Accept': 'application/json'
          }
        });

        if (resultResponse.ok) {
          analysisData = await resultResponse.json();
        }
      }
    } else if (analysisResponse.ok) {
      analysisData = await analysisResponse.json();
    } else {
      const errorText = await analysisResponse.text();
      console.error(`VirusTotal error: ${analysisResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `VirusTotal API error: ${analysisResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the results
    const attributes = analysisData?.data?.attributes || {};
    const stats: VirusTotalAnalysisStats = attributes.last_analysis_stats || attributes.stats || {
      malicious: 0,
      suspicious: 0,
      undetected: 0,
      harmless: 0,
      timeout: 0
    };

    const results: Record<string, VirusTotalResult> = attributes.last_analysis_results || attributes.results || {};
    
    // Calculate threat level
    const totalEngines = stats.malicious + stats.suspicious + stats.undetected + stats.harmless;
    const threatScore = totalEngines > 0 ? ((stats.malicious + stats.suspicious) / totalEngines) * 100 : 0;
    
    let threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'safe';
    if (stats.malicious >= 5 || threatScore >= 20) threatLevel = 'critical';
    else if (stats.malicious >= 3 || threatScore >= 10) threatLevel = 'high';
    else if (stats.malicious >= 1 || stats.suspicious >= 3) threatLevel = 'medium';
    else if (stats.suspicious >= 1) threatLevel = 'low';

    // Get flagged engines
    const flaggedEngines = Object.entries(results)
      .filter(([_, result]) => result.category === 'malicious' || result.category === 'suspicious')
      .map(([engine, result]) => ({
        engine,
        category: result.category,
        result: result.result
      }))
      .slice(0, 10);

    const response = {
      url,
      threatLevel,
      threatScore: Math.round(threatScore * 10) / 10,
      stats: {
        malicious: stats.malicious,
        suspicious: stats.suspicious,
        harmless: stats.harmless,
        undetected: stats.undetected,
        totalEngines
      },
      flaggedEngines,
      categories: attributes.categories || {},
      lastAnalysisDate: attributes.last_analysis_date 
        ? new Date(attributes.last_analysis_date * 1000).toISOString() 
        : null,
      checkedAt: new Date().toISOString()
    };

    console.log(`URL scan complete: ${threatLevel} (${stats.malicious} malicious, ${stats.suspicious} suspicious)`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in scan-url function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
