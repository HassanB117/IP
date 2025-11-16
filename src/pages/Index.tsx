import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  ipv4?: string;
  ipv6?: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  lat?: number;
  lon?: number;
  timestamp?: string;
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocationData>({});
  const [mapLoading, setMapLoading] = useState(true);
  const { toast } = useToast();

  const fetchIPData = async () => {
    setLoading(true);
    setMapLoading(true);
    
    try {
      // Fetch IPv4
      const ip4Response = await fetch("https://api.ipify.org?format=json");
      const ip4Data = await ip4Response.json();

      // Fetch IPv6
      const ip6Response = await fetch("https://api64.ipify.org?format=json");
      const ip6Data = await ip6Response.json();

      // Fetch location data
      let locationData: any = null;
      try {
        const locationResponse = await fetch("https://ipwho.is/");
        locationData = await locationResponse.json();
      } catch {
        // Fallback to ipapi.co
        const fallbackResponse = await fetch("https://ipapi.co/json/");
        locationData = await fallbackResponse.json();
      }

      const newData: LocationData = {
        ipv4: ip4Data.ip || "Unavailable",
        ipv6: ip6Data.ip || "Unavailable",
        country: locationData?.country_name || locationData?.country || "—",
        region: locationData?.region || locationData?.region_name || "—",
        city: locationData?.city || "—",
        isp: locationData?.org || locationData?.connection?.isp || locationData?.isp || "—",
        lat: locationData?.latitude || locationData?.lat,
        lon: locationData?.longitude || locationData?.lon,
        timestamp: new Date().toLocaleString(),
      };

      setData(newData);
    } catch (error) {
      console.error("Error fetching IP data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch IP information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPData();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "JSON snapshot saved",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative z-10">
      <div className="w-full max-w-7xl">
        <div className="glass-shell rounded-3xl border border-glass-border/20 p-4 md:p-6 backdrop-blur-xl bg-glass/40 shadow-2xl">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-2">
                  IP Nexus
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                  {loading ? "Resolving..." : "Online · Data resolved"}
                </p>
              </div>
              <Button
                onClick={fetchIPData}
                disabled={loading}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - IP & Details */}
            <div className="space-y-4">
              {/* IP Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-glass-border/30 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">IPv4</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                      Primary
                    </span>
                  </div>
                  <div className="text-lg font-semibold mb-2 text-foreground break-all">
                    {loading ? "Loading..." : data.ipv4}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.ipv4 || "", "IPv4")}
                    className="w-full text-primary hover:text-primary hover:bg-primary/10"
                    disabled={!data.ipv4 || data.ipv4 === "Unavailable"}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy
                  </Button>
                </Card>

                <Card className="p-4 bg-card/50 backdrop-blur-sm border-glass-border/30 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">IPv6</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary">
                      Alt
                    </span>
                  </div>
                  <div className="text-lg font-semibold mb-2 text-foreground break-all">
                    {loading ? "Loading..." : data.ipv6}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.ipv6 || "", "IPv6")}
                    className="w-full text-secondary hover:text-secondary hover:bg-secondary/10"
                    disabled={!data.ipv6 || data.ipv6 === "Unavailable"}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy
                  </Button>
                </Card>
              </div>

              {/* Location Details */}
              <Card className="p-5 bg-card/50 backdrop-blur-sm border-glass-border/30">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Geolocation Details
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/20">
                    <div className="text-xs text-muted-foreground mb-1">Country</div>
                    <div className="text-sm font-semibold text-foreground">
                      {loading ? "..." : data.country}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/20">
                    <div className="text-xs text-muted-foreground mb-1">Region</div>
                    <div className="text-sm font-semibold text-foreground">
                      {loading ? "..." : data.region}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/20">
                    <div className="text-xs text-muted-foreground mb-1">City</div>
                    <div className="text-sm font-semibold text-foreground">
                      {loading ? "..." : data.city}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-xl border border-border/20">
                  <div className="text-xs text-muted-foreground mb-1">ISP / Organization</div>
                  <div className="text-sm font-semibold text-foreground">
                    {loading ? "..." : data.isp}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-success/10 rounded-xl border border-success/30">
                  <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                  <div className="text-sm font-semibold text-success">
                    {loading
                      ? "Resolving..."
                      : data.lat && data.lon
                      ? `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`
                      : "No coordinate lock"}
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground text-center">
                  Last updated: {data.timestamp || "—"}
                </div>
              </Card>
            </div>

            {/* Right Column - Map */}
            <div className="space-y-4">
              <Card className="p-5 bg-card/50 backdrop-blur-sm border-glass-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                    Approximate Location
                  </h3>
                  <span className="text-xs text-primary">
                    {data.lat && data.lon ? `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}` : "—"}
                  </span>
                </div>
                
                <div className="relative w-full h-[500px] bg-muted/20 rounded-2xl overflow-hidden border border-border/30">
                  {mapLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
                      <strong className="text-foreground mb-1">Locating…</strong>
                      <small className="text-muted-foreground text-center px-4">
                        Waiting for coordinate lock from geolocation service.
                      </small>
                    </div>
                  )}
                  
                  {data.lat && data.lon ? (
                    <iframe
                      src={`https://www.google.com/maps?q=${data.lat},${data.lon}&z=8&output=embed`}
                      title="IP location map"
                      className="w-full h-full"
                      onLoad={() => setTimeout(() => setMapLoading(false), 700)}
                      onError={() => setMapLoading(false)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-8 text-center">
                      Map preview placeholder. Awaiting geolocation data.
                    </div>
                  )}
                </div>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                Need a structured export?{" "}
                <Button
                  variant="link"
                  onClick={downloadJSON}
                  className="text-primary hover:text-primary/80 p-0 h-auto"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download JSON Snapshot
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
