export default function manifest() {
  return {
    name: "Sil3aty E-Commerce",
    short_name: "Sil3aty",
    description: "Modern e-commerce platform for all your shopping needs",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7C3AED",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    categories: ["shopping", "ecommerce", "retail"],
    lang: "en",
    dir: "ltr",
  };
}
