import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useCanonicalUrl(baseUrl = "https://crm.axigearelectric.com") {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = `${baseUrl}${location.pathname}`;

    let canonicalLink = document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.href = canonicalUrl;
  }, [location.pathname, baseUrl]);
}
