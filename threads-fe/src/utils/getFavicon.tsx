export default async function getFavicon(url: string) {
  const domain = new URL(url).hostname;

  // Try parsing HTML first
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      url
    )}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, "text/html");

    const iconLink = doc.querySelector('link[rel*="icon"]');
    if (iconLink) {
      let href = iconLink.getAttribute("href");
      if (href && !href.startsWith("http")) {
        href = new URL(href, url).href;
      }
      return href;
    }
  } catch (e) {
    console.warn("Failed to parse HTML, falling back to service");
  }

  // Fallback to Google's service
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
