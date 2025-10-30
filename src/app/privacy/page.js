"use client";
import { Shield, Lock, User, CreditCard, Mail, Globe } from "lucide-react";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Sil3aty - Privacy Policy";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Sil3aty is committed to maintaining your privacy and security. This privacy policy outlines how we collect, use, and protect your personal information."
      );
    }
  }, []);

  const policySections = [
    {
      title: "Information We Collect",
      icon: <User className="w-5 h-5 text-primary" />,
      items: [
        "Personal information (name, email, shipping address)",
        "Payment information (processed securely, not stored)",
        "Order history and preferences",
        "Device and browser information",
        "Cookies and usage data",
      ],
    },
    {
      title: "How We Use Information",
      icon: <Shield className="w-5 h-5 text-primary" />,
      items: [
        "Process and fulfill your orders",
        "Improve our products and services",
        "Personalize your shopping experience",
        "Communicate with you about orders and promotions",
        "Prevent fraud and enhance security",
      ],
    },
    {
      title: "Data Sharing",
      icon: <Globe className="w-5 h-5 text-primary" />,
      items: [
        "Service providers (payment processors, shipping carriers)",
        "Legal compliance (when required by law)",
        "Business transfers (in case of merger or acquisition)",
        "Never sold to third parties for marketing",
      ],
    },
    {
      title: "Your Rights",
      icon: <Lock className="w-5 h-5 text-primary" />,
      items: [
        "Access and update your personal information",
        "Request deletion of your data",
        "Opt-out of marketing communications",
        "Disable cookies in your browser settings",
        "Lodge complaints with data protection authorities",
      ],
    },
    {
      title: "Security Measures",
      icon: <CreditCard className="w-5 h-5 text-primary" />,
      items: [
        "SSL encryption for all data transmissions",
        "Regular security audits",
        "Limited employee access to sensitive data",
        "PCI-DSS compliance for payment processing",
        "Secure server infrastructure",
      ],
    },
    {
      title: "Contact Us",
      icon: <Mail className="w-5 h-5 text-primary" />,
      items: [
        "Email: privacy@Sil3aty.com",
        "Phone: +1 (800) 966-9669",
        "Mail: Sil3aty Privacy Office, 123 Security Lane, San Francisco, CA 94107",
        "Data Protection Officer: dpo@Sil3aty.com",
      ],
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto text-gray-800">
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
          <p className="lead text-gray-700">
            At Sil3aty, we are committed to protecting your privacy. This policy
            explains how we collect, use, and safeguard your personal
            information when you use our website and services.
          </p>
          <div className="alert alert-info mt-6">
            <Shield className="w-5 h-5" />
            <span>
              By using our services, you agree to the collection and use of
              information in accordance with this policy.
            </span>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {policySections.map((section, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  {section.icon}
                  <h2 className="card-title text-xl">{section.title}</h2>
                </div>
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
              </div>
            </div>
          ))}
        </div>

        {/* Additional Details */}
        <div className="prose max-w-none mb-16">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-800 ml-2">
            We use cookies and similar tracking technologies to track activity
            on our website and hold certain information. You can instruct your
            browser to refuse all cookies or to indicate when a cookie is being
            sent.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8 text-primary">
            Children's Privacy
          </h2>
          <p className="text-gray-800 ml-2">
            Our services are not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8 text-primary">
            Policy Updates
          </h2>
          <p className="text-gray-800 ml-2">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the "Last Updated" date.
          </p>

          <div className="alert alert-warning mt-8 ">
            <Shield className="w-5 h-5" />
            <span>
              This policy may be translated into other languages for
              convenience, but the English version governs your relationship
              with Sil3aty.
            </span>
          </div>
        </div>

        {/* Contact Card */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Privacy Questions?
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <div className="card-actions mt-4">
              <a
                href="mailto:abdelazizsleem957@gmail.com"
                className="btn btn-primary"
              >
                Email Our Privacy Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
