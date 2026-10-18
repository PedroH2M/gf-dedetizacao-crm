import "./globals.css";

export const metadata = {
  title: { default: "GF Dedetização • CRM", template: "%s • GF Dedetização" },
  description: "CRM da GF Dedetização: clientes, ordens de serviço e propostas. O fim das pragas. A sua paz.",
  applicationName: "GF Dedetização",
  appleWebApp: { capable: true, title: "GF CRM", statusBarStyle: "black-translucent" },
  robots: { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121212",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
