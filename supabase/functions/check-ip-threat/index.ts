import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip } = await req.json();
    
    if (!ip) {
      console.error("No IP address provided");
      return new Response(
        JSON.stringify({ error: "IP address is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking threat intelligence for IP: ${ip}`);

    const abuseIPDBKey = Deno.env.get('ABUSEIPDB_API_KEY');
    
    // Parallel requests for threat data and geolocation
    const [abuseResponse, geoResponse] = await Promise.all([
      // AbuseIPDB check
      abuseIPDBKey ? fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose=true`, {
        headers: {
          'Key': abuseIPDBKey,
          'Accept': 'application/json'
        }
      }) : Promise.resolve(null),
      
      // Free IP geolocation (no API key needed)
      fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`)
    ]);

    let threatData = null;
    let geoData: GeoIPResponse | null = null;

    // Parse AbuseIPDB response
    if (abuseResponse && abuseResponse.ok) {
      const abuseResult: AbuseIPDBResponse = await abuseResponse.json();
      threatData = abuseResult.data;
      console.log(`AbuseIPDB score for ${ip}: ${threatData.abuseConfidenceScore}`);
    } else if (abuseResponse) {
      console.error(`AbuseIPDB error: ${abuseResponse.status}`);
    }

    // Parse geolocation response
    if (geoResponse.ok) {
      geoData = await geoResponse.json();
      console.log(`Geolocation for ${ip}: ${geoData?.city}, ${geoData?.country}`);
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
      ip,
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

    console.log(`Threat check complete for ${ip}: ${threatLevel} (score: ${riskScore})`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-ip-threat function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
