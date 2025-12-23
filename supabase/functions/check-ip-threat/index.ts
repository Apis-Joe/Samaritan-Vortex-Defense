import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW_MS = 60000; // 1 minute

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  return [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins();
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

// Validate IP address format
const validateIpAddress = (ip: string): { valid: boolean; error?: string } => {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'Valid IP address is required' };
  }

  // Trim and check length
  const trimmedIp = ip.trim();
  if (trimmedIp.length > 45) { // max IPv6 length
    return { valid: false, error: 'Invalid IP address format' };
  }

  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  const ipv4Match = trimmedIp.match(ipv4Pattern);
  if (ipv4Match) {
    const octets = [ipv4Match[1], ipv4Match[2], ipv4Match[3], ipv4Match[4]].map(Number);
    if (octets.every(o => o >= 0 && o <= 255)) {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid IP address format' };
  }
  
  if (ipv6Pattern.test(trimmedIp)) {
    return { valid: true };
  }
  
  return { valid: false, error: 'Invalid IP address format' };
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

interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    countryName: string;
    usageType: string;
    isp: string;
    domain: string;
    hostnames: string[];
    isTor: boolean;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string | null;
  };
}

interface GeoIPResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
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

    const { ip } = body;
    
    // Validate IP
    const validation = validateIpAddress(ip);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error, code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedIp = ip.trim();
    console.log(`Checking threat intelligence for IP: ${trimmedIp} (requested by: ${clientIp})`);

    const abuseIPDBKey = Deno.env.get('ABUSEIPDB_API_KEY');
    
    // Parallel requests for threat data and geolocation
    const [abuseResponse, geoResponse] = await Promise.all([
      // AbuseIPDB check
      abuseIPDBKey ? fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(trimmedIp)}&maxAgeInDays=90&verbose=true`, {
        headers: {
          'Key': abuseIPDBKey,
          'Accept': 'application/json'
        }
      }).catch(err => {
        console.error('AbuseIPDB request failed:', err);
        return null;
      }) : Promise.resolve(null),
      
      // Free IP geolocation
      fetch(`http://ip-api.com/json/${encodeURIComponent(trimmedIp)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`).catch(err => {
        console.error('GeoIP request failed:', err);
        return null;
      })
    ]);

    let threatData = null;
    let geoData: GeoIPResponse | null = null;

    // Parse AbuseIPDB response
    if (abuseResponse && abuseResponse.ok) {
      try {
        const abuseResult: AbuseIPDBResponse = await abuseResponse.json();
        threatData = abuseResult.data;
        console.log(`AbuseIPDB score for ${trimmedIp}: ${threatData.abuseConfidenceScore}`);
      } catch (err) {
        console.error('Failed to parse AbuseIPDB response:', err);
      }
    } else if (abuseResponse) {
      console.warn(`AbuseIPDB returned status: ${abuseResponse.status}`);
    }

    // Parse geolocation response
    if (geoResponse && geoResponse.ok) {
      try {
        geoData = await geoResponse.json();
        if (geoData?.status === 'success') {
          console.log(`Geolocation for ${trimmedIp}: ${geoData.city}, ${geoData.country}`);
        }
      } catch (err) {
        console.error('Failed to parse GeoIP response:', err);
      }
    }

    // Determine threat level based on AbuseIPDB score
    let threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'safe';
    let riskScore = 0;

    if (threatData) {
      riskScore = threatData.abuseConfidenceScore;
      if (riskScore >= 80) threatLevel = 'critical';
      else if (riskScore >= 60) threatLevel = 'high';
      else if (riskScore >= 40) threatLevel = 'medium';
      else if (riskScore >= 20) threatLevel = 'low';
      else threatLevel = 'safe';
    }

    const response = {
      ip: trimmedIp,
      threatLevel,
      riskScore,
      abuseData: threatData ? {
        confidenceScore: threatData.abuseConfidenceScore,
        totalReports: threatData.totalReports,
        isTor: threatData.isTor,
        isp: threatData.isp,
        domain: threatData.domain,
        usageType: threatData.usageType,
        lastReportedAt: threatData.lastReportedAt,
        countryCode: threatData.countryCode,
        isWhitelisted: threatData.isWhitelisted
      } : null,
      geolocation: geoData && geoData.status === 'success' ? {
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.regionName,
        city: geoData.city,
        lat: geoData.lat,
        lon: geoData.lon,
        isp: geoData.isp,
        org: geoData.org,
        timezone: geoData.timezone
      } : null,
      checkedAt: new Date().toISOString()
    };

    console.log(`Threat check complete for ${trimmedIp}: ${threatLevel} (score: ${riskScore})`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error in check-ip-threat function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
