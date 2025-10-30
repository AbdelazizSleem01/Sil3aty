export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://ecommerce-Sil3aty.vercel.app";
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return {
        title: "Product Not Found | Sil3aty",
        description: "The requested product could not be found.",
      };
    }

    const product = await response.json();

    const title = `${product.name} | Sil3aty - متجر إلكتروني`;
    const description = product.description
      ? product.description.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
      : `اكتشف ${product.name} في متجر Sil3aty الإلكتروني. جودة عالية وأسعار مميزة.`;

    const images =
      product.images && product.images.length > 0
        ? product.images.map((image) => ({
            url: image,
            width: 800,
            height: 600,
            alt: product.name,
          }))
        : [
            {
              url: "/images/logo copy.png",
              width: 800,
              height: 600,
              alt: "Sil3aty Store",
            },
          ];

    return {
      title,
      description,
      keywords: [
        product.name,
        product.category?.name,
        product.brand?.name,
        "تسوق إلكتروني",
        "منتجات",
        "Sil3aty",
        "متجر إلكتروني",
        "جودة عالية",
        ...(product.tags || []),
      ]
        .filter(Boolean)
        .join(", "),
      authors: [
        { name: "متجر Sil3aty", url: "https://ecommerce-Sil3aty.vercel.app" },
      ],
      creator: "Sil3aty Store",
      publisher: "Sil3aty للتسوق الإلكتروني",
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL("https://ecommerce-Sil3aty.vercel.app"),
      alternates: {
        canonical: `/product/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `/product/${id}`,
        siteName: "Sil3aty - متجر إلكتروني",
        images,
        locale: "ar_SA",
        type: "website",
        "article:author": "Sil3aty Store",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
        creator: "@Sil3aty_store",
        site: "@Sil3aty_store",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      verification: {
        google: "XmY_2KMylvB5fL9pedfQYmV4Pqj1NmhwVvt07VIVzG4",
      },
    };
  } catch (error) {
    return {
      title: "Sil3aty - متجر إلكتروني",
      description:
        "اكتشف أفضل المنتجات بأفضل الأسعار في متجر Sil3aty الإلكتروني",
    };
  }
}
