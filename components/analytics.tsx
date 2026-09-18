import Script from "next/script";

/** Not a secret — a measurement ID ships in the page for anyone to read. */
const GA_MEASUREMENT_ID = "G-6DY028JD5F";

/**
 * Google Analytics 4, via the gtag.js snippet.
 *
 * Production only, for the same reason as the service worker: every `npm run
 * dev` reload would otherwise land in the same property and skew the numbers
 * for a group of nine people. To check the tag end to end, run
 * `npm run build && npm start` — that sets NODE_ENV=production.
 *
 * `afterInteractive` is next/script's default and the right one here: the feed
 * paints first and the tag loads once the page is interactive.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      {/* An inline script needs an id for Next to track and optimise it. */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
