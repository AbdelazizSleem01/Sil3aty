import {
  FileText,
  Check,
  X,
  AlertTriangle,
  Shield,
  User,
  CreditCard,
  Globe,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Sil3aty - Terms of Service",
  description: "Terms governing your use of Sil3aty services",
  openGraph: {
    title: "Sil3aty - Terms of Service",
    description: "Terms governing your use of Sil3aty services",
    url: "https://yourdomain.com/terms",
    siteName: "Sil3aty",
    images: [
      {
        url: "https://yourdomain.com/og-terms.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sil3aty - Terms of Service",
    description: "Terms governing your use of Sil3aty services",
    images: ["https://yourdomain.com/og-terms.png"],
  },
};

export default function Terms() {
  const termsSections = [
    {
      title: "Acceptance of Terms",
      icon: <Check className="w-5 h-5 text-primary" />,
      content: [
        "By accessing or using the Sil3aty website, mobile application, or services, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, please do not use our services.",
      ],
    },
    {
      title: "User Responsibilities",
      icon: <User className="w-5 h-5 text-primary" />,
      items: [
        "Provide accurate and complete account information",
        "Maintain the confidentiality of your password",
        "Use services only for lawful purposes",
        "Comply with all applicable laws and regulations",
        "Not engage in fraudulent, abusive, or illegal activities",
      ],
    },
    {
      title: "Payments & Billing",
      icon: <CreditCard className="w-5 h-5 text-primary" />,
      content: [
        "All prices are in USD unless otherwise stated.",
        "You agree to pay all charges incurred under your account.",
        "We reserve the right to refuse or cancel orders at our discretion.",
      ],
    },
    {
      title: "Intellectual Property",
      icon: <Shield className="w-5 h-5 text-primary" />,
      content: [
        "All content on our platform is owned by or licensed to Sil3aty.",
        "Unauthorized use may violate copyright, trademark, and other laws.",
        "Limited license granted for personal, non-commercial use only.",
      ],
    },
    {
      title: "Prohibited Conduct",
      icon: <X className="w-5 h-5 text-primary" />,
      items: [
        "Reverse engineering or hacking our services",
        "Using automated systems to extract data",
        "Impersonating others or false representations",
        "Uploading malicious code or viruses",
        "Interfering with service operation",
      ],
    },
    {
      title: "International Use",
      icon: <Globe className="w-5 h-5 text-primary" />,
      content: [
        "You are responsible for compliance with local laws.",
        "Some products may be subject to export controls.",
        "We make no representation that materials are appropriate for all jurisdictions.",
      ],
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-xl opacity-90 text-gray-700">
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="prose max-w-none mb-16">
          <p className="lead text-gray-600">
            These Terms of Service ("Terms") govern your access to and use of
            the Sil3aty website, mobile applications, and services ("Services").
            Please read them carefully.
          </p>
          <div className="alert alert-info mt-6 flex">
            <AlertTriangle className="w-5 h-5" />
            <span>
              By using our Services, you agree to these Terms. If you don't
              agree, you may not use the Services.
            </span>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {termsSections.map((section, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  {section.icon}
                  <h2 className="card-title text-xl text-primary">
                    {section.title}
                  </h2>
                </div>
                {section.items ? (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    {section.content.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Legal Sections */}
        <div className="prose max-w-none mb-16">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Limitation of Liability
          </h2>
          <p className="text-gray-600 ml-2">
            Sil3aty shall not be liable for any indirect, incidental, special,
            consequential or punitive damages, including without limitation,
            loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-primary mt-8">
            Governing Law
          </h2>
          <p className="text-gray-600 ml-2">
            These Terms shall be governed by and construed in accordance with
            the laws of the State of California, without regard to its conflict
            of law provisions.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-primary mt-8">
            Changes to Terms
          </h2>
          <p className="text-gray-600 ml-2">
            We reserve the right to modify these Terms at any time. We'll notify
            you of material changes through our Services or by email. Your
            continued use constitutes acceptance of the new Terms.
          </p>

          <div className="alert alert-warning mt-8">
            <AlertTriangle className="w-5 h-5" />
            <span>
              This English version governs our relationship. Translated versions
              are for convenience only.
            </span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Questions About These Terms?
            </h2>
            <p>
              Contact our legal team for any questions regarding these Terms of
              Service:
            </p>
            <div className="card-actions mt-4">
              <a
                href="mailto:abdelazizsleem957@gmail.com"
                className="btn btn-primary"
              >
                Contact Legal Department
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
