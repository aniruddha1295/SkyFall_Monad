import { useState } from "react";

const STEPS = [
  {
    step: 1,
    title: "Request Data",
    description: "Client makes an HTTP GET request to a premium endpoint.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "402 Payment Required",
    description: "Server returns payment requirements — amount, token, and recipient address.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Sign & Pay",
    description: "Client signs a USDC micropayment and retries the request with payment proof.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Receive Data",
    description: "Server verifies payment on-chain and returns premium weather data.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface Endpoint {
  name: string;
  slug: string;
  endpoint: string;
  price: string;
  description: string;
  badgeLabel: string;
  badgeColor: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    name: "Premium Forecast",
    slug: "forecast",
    endpoint: "GET /api/premium/forecast/:city",
    price: "$0.001 USDC",
    description:
      "24-hour hourly forecast with rain probability, temperature trends, risk analysis.",
    badgeLabel: "Cheapest",
    badgeColor: "bg-yes/20 text-yes",
  },
  {
    name: "Historical Data",
    slug: "historical",
    endpoint: "GET /api/premium/historical/:city",
    price: "$0.01 USDC",
    description:
      "Weather data with full trend analysis and historical context.",
    badgeLabel: "Most Data",
    badgeColor: "bg-brand/20 text-brand",
  },
  {
    name: "Weather Alerts",
    slug: "alerts",
    endpoint: "GET /api/premium/alerts/:city",
    price: "$0.005 USDC",
    description:
      "Severe weather alerts, risk scores, and hedging recommendations.",
    badgeLabel: "Critical",
    badgeColor: "bg-no/20 text-no",
  },
];

const CITIES = ["Nagpur", "Mumbai", "Delhi"];

const WHY_FEATURES = [
  {
    title: "No API Keys",
    description: "Payment is the authentication. No sign-up, no dashboard, no rate-limit tiers.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    title: "AI Agent Ready",
    description: "Autonomous agents can pay and access data without human intervention.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Micropayments",
    description: "Pay $0.001 per call, not $50/month. Only pay for what you use.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

function syntaxHighlight(jsonStr: string): string {
  return jsonStr
    .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="text-brand">$1</span>:')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="text-yes">$1</span>')
    .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="text-sky-400">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="text-slate-500">$1</span>');
}

export default function ApiPage() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0].slug);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleTryRequest = async () => {
    setIsFetching(true);
    setResponseData(null);
    setStatusCode(null);
    setFetchError(null);

    try {
      const url = `/api/premium/${selectedEndpoint}/${selectedCity.toLowerCase()}`;
      const res = await fetch(url);
      setStatusCode(res.status);
      const data = await res.json();
      setResponseData(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setFetchError(message);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 lg:py-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Premium Weather{" "}
          <span className="text-brand">API</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          Powered by x402 — Pay per request, no subscriptions
        </p>
        <p className="mt-4 text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Developers and AI agents can pay micropayments in USDC for premium weather
          data. No API keys, no sign-ups — just HTTP requests and on-chain payments.
        </p>
      </section>

      {/* How x402 Works */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          How x402 Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ step, title, description, icon }) => (
            <div
              key={step}
              className="rounded-xl border border-border bg-bg-surface p-6 text-center hover:border-brand/50 transition-colors relative"
            >
              <div className="w-12 h-12 rounded-full bg-brand/20 text-brand font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {icon}
              </div>
              <div className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">
                Step {step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* API Endpoints */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          API Endpoints
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.slug}
              className="rounded-xl border border-border bg-bg-surface p-6 hover:border-brand/50 transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{ep.name}</h3>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ep.badgeColor}`}
                >
                  {ep.badgeLabel}
                </span>
              </div>
              <code className="block text-sm font-mono bg-bg-hover rounded-lg px-3 py-2 text-slate-300 mb-4">
                {ep.endpoint}
              </code>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                {ep.description}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Price per call</span>
                <p className="text-xl font-bold text-brand mt-1">{ep.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Live Demo
        </h2>
        <div className="rounded-xl border border-border bg-bg-surface p-6 max-w-3xl mx-auto">
          <p className="text-slate-400 text-sm mb-6">
            Try making a request to a premium endpoint. The backend will respond with a
            <span className="text-no font-semibold"> 402 Payment Required</span> status,
            showing the x402 payment requirements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* City selector */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-lg bg-bg-hover border border-border text-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint selector */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Endpoint
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full rounded-lg bg-bg-hover border border-border text-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors"
              >
                {ENDPOINTS.map((ep) => (
                  <option key={ep.slug} value={ep.slug}>
                    {ep.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Try button */}
            <div className="flex items-end">
              <button
                onClick={handleTryRequest}
                disabled={isFetching}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  "Try Request"
                )}
              </button>
            </div>
          </div>

          {/* Request URL preview */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request</span>
            <code className="block mt-1 text-sm font-mono bg-bg-hover rounded-lg px-3 py-2 text-slate-300">
              GET /api/premium/{selectedEndpoint}/{selectedCity.toLowerCase()}
            </code>
          </div>

          {/* Response */}
          {(responseData || fetchError) && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response</span>
                {statusCode !== null && (
                  <span
                    className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                      statusCode === 402
                        ? "bg-no/20 text-no"
                        : statusCode >= 200 && statusCode < 300
                          ? "bg-yes/20 text-yes"
                          : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {statusCode} {statusCode === 402 ? "Payment Required" : statusCode >= 200 && statusCode < 300 ? "OK" : "Error"}
                  </span>
                )}
              </div>

              {fetchError ? (
                <div className="rounded-lg bg-no/10 border border-no/30 px-4 py-3 text-no text-sm">
                  {fetchError}
                </div>
              ) : (
                <div className="rounded-lg bg-[#0d0d14] border border-border overflow-auto max-h-96">
                  <pre
                    className="text-sm font-mono p-4 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlight(responseData!),
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why x402? */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Why x402?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_FEATURES.map(({ title, description, icon }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-bg-surface p-6 text-center hover:border-brand/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-brand/20 text-brand flex items-center justify-center mx-auto mb-4">
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
