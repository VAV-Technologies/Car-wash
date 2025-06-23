'use client';

interface StructuredDataProps {
  type?: 'website' | 'marketplace' | 'organization';
  title?: string;
  description?: string;
  url?: string;
}

export default function StructuredData({
  type = 'website',
  title = 'Nobridge - Business Marketplace Platform',
  description = 'Connecting SME owners with investors and buyers in Asia. Find businesses for sale, investment opportunities, and connect with verified buyers and sellers.',
  url = 'https://www.nobridge.co'
}: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'organization' ? 'Organization' : 'WebSite',
      "name": "Nobridge",
      "description": description,
      "url": url,
      "logo": "https://www.nobridge.co/assets/nobridge_app_icon.png",
      "sameAs": [
        // Add your social media links here when available
      ]
    };

    if (type === 'marketplace') {
      return {
        ...baseData,
        "@type": "WebSite",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.nobridge.co/marketplace?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };
    }

    if (type === 'organization') {
      return {
        ...baseData,
        "@type": "Organization",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "Nobridge Team"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": "https://www.nobridge.co/contact"
        }
      };
    }

    return baseData;
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}
