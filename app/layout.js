import './globals.css'

export const metadata = {
  metadataBase: new URL('https://opdesk.app'),
  title: { default: "OpDesk — Operate. Explore. Grow.", template: "%s | OpDesk" },
  description: "All-in-one operations management for safari operators, hotels, charters, shuttles & travel businesses across Africa. Bookings, staff, lodging, fleet, certifications & invoices.",
  keywords: ["safari operator software","lodge management","travel operator platform","shuttle management","charter booking system","staff certification tracking","South Africa safari software","hotel management Africa"],
  authors: [{ name: "OpDesk" }],
  creator: "OpDesk",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://opdesk.app",
    siteName: "OpDesk",
    title: "OpDesk — Operate. Explore. Grow.",
    description: "The command centre for Africa's travel & hospitality operators.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpDesk — Operate. Explore. Grow.",
    description: "All-in-one ops for safari, lodging, charters & shuttles.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/compass-icon.png" />
        <meta name="theme-color" content="#0F2540" />
      </head>
      <body>{children}</body>
    </html>
  )
}
