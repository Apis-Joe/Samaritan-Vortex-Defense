import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60000; // 1 minute

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  // Default allowed origins (Lovable preview domains + localhost)
  return [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins();
  // Check if origin matches allowed patterns (including Lovable preview domains)
  const isAllowed = origin && (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovableproject.com')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

// Validate URL format and security
const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Valid URL is required' };
  }

  // Limit URL length
  if (url.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length' };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
    }
    
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost and loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { valid: false, error: 'Local addresses are not allowed' };
    }
    
    // Block private IP ranges (SSRF protection)
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Pattern);
    if (match) {
      const [, a, b, c] = match.map(Number);
      // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
      if (a === 10 || 
          (a === 172 && b >= 16 && b <= 31) || 
          (a === 192 && b === 168) ||
          (a === 169 && b === 254) ||
          a === 0) {
        return { valid: false, error: 'Private network addresses are not allowed' };
      }
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Check rate limit
const checkRateLimit = (clientIp: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
};

// Get client IP from headers
const getClientIp = (req: Request): string => {
  return req.headers.get('cf-connecting-ip') ||
         req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
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
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const clientIp = getClientIp(req);

  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', code: 'INVALID_REQUEST' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url } = body;
    
    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error, code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!apiKey) {
      console.error('VirusTotal API key not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable', code: 'CONFIG_ERROR' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scanning URL from ${clientIp}: ${url.substring(0, 50)}...`);

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
      console.log('URL not found in VirusTotal, submitting for scan...');
      
      const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(url)}`
      });

      if (!submitResponse.ok) {
        console.error(`VirusTotal submit failed with status: ${submitResponse.status}`);
        return new Response(
          JSON.stringify({ error: 'Unable to scan URL at this time', code: 'SCAN_ERROR' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const submitData = await submitResponse.json();
      const analysisId = submitData.data?.id;
      
      if (analysisId) {
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
      console.error(`VirusTotal lookup failed with status: ${analysisResponse.status}`);
      return new Response(
        JSON.stringify({ error: 'Unable to retrieve scan results', code: 'LOOKUP_ERROR' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    console.error('Unexpected error in scan-url function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
