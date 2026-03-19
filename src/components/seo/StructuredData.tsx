'use client';

interface StructuredDataProps {
  type?: 'website' | 'localBusiness' | 'organization';
  title?: string;
  description?: string;
  url?: string;
}

export default function StructuredData({
  type = 'website',
  title = 'Castudio — Premium Car Wash & Detailing',
  description = 'Premium car wash and car detailing studio in Indonesia. Professional hand wash, ceramic coating, interior detailing, and flexible subscription plans.',
  url = 'https://www.castudio.co'
}: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'organization' ? 'Organization' : type === 'localBusiness' ? 'LocalBusiness' : 'WebSite',
      "name": "Castudio",
      "description": description,
      "url": url,
      "logo": "https://www.castudio.co/assets/nobridge_app_icon.png",
      "sameAs": []
    };

    if (type === 'localBusiness') {
      return {
        ...baseData,
        "@type": "LocalBusiness",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "ID"
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
          "name": "Castudio Team"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": "https://www.castudio.co/contact"
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
