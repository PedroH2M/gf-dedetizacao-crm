export default function manifest() {
  return {
    name: "GF Dedetização CRM",
    short_name: "GF CRM",
    description: "O fim das pragas. A sua paz.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#121212",
    theme_color: "#121212",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
