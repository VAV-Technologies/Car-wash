import { FadeIn } from "@/components/ui/fade-in";

export default function PrivacyPage() {
  return (
    <div className="bg-brand-dark-gray">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto py-24 md:py-32">
          <FadeIn direction="up">
            <div className="text-center space-y-4 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-lg text-white/70">
                Last Updated: March 10, 2026
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <div className="prose prose-lg prose-invert max-w-4xl mx-auto px-4 text-justify text-white/80 [&_h2]:text-left [&_h2]:text-white [&_h3]:text-left [&_h3]:text-white [&_h2]:mt-20 [&_h2]:mb-6 [&_h2]:pt-10 [&_h2]:border-t [&_h2]:border-white/10 [&_h3]:mt-10 [&_h3]:mb-4 [&_p]:!mb-[1.5em] [&_p]:leading-relaxed [&_li]:!mb-[0.5em] [&_ul]:!mb-[1.5em] [&_strong]:font-semibold">

            {/* -- Introduction -- */}
            <p>
              PT Vav Technologies Indonesia, operating under the name Castudio, and its affiliates (collectively, <strong>&quot;Castudio,&quot;</strong> <strong>&quot;we,&quot;</strong> <strong>&quot;us,&quot;</strong> or <strong>&quot;our&quot;</strong>) is committed to protecting your privacy and handling your personal data responsibly. This Privacy Policy (&quot;Policy&quot;) explains how we collect, use, disclose, store, and safeguard your information when you access or use our website, platform, applications, tools, and all related services (collectively, the <strong>&quot;Services&quot;</strong>).
            </p>
            <p>
              By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with this Policy, you must immediately cease all use of our Services. This Policy forms part of and is incorporated into our Terms of Service.
            </p>
            <p>
              Our Services are designed to provide premium car wash, car detailing, ceramic coating, paint correction, interior restoration, and related vehicle care services. We collect information necessary to provide our car care services, process bookings, manage subscriptions, and communicate with you. Given the personal nature of the data we handle, we take data protection with the utmost seriousness.
            </p>

            {/* -- 1. Definitions -- */}
            <h2 className="font-heading">1. Definitions</h2>
            <p>For the purposes of this Privacy Policy, the following terms shall have the meanings set out below:</p>
            <ul>
              <li><strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or identifiable natural person (&quot;Data Subject&quot;), including but not limited to name, identification number, location data, online identifiers, and factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that person.</li>
              <li><strong>&quot;Vehicle Data&quot;</strong> means any information relating to a Customer&apos;s vehicle, including make, model, year, color, license plate number, VIN, service history, vehicle condition records, and any other information provided in connection with Car Care Services.</li>
              <li><strong>&quot;Processing&quot;</strong> means any operation or set of operations performed on Personal Data or Vehicle Data, whether by automated means or not, including collection, recording, organization, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure by transmission, dissemination, alignment, combination, restriction, erasure, or destruction.</li>
              <li><strong>&quot;Controller&quot;</strong> means the entity that determines the purposes and means of Processing Personal Data. Castudio acts as the Controller for Personal Data collected through the Services.</li>
              <li><strong>&quot;Processor&quot;</strong> means any entity that processes Personal Data on behalf of the Controller.</li>
              <li><strong>&quot;User&quot;</strong> or <strong>&quot;you&quot;</strong> means any individual or entity that accesses or uses the Services, including but not limited to Customers and general visitors.</li>
              <li><strong>&quot;Customer&quot;</strong> means any User who uses the Services to book, purchase, or receive car care services.</li>
              <li><strong>&quot;Platform&quot;</strong> means the Castudio website, web application, mobile applications, APIs, and any other digital interface through which the Services are delivered.</li>
              <li><strong>&quot;Cookies&quot;</strong> means small data files placed on your device when you visit the Platform, used to store information about your browsing activity and preferences.</li>
              <li><strong>&quot;Applicable Law&quot;</strong> means all applicable laws, regulations, guidelines, and codes of practice relating to the Processing of Personal Data in any jurisdiction where we operate or where our Users are located.</li>
            </ul>

            {/* -- 2. Information We Collect -- */}
            <h2 className="font-heading">2. Information We Collect</h2>
            <p>We collect information from and about you through various means when you interact with our Services. The types of information we collect include the following:</p>

            <h3 className="font-heading">2.1 Personal Information You Provide Directly</h3>
            <p>When you register for an account, submit forms, use our Services, or communicate with us, we may collect:</p>
            <ul>
              <li><strong>Identity Information:</strong> Full legal name, date of birth, nationality, government-issued identification numbers and documents (for verification purposes), and photographs.</li>
              <li><strong>Contact Information:</strong> Email address, telephone number, mobile number, mailing address, and other contact details.</li>
              <li><strong>Account Information:</strong> Username, password (stored in encrypted form), account preferences, and account settings.</li>
              <li><strong>Payment Information:</strong> Payment card information (processed through secure third-party payment processors), billing address, and tax identification numbers where applicable.</li>
              <li><strong>Communication Content:</strong> The content of messages, inquiries, emails, feedback, reviews, and other communications you send through or in connection with the Services.</li>
            </ul>

            <h3 className="font-heading">2.2 Vehicle Information</h3>
            <p>In connection with Car Care Services provided through the Platform, we may collect:</p>
            <ul>
              <li><strong>Vehicle Details:</strong> Car make, model, year, color, body type, and any special features or modifications relevant to the service.</li>
              <li><strong>License Plate and Identification:</strong> License plate number, vehicle identification number (VIN), and registration details.</li>
              <li><strong>Service History:</strong> Records of previous services performed by Castudio, including dates, service types, products used, and notes from technicians.</li>
              <li><strong>Vehicle Condition Records:</strong> Pre-service inspection notes, photographs documenting vehicle condition before and after service, and records of any pre-existing damage.</li>
              <li><strong>Booking Data:</strong> Details of service bookings, preferred service times, special instructions, subscription plan details, and cancellation history.</li>
            </ul>

            <h3 className="font-heading">2.3 Information Collected Automatically</h3>
            <p>When you access or use the Services, we automatically collect certain information, including:</p>
            <ul>
              <li><strong>Device Information:</strong> Device type, operating system and version, unique device identifiers, hardware model, browser type and version, screen resolution, and language preferences.</li>
              <li><strong>Log Data:</strong> IP address, access times and dates, pages viewed, time spent on pages, clickstream data, referring/exit URLs, and error logs.</li>
              <li><strong>Usage Data:</strong> Features used, actions taken on the Platform, search queries, services viewed, booking patterns, and frequency and duration of use.</li>
              <li><strong>Location Data:</strong> Approximate geographic location inferred from your IP address, and, where you provide consent, more precise location data from your mobile device to help you find our nearest service location.</li>
              <li><strong>Network Information:</strong> Internet service provider, connection type, connection speed, and network configuration data.</li>
            </ul>

            <h3 className="font-heading">2.4 Cookies and Tracking Technologies</h3>
            <p>We use cookies, web beacons, pixel tags, local storage, and similar tracking technologies to collect information about your use of the Services. These include:</p>
            <ul>
              <li><strong>Strictly Necessary Cookies:</strong> Essential for the operation of our Platform, enabling core functionality such as security, session management, network management, and accessibility. These cookies cannot be disabled.</li>
              <li><strong>Performance and Analytics Cookies:</strong> Help us understand how Users interact with the Platform by collecting and reporting information anonymously, including page visit counts, traffic sources, bounce rates, and user flow patterns.</li>
              <li><strong>Functionality Cookies:</strong> Allow the Platform to remember choices you make (such as language, region, or display preferences) and provide enhanced, personalized features.</li>
              <li><strong>Targeting and Advertising Cookies:</strong> Used to deliver advertisements relevant to you and your interests, to limit the number of times you see an advertisement, and to measure the effectiveness of advertising campaigns.</li>
              <li><strong>Third-Party Cookies:</strong> Set by third-party services that appear on our pages, including analytics providers (such as Google Analytics), social media platforms, and advertising networks.</li>
            </ul>

            <h3 className="font-heading">2.5 Information from Third Parties</h3>
            <p>We may receive information about you from third-party sources, including:</p>
            <ul>
              <li><strong>Identity Verification Providers:</strong> Information from identity verification platforms used to confirm your identity.</li>
              <li><strong>Social Media and Professional Networks:</strong> Information from social media profiles and other publicly available profiles, where you have connected such accounts or where the information is publicly available.</li>
              <li><strong>Referral Partners:</strong> Information provided by partner businesses, corporate clients, or fleet management companies who refer clients to our Platform.</li>
              <li><strong>Payment Processors:</strong> Transaction confirmation, payment status, and fraud detection information from third-party payment service providers (e.g., Stripe).</li>
            </ul>

            {/* -- 3. How We Use Your Information -- */}
            <h2 className="font-heading">3. How We Use Your Information</h2>
            <p>We process your information for the following purposes:</p>

            <h3 className="font-heading">3.1 Providing and Maintaining the Services</h3>
            <ul>
              <li>Creating, managing, and authenticating your account.</li>
              <li>Processing and managing service bookings, scheduling, and appointment reminders.</li>
              <li>Performing car care services and maintaining service records for your vehicle.</li>
              <li>Processing and facilitating communications between you and our service team.</li>
              <li>Providing customer support, responding to inquiries, and resolving disputes.</li>
              <li>Processing subscriptions, payments, refunds, and generating invoices and receipts.</li>
            </ul>

            <h3 className="font-heading">3.2 Verification, Compliance, and Risk Management</h3>
            <ul>
              <li>Verifying your identity and account information as needed.</li>
              <li>Detecting, investigating, and preventing fraud, unauthorized access, and other illegal or prohibited activities.</li>
              <li>Enforcing our Terms of Service, this Privacy Policy, and other agreements.</li>
              <li>Managing risk, conducting internal audits, and maintaining security incident response procedures.</li>
            </ul>

            <h3 className="font-heading">3.3 Improving and Personalizing the Services</h3>
            <ul>
              <li>Analyzing usage patterns, trends, and user behavior to improve Platform functionality, user interface, and user experience.</li>
              <li>Personalizing content, service recommendations, and notifications based on your preferences, vehicle data, and service history.</li>
              <li>Conducting research, surveys, and statistical analysis to develop new features, products, and services.</li>
              <li>Testing new features, conducting A/B testing, and optimizing Platform performance.</li>
            </ul>

            <h3 className="font-heading">3.4 Communications</h3>
            <ul>
              <li>Sending transactional messages related to your account, bookings, and services (e.g., confirmation emails, appointment reminders, status updates).</li>
              <li>Sending administrative notices, including security alerts, system updates, policy changes, and service announcements.</li>
              <li>Sending marketing and promotional communications about our Services, special offers, and relevant updates (where you have opted in or where permitted by Applicable Law).</li>
              <li>Facilitating in-platform notifications and real-time messaging.</li>
            </ul>

            <h3 className="font-heading">3.5 Legal and Regulatory Compliance</h3>
            <ul>
              <li>Complying with Applicable Law, regulatory requirements, legal processes, and governmental requests.</li>
              <li>Establishing, exercising, or defending legal claims.</li>
              <li>Cooperating with law enforcement, regulatory authorities, and courts as required or permitted by law.</li>
              <li>Maintaining records as required by tax, financial reporting, and other regulatory obligations.</li>
            </ul>

            {/* -- 4. Legal Basis for Processing -- */}
            <h2 className="font-heading">4. Legal Basis for Processing</h2>
            <p>We process your Personal Data on the following legal bases, as applicable under the relevant Applicable Law:</p>
            <ul>
              <li><strong>Contractual Necessity:</strong> Processing is necessary for the performance of a contract to which you are a party, or to take steps at your request prior to entering into a contract. This includes providing you access to and use of the Services, processing bookings, and fulfilling our obligations under our Terms of Service.</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for the purposes of our legitimate interests or those of a third party, provided that such interests are not overridden by your fundamental rights and freedoms. Our legitimate interests include: operating and improving the Platform; ensuring network and information security; preventing fraud and illegal activity; conducting internal administration, accounting, and auditing; conducting business analytics; and marketing our Services to existing customers.</li>
              <li><strong>Consent:</strong> Where required by Applicable Law, we process your Personal Data based on your freely given, specific, informed, and unambiguous consent. You may withdraw your consent at any time by contacting us, though withdrawal will not affect the lawfulness of Processing based on consent before its withdrawal.</li>
              <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with a legal obligation to which we are subject, including tax obligations, regulatory reporting, and responding to lawful requests from public authorities.</li>
              <li><strong>Vital Interests:</strong> In rare circumstances, Processing may be necessary to protect the vital interests of you or another natural person.</li>
              <li><strong>Public Interest:</strong> Processing may be necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in us.</li>
            </ul>

            {/* -- 5. Information Sharing and Disclosure -- */}
            <h2 className="font-heading">5. Information Sharing and Disclosure</h2>
            <p>We may share your information in the following circumstances and with the following categories of recipients. <strong>We do not sell your Personal Data to third parties.</strong></p>

            <h3 className="font-heading">5.1 With Service Personnel</h3>
            <p>Information necessary to perform Car Care Services will be shared with our service technicians and staff:</p>
            <ul>
              <li><strong>Service Details:</strong> Vehicle information, booking details, special instructions, and service history relevant to the work being performed.</li>
              <li><strong>Contact Information:</strong> Your name and contact details may be shared with our service team for scheduling and communication purposes.</li>
            </ul>

            <h3 className="font-heading">5.2 Service Providers and Processors</h3>
            <p>We engage third-party service providers who process Personal Data on our behalf to perform functions and provide services to us, including:</p>
            <ul>
              <li><strong>Cloud Hosting and Infrastructure:</strong> Servers, databases, content delivery networks, and storage services.</li>
              <li><strong>Payment Processing:</strong> Secure payment gateway providers (e.g., Stripe) for processing service fees, subscription payments, and other payments.</li>
              <li><strong>Analytics and Performance Monitoring:</strong> Web analytics, error tracking, performance monitoring, and business intelligence tools.</li>
              <li><strong>Communication Services:</strong> Email delivery, SMS messaging, push notification services, and customer support platforms.</li>
              <li><strong>Professional Services:</strong> Legal, accounting, auditing, insurance, and consulting firms providing professional advice and services to Castudio.</li>
              <li><strong>Marketing and Advertising:</strong> Advertising platforms, marketing automation tools, and customer relationship management systems.</li>
            </ul>
            <p>All service providers are contractually obligated to protect your data, process it only for specified purposes, and comply with applicable data protection requirements.</p>

            <h3 className="font-heading">5.3 Business Transfers</h3>
            <p>If Castudio is involved in a merger, acquisition, reorganization, bankruptcy, receivership, dissolution, sale of all or substantially all assets, or similar corporate event, your information may be transferred, assigned, or disclosed to the acquiring entity or successor, subject to the same privacy protections described in this Policy. We will provide notice before your Personal Data is transferred and becomes subject to a different privacy policy.</p>

            <h3 className="font-heading">5.4 Legal Requirements and Protection of Rights</h3>
            <p>We may disclose your information if we believe in good faith that such disclosure is necessary to:</p>
            <ul>
              <li>Comply with any applicable law, regulation, legal process, subpoena, court order, or governmental request.</li>
              <li>Enforce our Terms of Service, this Privacy Policy, or other agreements, including investigation of potential violations.</li>
              <li>Detect, prevent, investigate, or address fraud, security incidents, technical issues, or illegal activity.</li>
              <li>Protect the rights, property, safety, or security of Castudio, our Users, our employees, or the public, as required or permitted by law.</li>
              <li>Respond to claims that any content on the Platform violates the rights of third parties.</li>
              <li>Cooperate with law enforcement investigations, regulatory inquiries, and legal proceedings.</li>
            </ul>

            <h3 className="font-heading">5.5 Cross-Border Data Transfers</h3>
            <p>Your information may be transferred to, stored in, and processed in countries other than the country in which you reside. These countries may have data protection laws that differ from and may be less protective than the laws of your jurisdiction.</p>
            <p>Where we transfer Personal Data internationally, we implement commercially reasonable safeguards to protect your data. By using our Services, you acknowledge and consent to the transfer of your information to countries outside your jurisdiction for the purposes described in this Policy.</p>

            <h3 className="font-heading">5.6 Aggregated and De-Identified Data</h3>
            <p>We may share aggregated, anonymized, or de-identified data that cannot reasonably be used to identify you for any purpose, including market research, industry analysis, benchmarking, and business development. Such data is not considered Personal Data under most Applicable Laws.</p>

            {/* -- 6. Data Security -- */}
            <h2 className="font-heading">6. Data Security</h2>
            <p>We implement and maintain commercially reasonable and industry-standard technical, administrative, and physical security measures designed to protect your information from unauthorized access, use, alteration, disclosure, destruction, loss, or accidental damage. These measures include, but are not limited to:</p>
            <ul>
              <li><strong>Encryption:</strong> Encryption of data in transit using TLS/SSL protocols and encryption of sensitive data at rest using AES-256 or equivalent encryption standards.</li>
              <li><strong>Access Controls:</strong> Role-based access controls, multi-factor authentication, strong password policies, and principle of least privilege for employees and contractors who access Personal Data.</li>
              <li><strong>Infrastructure Security:</strong> Firewalls, intrusion detection and prevention systems, network segmentation, regular vulnerability assessments, and penetration testing.</li>
              <li><strong>Monitoring and Logging:</strong> Continuous monitoring of systems for suspicious activity, comprehensive audit logs, and automated alerting for security events.</li>
              <li><strong>Incident Response:</strong> Documented incident response procedures, including notification protocols in compliance with Applicable Law.</li>
              <li><strong>Employee Training:</strong> Regular data protection and security awareness training for all personnel who handle Personal Data.</li>
              <li><strong>Vendor Management:</strong> Due diligence assessments of third-party service providers&apos; security practices and contractual requirements for data protection.</li>
            </ul>
            <p><strong>Important Notice:</strong> Despite our efforts, no method of transmission over the Internet, method of electronic storage, or security system is completely secure or impervious to all threats. While we strive to use commercially reasonable means to protect your Personal Data, <strong>we cannot and do not guarantee the absolute security of your information</strong>. Any transmission of Personal Data to us is at your own risk, and you are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>

            {/* -- 7. Data Retention -- */}
            <h2 className="font-heading">7. Data Retention</h2>
            <p>We retain your Personal Data for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, regulatory, accounting, or reporting requirements. To determine the appropriate retention period, we consider:</p>
            <ul>
              <li>The amount, nature, and sensitivity of the Personal Data.</li>
              <li>The potential risk of harm from unauthorized use or disclosure.</li>
              <li>The purposes for which we process the data and whether we can achieve those purposes through other means.</li>
              <li>Applicable legal, regulatory, tax, accounting, or other requirements.</li>
              <li>Applicable statutes of limitation for potential legal claims.</li>
            </ul>
            <p>Specific retention periods include:</p>
            <ul>
              <li><strong>Account Data:</strong> Retained for the duration of your account and for a period of seven (7) years following account closure, or longer as required by Applicable Law.</li>
              <li><strong>Service and Booking Records:</strong> Retained for a minimum of seven (7) years from the date of the service, or longer as required by tax, accounting, or regulatory requirements.</li>
              <li><strong>Vehicle Service History:</strong> Retained for the duration of your account and for a reasonable period thereafter to support warranty claims and service continuity.</li>
              <li><strong>Communication Records:</strong> Retained for a minimum of three (3) years from the date of the communication, or longer as required for dispute resolution or legal compliance.</li>
              <li><strong>Marketing Consent Records:</strong> Retained for the duration of the consent and for a reasonable period thereafter to demonstrate compliance.</li>
              <li><strong>Log and Usage Data:</strong> Generally retained for up to twenty-four (24) months, unless longer retention is required for security, legal, or compliance purposes.</li>
            </ul>
            <p>When your Personal Data is no longer required, we will securely delete, destroy, or anonymize it in accordance with our data retention and destruction policies. Anonymized data that can no longer be associated with you may be retained indefinitely.</p>

            {/* -- 8. Your Rights -- */}
            <h2 className="font-heading">8. Your Rights</h2>
            <p>Depending on your jurisdiction and the Applicable Law, you may have certain rights regarding your Personal Data. We are committed to facilitating the exercise of these rights in accordance with Applicable Law. Please note that these rights are not absolute and may be subject to exceptions and limitations.</p>

            <h3 className="font-heading">8.1 Right of Access</h3>
            <p>You have the right to request confirmation as to whether we process your Personal Data and, if so, to obtain a copy of the Personal Data we hold about you, together with information about how and why we process it.</p>

            <h3 className="font-heading">8.2 Right to Rectification (Correction)</h3>
            <p>You have the right to request that we correct any inaccurate or incomplete Personal Data we hold about you. You can typically update your account information directly through your dashboard.</p>

            <h3 className="font-heading">8.3 Right to Erasure (Deletion)</h3>
            <p>You have the right to request the deletion of your Personal Data in certain circumstances, such as when the data is no longer necessary for the purposes for which it was collected, or when you withdraw consent (where consent is the legal basis for processing). This right is subject to exceptions, including where retention is necessary for compliance with legal obligations, for the establishment, exercise, or defense of legal claims, or for reasons of public interest.</p>

            <h3 className="font-heading">8.4 Right to Data Portability</h3>
            <p>Where technically feasible, you have the right to receive the Personal Data you have provided to us in a structured, commonly used, and machine-readable format, and to transmit that data to another controller without hindrance, where the processing is based on consent or contract and is carried out by automated means.</p>

            <h3 className="font-heading">8.5 Right to Restriction of Processing</h3>
            <p>You have the right to request that we restrict the processing of your Personal Data in certain circumstances, such as when you contest the accuracy of the data, when the processing is unlawful but you oppose erasure, or when we no longer need the data but you require it for legal claims.</p>

            <h3 className="font-heading">8.6 Right to Object</h3>
            <p>You have the right to object to the processing of your Personal Data where processing is based on our legitimate interests or for direct marketing purposes. Where you object to direct marketing, we will cease processing your Personal Data for such purposes promptly.</p>

            <h3 className="font-heading">8.7 Right to Withdraw Consent</h3>
            <p>Where we process your Personal Data based on your consent, you have the right to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing carried out before the withdrawal.</p>

            <h3 className="font-heading">8.8 Right to Lodge a Complaint</h3>
            <p>You have the right to lodge a complaint with the relevant data protection authority in your jurisdiction if you believe that our processing of your Personal Data infringes Applicable Law. We encourage you to contact us first so that we can attempt to resolve your concern.</p>

            <h3 className="font-heading">8.9 Exercising Your Rights</h3>
            <p>To exercise any of these rights, please contact us at <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline">hello@castudio.co</a>. We will respond to your request within the timeframe required by Applicable Law (typically within thirty (30) days). We may need to verify your identity before fulfilling your request. If your request is manifestly unfounded, excessive, or repetitive, we reserve the right to charge a reasonable fee or refuse to act on the request, as permitted by Applicable Law.</p>

            {/* -- 9. Cookies and Tracking Technologies -- */}
            <h2 className="font-heading">9. Cookies and Tracking Technologies</h2>

            <h3 className="font-heading">9.1 What Are Cookies</h3>
            <p>Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and to report information to website operators.</p>

            <h3 className="font-heading">9.2 How We Use Cookies</h3>
            <p>We use cookies and similar technologies for the following purposes:</p>
            <ul>
              <li><strong>Authentication and Security:</strong> To recognize you when you sign in, maintain your session, prevent CSRF attacks, and detect fraudulent or unauthorized activity.</li>
              <li><strong>Preferences:</strong> To remember your settings, language preferences, display preferences, and other customizations.</li>
              <li><strong>Analytics:</strong> To understand how Users interact with the Platform, which pages are most frequently visited, where errors occur, and to measure the effectiveness of content and features.</li>
              <li><strong>Advertising:</strong> To serve relevant advertisements, limit ad frequency, and measure ad campaign effectiveness (where applicable).</li>
              <li><strong>Performance:</strong> To monitor Platform performance, load balancing, and to optimize page load times and user experience.</li>
            </ul>

            <h3 className="font-heading">9.3 Third-Party Analytics</h3>
            <p>We may use third-party analytics services, such as Google Analytics, Mixpanel, Hotjar, or similar services, to collect and analyze usage data. These services may use cookies and other tracking technologies to collect data about your use of the Platform and other websites, including your IP address, browser type, pages visited, time spent on pages, and interactions. The information generated is typically transmitted to and stored by these third parties on their servers. We encourage you to review the privacy policies of these third-party analytics providers.</p>

            <h3 className="font-heading">9.4 Managing Cookies</h3>
            <p>You can manage your cookie preferences through your browser settings. Most browsers allow you to refuse or delete cookies. Please note that if you choose to disable cookies, some features of the Platform may not function properly or may become unavailable. You can also opt out of certain analytics cookies through the opt-out mechanisms provided by analytics services (e.g., Google Analytics Opt-out Browser Add-on).</p>

            <h3 className="font-heading">9.5 Do Not Track Signals</h3>
            <p>Some browsers transmit &quot;Do Not Track&quot; (&quot;DNT&quot;) signals to websites. Due to the lack of a common industry standard for interpreting DNT signals, we do not currently respond to or alter our practices when we detect a DNT signal from your browser. We will continue to monitor developments in DNT technology and may update this practice in the future.</p>

            {/* -- 10. Children's Privacy -- */}
            <h2 className="font-heading">10. Children&apos;s Privacy</h2>
            <p>Our Services are not intended for use by individuals under the age of eighteen (18), or the age of majority in their jurisdiction, whichever is higher. We do not knowingly collect, solicit, or process Personal Data from children. If we become aware that we have collected Personal Data from a child without appropriate parental or guardian consent, we will take steps to delete that information as quickly as possible. If you believe that a child has provided us with Personal Data, please contact us immediately at <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline">hello@castudio.co</a>.</p>

            {/* -- 11. Third-Party Links and Services -- */}
            <h2 className="font-heading">11. Third-Party Links and Services</h2>
            <p>Our Platform may contain links to third-party websites, applications, services, or resources that are not owned or controlled by Castudio, including those of our service providers, partners, advertisers, and other third parties. This Privacy Policy applies only to our Services and does not extend to any third-party websites or services.</p>
            <p><strong>We have no control over, and assume no responsibility for, the content, privacy policies, practices, or security of any third-party websites or services.</strong> The inclusion of a link or integration does not imply endorsement by Castudio. We strongly encourage you to review the privacy policies and terms of service of every third-party website or service you visit or interact with. You access and use third-party websites and services at your own risk, and Castudio shall not be liable for any damages, losses, or claims arising from your use of such third-party websites or services.</p>

            {/* -- 12. International Data Transfers -- */}
            <h2 className="font-heading">12. International Data Transfers</h2>
            <p>Castudio may operate across multiple jurisdictions. As such, your Personal Data may be transferred to, and processed in, countries other than the country in which you are located. These international transfers are necessary for the operation of our Services.</p>
            <p>We take commercially reasonable steps to protect your Personal Data when it is transferred internationally. By using our Services, you acknowledge and consent to the international transfer and processing of your Personal Data as described in this Policy. If you have concerns about international data transfers, please contact us before using the Services.</p>

            {/* -- 13. Your Privacy Rights by Jurisdiction -- */}
            <h2 className="font-heading">13. Your Privacy Rights</h2>
            <p>Depending on where you are located, you may have additional rights under the data protection laws applicable in your jurisdiction. These may include rights of access, correction, deletion, restriction of processing, data portability, and the right to object to certain processing activities.</p>
            <p>We are committed to respecting your privacy rights as provided under the laws applicable to you. If you wish to exercise any rights available to you under your local data protection laws, please contact us at <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline">hello@castudio.co</a>. We will respond to your request within a commercially reasonable timeframe and in accordance with applicable legal requirements.</p>
            <p>If you believe that our processing of your Personal Data infringes applicable law, you may have the right to lodge a complaint with the relevant data protection authority in your jurisdiction. We encourage you to contact us first so that we can attempt to resolve your concern directly.</p>

            {/* -- 14. Automated Decision-Making and Profiling -- */}
            <h2 className="font-heading">14. Automated Decision-Making and Profiling</h2>
            <p>We may use automated processing, including profiling, in connection with the Services for the following purposes:</p>
            <ul>
              <li><strong>Fraud Detection and Prevention:</strong> Automated systems may analyze account activity and behavioral signals to detect and prevent fraudulent or suspicious activity.</li>
              <li><strong>Service Recommendations:</strong> Algorithmic matching may be used to recommend relevant services, packages, or subscription plans based on your vehicle data, preferences, and service history.</li>
              <li><strong>Content Moderation:</strong> Automated tools may be used to screen user-generated content for compliance with our Terms of Service and community guidelines.</li>
            </ul>
            <p>Where automated decision-making produces legal effects or similarly significantly affects you, you have the right (where provided by Applicable Law) to:</p>
            <ul>
              <li>Obtain meaningful information about the logic involved in the automated decision.</li>
              <li>Express your point of view and contest the decision.</li>
              <li>Obtain human intervention in the decision-making process.</li>
            </ul>
            <p>To exercise these rights, please contact us at <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline">hello@castudio.co</a>.</p>

            {/* -- 15. Limitation of Liability -- */}
            <h2 className="font-heading">15. Limitation of Liability</h2>
            <p>To the maximum extent permitted by Applicable Law:</p>
            <ul>
              <li>Castudio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, business opportunities, goodwill, or reputation, arising out of or relating to any breach of this Privacy Policy or any unauthorized access to, use of, or disclosure of your Personal Data, regardless of the cause of action or theory of liability.</li>
              <li>Castudio&apos;s total aggregate liability to you for all claims arising out of or relating to this Privacy Policy shall not exceed the greater of (a) the total amount of fees paid by you to Castudio in the twelve (12) months immediately preceding the event giving rise to the claim, or (b) one hundred United States dollars (USD $100).</li>
              <li>You acknowledge and agree that the limitations of liability set forth in this section are fundamental elements of the agreement between you and Castudio, and that Castudio would not provide the Services without such limitations.</li>
            </ul>

            {/* -- 16. Indemnification -- */}
            <h2 className="font-heading">16. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless Castudio, its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to: (a) your breach of this Privacy Policy; (b) your use of the Services; (c) your violation of any rights of another party, including other Users; (d) your violation of any Applicable Law; or (e) any content or information you provide through the Services.</p>

            {/* -- 17. Governing Law and Dispute Resolution -- */}
            <h2 className="font-heading">17. Governing Law and Dispute Resolution</h2>
            <p>This Privacy Policy shall be governed by and construed in accordance with the laws of the Republic of Indonesia, without regard to its conflict of law provisions. Any dispute, controversy, or claim arising out of or relating to this Privacy Policy, or the breach, termination, or invalidity thereof, shall be resolved in accordance with the dispute resolution provisions set forth in our Terms of Service. You irrevocably submit to the exclusive jurisdiction of the courts of the Republic of Indonesia for the resolution of any such disputes, subject to the rights provided under Applicable Law in your jurisdiction.</p>

            {/* -- 18. Changes to This Privacy Policy -- */}
            <h2 className="font-heading">18. Changes to This Privacy Policy</h2>
            <p>We reserve the right to update, modify, or replace this Privacy Policy at any time at our sole discretion. When we make material changes, we will:</p>
            <ul>
              <li>Update the &quot;Last Updated&quot; date at the top of this page.</li>
              <li>Provide prominent notice on our Platform, such as a banner or pop-up notification.</li>
              <li>Where required by Applicable Law, send you a direct notification via email or through the Platform.</li>
              <li>Where required by Applicable Law, obtain your consent to the updated Policy before continuing to process your Personal Data under the new terms.</li>
            </ul>
            <p>Your continued use of the Services after the effective date of any changes constitutes your acceptance of the updated Privacy Policy. If you do not agree to the updated Policy, you must stop using the Services and, if applicable, close your account. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.</p>
            <p>Previous versions of this Privacy Policy are available upon request by contacting us at <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline">hello@castudio.co</a>.</p>

            {/* -- 19. Severability -- */}
            <h2 className="font-heading">19. Severability</h2>
            <p>If any provision of this Privacy Policy is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid, illegal, or unenforceable provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable while preserving the original intent of the parties.</p>

            {/* -- 20. Entire Agreement -- */}
            <h2 className="font-heading">20. Entire Agreement</h2>
            <p>This Privacy Policy, together with our Terms of Service and any other agreements expressly incorporated by reference, constitutes the entire agreement between you and Castudio with respect to the subject matter hereof and supersedes all prior or contemporaneous communications, representations, or agreements, whether oral or written, relating to the protection and processing of your Personal Data through the Services.</p>

            {/* -- 21. Contact Us -- */}
            <h2 className="font-heading">21. Contact Us</h2>
            <p>If you have any questions, concerns, complaints, or requests regarding this Privacy Policy or our data protection practices, please contact us using the following information:</p>
            <ul>
              <li><strong>Company:</strong> PT Vav Technologies Indonesia (operating as Castudio)</li>
              <li><strong>Email:</strong> <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline">hello@castudio.co</a></li>
              <li><strong>Subject Line:</strong> Privacy Policy Inquiry</li>
            </ul>
            <p>We will endeavor to respond to your inquiry within thirty (30) days or within the timeframe required by Applicable Law in your jurisdiction. For requests that are particularly complex or numerous, we may extend the response period by an additional sixty (60) days, in which case we will notify you of the extension and the reasons for the delay.</p>
            <p>If you are not satisfied with our response, you may escalate your concern to the relevant data protection authority in your jurisdiction.</p>

          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}
