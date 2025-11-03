import "./globals.css";
import { Cairo } from "next/font/google";
import { getServerSession } from "next-auth";
import Providers from "../../components/Providers";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { authOptions } from "../../lib/authOptions";
import { ToastContainer } from "react-toastify";

export const dynamic = 'force-dynamic';

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata = {
  title: {
    default: "Sil3aty - منصة تسوق إلكترونية حديثة",
    template: "%s | Sil3aty للتسوق الإلكتروني",
  },
  description:
    "اكتشف أفضل المنتجات بأفضل الأسعار! منصة Sil3aty توفر لك تجربة تسوق إلكترونية آمنة، شحن سريع، وخدمة عملاء مميزة.",
  keywords: [
    "تسوق إلكتروني",
    "منتجات",
    "إلكترونيات",
    "أزياء",
    "أدوات منزلية",
    "منتجات تجميل",
    "دفع آمن",
    "توصيل سريع",
  ].join(", "),
  authors: [
    { name: "فريق Sil3aty", url: "https://ecommerce-Sil3aty.vercel.app" },
  ],
  creator: "Sil3aty للتسوق الإلكتروني",
  publisher: "Sil3aty Store",
  metadataBase: new URL("https://ecommerce-Sil3aty.vercel.app"),
  openGraph: {
    title: "Sil3aty - منصة تسوق إلكترونية حديثة",
    description:
      "تسوّق أحدث الإلكترونيات، الأزياء، الأدوات المنزلية والمزيد عبر منصة Sil3aty بتجربة سريعة وآمنة.",
    url: "https://ecommerce-Sil3aty.vercel.app",
    siteName: "Sil3aty للتسوق الإلكتروني",
    images: [
      {
        url: "/images/logo copy.png",
        width: 1200,
        height: 630,
        alt: "Sil3aty منصة تسوق إلكترونية",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sil3aty - منصة تسوق إلكترونية حديثة",
    description:
      "تسوّق كل ما تحتاجه عبر Sil3aty بأفضل الأسعار والتوصيل السريع والدفع الآمن.",
    creator: "@Sil3aty_store",
    images: ["/twitter-image.jpg"],
  },
};

export default async function RootLayout({ children }) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error getting server session:", error);
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="color-scheme" content="light" />
        <meta
          name="google-site-verification"
          content="XmY_2KMylvB5fL9pedfQYmV4Pqj1NmhwVvt07VIVzG4"
        />
        <meta name="msapplication-TileColor" content="#7C3AED" />
      </head>
      <body className={cairo.className} data-theme="Sil3aty">
        <Providers session={session}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow mt-6">
              {children}
            </main>
            <Footer />
          </div>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
