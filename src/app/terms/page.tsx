import { FadeIn } from "@/components/ui/fade-in";

export default function TermsPage() {
  return (
    <div className="bg-brand-dark-gray">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto py-24 md:py-32">
          <FadeIn direction="up">
            <div className="text-center space-y-4 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Terms of Service
              </h1>
              <p className="text-lg text-white/70">
                Last Updated: March 20, 2026
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <div className="prose prose-lg prose-invert max-w-4xl mx-auto px-4 text-justify text-white/80 [&_h2]:text-left [&_h2]:text-white [&_h3]:text-left [&_h3]:text-white [&_h2]:mt-20 [&_h2]:mb-6 [&_h2]:pt-10 [&_h2]:border-t [&_h2]:border-white/10 [&_h3]:mt-10 [&_h3]:mb-4 [&_p]:!mb-[1.5em] [&_p]:leading-relaxed [&_li]:!mb-[0.5em] [&_ul]:!mb-[1.5em] [&_strong]:font-semibold">

            <p>
              Welcome to Castudio. These Terms of Service (<strong>&quot;Terms,&quot;</strong>{" "}
              <strong>&quot;Agreement&quot;</strong>) constitute a legally binding
              agreement between you (<strong>&quot;User,&quot;</strong>{" "}
              <strong>&quot;you,&quot;</strong> <strong>&quot;your&quot;</strong>)
              and PT Vav Technologies Indonesia, operating under the name Castudio (<strong>&quot;Castudio,&quot;</strong>{" "}
              <strong>&quot;Company,&quot;</strong> <strong>&quot;we,&quot;</strong>{" "}
              <strong>&quot;us,&quot;</strong> <strong>&quot;our&quot;</strong>),
              governing your access to and use of the Castudio website, platform,
              applications, tools, and all related services (collectively, the{" "}
              <strong>&quot;Platform&quot;</strong> or{" "}
              <strong>&quot;Services&quot;</strong>). By accessing or using the
              Platform in any manner, you acknowledge that you have read,
              understood, and agree to be bound by these Terms in their entirety.
              If you do not agree to these Terms, you must immediately cease all
              use of the Platform and Services.
            </p>
            <p>
              <strong>
                PLEASE READ THESE TERMS CAREFULLY. THEY CONTAIN IMPORTANT
                INFORMATION REGARDING YOUR LEGAL RIGHTS, REMEDIES, AND
                OBLIGATIONS, INCLUDING LIMITATIONS OF LIABILITY, INDEMNIFICATION
                OBLIGATIONS, DISCLAIMERS OF WARRANTIES, AND DISPUTE RESOLUTION
                PROVISIONS.
              </strong>
            </p>

            {/* ===== 1. DEFINITIONS ===== */}
            <h2 className="font-heading">1. Definitions</h2>
            <p>
              For the purposes of this Agreement, the following terms shall have
              the meanings set forth below:
            </p>
            <ul>
              <li>
                <strong>&quot;Account&quot;</strong> means the registered user
                account created by a User on the Platform.
              </li>
              <li>
                <strong>&quot;Car Care Services&quot;</strong> means the car wash,
                car detailing, ceramic coating, paint correction, interior
                restoration, and related vehicle care services provided by
                Castudio.
              </li>
              <li>
                <strong>&quot;Customer&quot;</strong> means any individual, entity,
                or organization that accesses the Platform with the intent to
                book, purchase, or otherwise use Car Care Services offered through
                the Platform.
              </li>
              <li>
                <strong>&quot;Confidential Information&quot;</strong> means any
                non-public information disclosed by one party to another in
                connection with the use of the Platform or Car Care Services,
                including but not limited to business plans, financial data,
                customer lists, trade secrets, proprietary methodologies,
                pricing structures, and any materials marked as confidential
                or that a reasonable person would understand to be confidential.
              </li>
              <li>
                <strong>&quot;Content&quot;</strong> means all text, data,
                images, graphics, videos, documents, files, service descriptions,
                reviews, and any other materials uploaded, submitted,
                posted, or transmitted by Users through the Platform.
              </li>
              <li>
                <strong>&quot;Service&quot;</strong> or{" "}
                <strong>&quot;Booking&quot;</strong> means any car wash,
                detailing, coating, restoration, or other vehicle care service
                booked, scheduled, or purchased through or in connection with
                the Platform.
              </li>
              <li>
                <strong>&quot;Intellectual Property&quot;</strong> means all
                patents, copyrights, trademarks, service marks, trade names,
                domain names, trade secrets, know-how, proprietary processes,
                software, algorithms, databases, designs, and any other
                intellectual property rights.
              </li>
              <li>
                <strong>&quot;Service Booking&quot;</strong> means any car care
                service appointment, package, or subscription scheduled on the
                Platform by a Customer.
              </li>
              <li>
                <strong>&quot;Party&quot;</strong> or{" "}
                <strong>&quot;Parties&quot;</strong> means Castudio and/or the
                User, as the context requires.
              </li>
              <li>
                <strong>&quot;Subscription&quot;</strong> means a recurring
                service plan purchased by a Customer that entitles them to
                specified Car Care Services at regular intervals and at
                predetermined pricing.
              </li>
              <li>
                <strong>&quot;User&quot;</strong> means any individual, entity, or
                organization that accesses, registers on, or uses the Platform,
                including but not limited to Customers and any other visitors.
              </li>
              <li>
                <strong>&quot;Vehicle&quot;</strong> means any motor vehicle
                presented by a Customer for Car Care Services, including but
                not limited to cars, motorcycles, SUVs, and light commercial
                vehicles.
              </li>
            </ul>

            {/* ===== 2. ELIGIBILITY ===== */}
            <h2 className="font-heading">2. Eligibility</h2>
            <h3 className="font-heading">2.1 Age and Capacity</h3>
            <p>
              You must be at least eighteen (18) years of age and possess the
              legal capacity to enter into binding contracts under the laws of
              your jurisdiction to use the Platform. By using the Platform, you
              represent and warrant that you meet these requirements.
            </p>
            <h3 className="font-heading">2.2 Entity Users</h3>
            <p>
              If you are accessing or using the Platform on behalf of a company,
              corporation, partnership, limited liability company, trust, or other
              legal entity, you represent and warrant that you have the full
              authority to bind such entity to these Terms. In such cases,{" "}
              <strong>&quot;you&quot;</strong> and <strong>&quot;your&quot;</strong>{" "}
              refer to both you individually and the entity you represent.
            </p>
            <h3 className="font-heading">2.3 Restricted Persons</h3>
            <p>
              You may not use the Platform if you are: (a) located in, or a
              resident of, a country or territory subject to comprehensive
              international sanctions; (b) designated on any applicable
              government restricted-party list; (c) previously suspended,
              removed, or banned from the Platform by Castudio; or (d) otherwise
              prohibited by applicable law from engaging in the activities
              contemplated by the Platform.
            </p>

            {/* ===== 3. ACCOUNT REGISTRATION ===== */}
            <h2 className="font-heading">3. Account Registration and Security</h2>
            <h3 className="font-heading">3.1 Account Creation</h3>
            <p>
              To access certain features of the Platform, you must create an
              Account by providing accurate, current, and complete information as
              prompted by the registration form. You agree to update your
              information promptly to maintain its accuracy.
            </p>
            <h3 className="font-heading">3.2 Account Security</h3>
            <p>
              You are solely responsible for maintaining the confidentiality and
              security of your Account credentials, including your password and
              any authentication tokens. You agree to immediately notify Castudio
              at{" "}
              <a
                href="mailto:hello@castudio.co"
                className="text-brand-orange hover:underline"
              >
                hello@castudio.co
              </a>{" "}
              of any unauthorized access to or use of your Account.
            </p>
            <h3 className="font-heading">3.3 Account Responsibility</h3>
            <p>
              You are fully responsible for all activities that occur under your
              Account, whether or not authorized by you. Castudio shall not be
              liable for any loss or damage arising from your failure to maintain
              the security of your Account credentials.
            </p>
            <h3 className="font-heading">3.4 Verification</h3>
            <p>
              Castudio may, at its sole discretion, require identity verification,
              vehicle ownership verification, or additional documentation before
              granting access to certain features or Car Care Services.
              Verification by Castudio does not constitute an endorsement,
              guarantee, or representation regarding any User or Service Booking.
            </p>
            <h3 className="font-heading">3.5 One Account Per User</h3>
            <p>
              Each individual or entity may maintain only one Account unless
              expressly authorized by Castudio in writing. Castudio reserves the
              right to merge, suspend, or terminate duplicate Accounts without
              notice.
            </p>

            {/* ===== 4. PLATFORM USE ===== */}
            <h2 className="font-heading">4. Platform Use and Acceptable Conduct</h2>
            <h3 className="font-heading">4.1 Permitted Use</h3>
            <p>
              The Platform is provided solely for legitimate purposes related to
              booking, managing, and receiving car wash, detailing, and related
              vehicle care services. You agree to use the Platform only for its
              intended purposes and in compliance with all applicable laws,
              regulations, and these Terms.
            </p>
            <h3 className="font-heading">4.2 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use the Platform for any unlawful, fraudulent, deceptive, or
                abusive purpose;
              </li>
              <li>
                Submit false, misleading, or inaccurate information, including in
                any booking, registration, or review;
              </li>
              <li>
                Circumvent, disable, or interfere with any security features of
                the Platform;
              </li>
              <li>
                Attempt to reverse-engineer, decompile, disassemble, or otherwise
                extract the source code of the Platform;
              </li>
              <li>
                Scrape, crawl, spider, harvest, or use any automated means to
                access the Platform or collect data from it without express
                written authorization from Castudio;
              </li>
              <li>
                Transmit any viruses, malware, worms, Trojan horses, or other
                harmful or disruptive code;
              </li>
              <li>
                Impersonate any person or entity, or falsely state or
                misrepresent your affiliation with any person or entity;
              </li>
              <li>
                Engage in any activity that could damage, disable, overburden, or
                impair the Platform&apos;s servers or networks;
              </li>
              <li>
                Harass, threaten, defame, or intimidate any User, Castudio
                employee, or third party;
              </li>
              <li>
                Solicit or recruit Users of the Platform for competing services
                or platforms;
              </li>
              <li>
                Use the Platform in any manner that could interfere with,
                disrupt, negatively affect, or inhibit other Users from fully
                enjoying the Platform.
              </li>
            </ul>
            <h3 className="font-heading">4.3 Monitoring and Enforcement</h3>
            <p>
              Castudio reserves the right, but is not obligated, to monitor,
              review, or investigate any User activity on the Platform. Castudio
              may, at its sole discretion and without prior notice, remove
              Content, restrict access, suspend or terminate Accounts, or take
              any other action it deems necessary to enforce these Terms or
              protect the Platform, its Users, or third parties.
            </p>

            {/* ===== 5. CAR CARE SERVICES ===== */}
            <h2 className="font-heading">5. Car Care Services</h2>
            <h3 className="font-heading">5.1 Nature of Car Care Services</h3>
            <p>
              Castudio provides professional vehicle care services to assist
              Customers in maintaining, protecting, and restoring their vehicles.
              Car Care Services may include, but are not limited to, exterior
              car wash, interior cleaning, full detailing, ceramic coating
              application, paint correction, interior restoration, engine bay
              cleaning, headlight restoration, and subscription-based
              maintenance plans.
            </p>
            <h3 className="font-heading">5.2 No Guarantee of Outcome</h3>
            <p>
              <strong>
                Castudio does not guarantee, warrant, or represent that any
                Car Care Service will produce any specific aesthetic or
                protective outcome, or that the results will meet your
                subjective expectations.
              </strong>{" "}
              All Car Care Services are provided on a best-efforts basis. Results
              may vary depending on the age, condition, make, and model of the
              vehicle, previous treatments, environmental factors, and the
              specific service performed.
            </p>
            <h3 className="font-heading">5.3 Customer Responsibilities</h3>
            <p>
              Customers are responsible for: (a) providing accurate information
              about their vehicle, including any pre-existing damage, modifications,
              or conditions that may affect the service; (b) removing personal
              belongings from the vehicle prior to service; and (c) disclosing
              any known mechanical or electrical issues. Castudio shall not be
              liable for any loss of or damage to personal items left in
              vehicles during service.
            </p>
            <h3 className="font-heading">5.4 Engagement Terms</h3>
            <p>
              Specific Car Care Services may be subject to separate service
              agreements, subscription terms, or package descriptions. In the
              event of any conflict between such separate agreements and these
              Terms, the terms of the separate agreement shall prevail with
              respect to the specific Car Care Services covered therein.
            </p>
            <h3 className="font-heading">5.5 Vehicle Condition Assessment</h3>
            <p>
              Castudio may conduct an inspection of the vehicle before performing
              services. Pre-existing damage, scratches, dents, or defects will be
              noted prior to service commencement. Customers acknowledge that
              certain pre-existing conditions may not be fully remedied by the
              requested service. Castudio reserves the right to decline service
              on vehicles in conditions that may pose safety or operational
              concerns.
            </p>

            {/* ===== 6. SERVICE BOOKINGS ===== */}
            <h2 className="font-heading">6. Service Bookings</h2>
            <h3 className="font-heading">6.1 Booking Accuracy</h3>
            <p>
              Customers are solely responsible for the accuracy and completeness
              of all information provided when making a Service Booking, including
              but not limited to vehicle type, service selected, preferred date
              and time, and any special instructions. Castudio shall not be liable
              for delays or issues arising from inaccurate booking information.
            </p>
            <h3 className="font-heading">6.2 Booking Confirmation</h3>
            <p>
              A Service Booking is confirmed only upon receipt of a booking
              confirmation from Castudio via the Platform, email, or other
              communication channel. Submission of a booking request does not
              guarantee availability. Castudio reserves the right to accept,
              decline, or reschedule any booking based on availability, capacity,
              or other operational factors.
            </p>
            <h3 className="font-heading">6.3 Cancellation Policy</h3>
            <p>
              <strong>
                Customers may cancel a Service Booking up to twenty-four (24)
                hours before the scheduled service time without incurring a
                cancellation fee.
              </strong>{" "}
              Cancellations made less than twenty-four (24) hours before the
              scheduled service time may be subject to a cancellation fee of up
              to fifty percent (50%) of the service price. Castudio reserves the
              right to modify this cancellation policy and will notify Customers
              of any changes.
            </p>
            <h3 className="font-heading">6.4 No-Show Policy</h3>
            <p>
              If a Customer fails to present their vehicle at the scheduled time
              without prior cancellation (a &quot;No-Show&quot;), the Customer
              may be charged the full service price. Repeated No-Shows may result
              in Account suspension or restrictions on future bookings.
            </p>
            <h3 className="font-heading">6.5 Rescheduling</h3>
            <p>
              Castudio reserves the right to reschedule Service Bookings due to
              weather conditions, equipment issues, staffing constraints, or other
              operational reasons. In such cases, Castudio will make reasonable
              efforts to notify the Customer and offer an alternative appointment.
            </p>

            {/* ===== 7. CONFIDENTIALITY ===== */}
            <h2 className="font-heading">7. Confidentiality</h2>
            <h3 className="font-heading">7.1 Confidentiality Obligations</h3>
            <p>
              All Confidential Information exchanged between the Parties in
              connection with the Platform or any Service shall be kept
              confidential and shall not be disclosed to any third party
              without the prior written consent of the disclosing Party, except
              as: (a) required by applicable law, regulation, or court order; or
              (b) disclosed to professional advisors bound by confidentiality
              obligations.
            </p>
            <h3 className="font-heading">7.2 Customer Data Protection</h3>
            <p>
              Castudio shall treat all Customer personal information, vehicle
              details, and service records as confidential. Such information will
              only be used for the purposes of providing Car Care Services,
              improving the Platform, and communicating with Customers as
              described in our Privacy Policy.
            </p>
            <h3 className="font-heading">7.3 Castudio Confidential Information</h3>
            <p>
              Without limiting the foregoing, all proprietary methodologies,
              service formulas, pricing structures, client lists, internal
              processes, and business strategies of Castudio constitute
              Confidential Information of Castudio and may not be disclosed,
              reproduced, or used without Castudio&apos;s express written consent.
            </p>

            {/* ===== 8. INTELLECTUAL PROPERTY ===== */}
            <h2 className="font-heading">8. Intellectual Property</h2>
            <h3 className="font-heading">8.1 Castudio IP</h3>
            <p>
              The Platform, including all software, algorithms, code, databases,
              designs, graphics, user interfaces, text, images, logos, trademarks,
              service marks, trade names, and all other content, materials, and
              Intellectual Property contained therein (collectively,{" "}
              <strong>&quot;Castudio IP&quot;</strong>), are the exclusive property
              of Castudio and/or its licensors and are protected by applicable
              intellectual property laws. No rights in or to Castudio IP are
              granted to you except for the limited license expressly set forth in
              these Terms.
            </p>
            <h3 className="font-heading">8.2 Limited License</h3>
            <p>
              Subject to your compliance with these Terms, Castudio grants you a
              limited, non-exclusive, non-transferable, non-sublicensable,
              revocable license to access and use the Platform solely for its
              intended purposes. This license does not include any right to: (a)
              modify, adapt, or create derivative works of the Platform or
              Castudio IP; (b) sell, license, distribute, or commercially exploit
              the Platform or Castudio IP; (c) use any data mining, robots,
              scraping, or similar data-gathering tools; or (d) use the Platform
              for any purpose not expressly permitted by these Terms.
            </p>
            <h3 className="font-heading">8.3 Trademarks</h3>
            <p>
              The Castudio name, logo, and all related names, logos, product and
              service names, designs, and slogans are trademarks of Castudio or
              its affiliates. You may not use such marks without the prior
              written permission of Castudio. All other names, logos, product and
              service names, designs, and slogans on the Platform are the
              trademarks of their respective owners.
            </p>
            <h3 className="font-heading">8.4 Feedback</h3>
            <p>
              If you provide Castudio with any feedback, suggestions, ideas,
              improvements, or other input regarding the Platform or Services
              (<strong>&quot;Feedback&quot;</strong>), you hereby irrevocably
              assign to Castudio all right, title, and interest in and to such
              Feedback. Castudio shall be free to use, disclose, reproduce,
              license, and otherwise distribute and exploit Feedback without
              obligation or restriction of any kind.
            </p>

            {/* ===== 9. FEES AND PAYMENTS ===== */}
            <h2 className="font-heading">9. Fees and Payments</h2>
            <h3 className="font-heading">9.1 Fee Structure</h3>
            <p>
              Car Care Services are subject to fees as displayed on the Platform
              at the time of booking. Fees may include one-off service charges,
              subscription fees for recurring service plans, package pricing for
              bundled services, and any applicable taxes. The applicable fee
              structure will be communicated to you prior to your confirmation
              of any Service Booking.
            </p>
            <h3 className="font-heading">9.2 Payment Terms</h3>
            <p>
              All fees are due and payable at the time of booking or upon
              completion of service, as specified for each service type. Payment
              methods accepted include those displayed on the Platform. You are
              responsible for all applicable taxes, duties, and levies associated
              with the fees.
            </p>
            <h3 className="font-heading">9.3 Subscription Billing</h3>
            <p>
              <strong>
                Subscription plans are billed on a recurring basis (monthly or
                as specified) and will automatically renew unless cancelled by
                the Customer before the next billing date.
              </strong>{" "}
              You authorize Castudio to charge your designated payment method
              for all recurring subscription fees. Subscription pricing is
              subject to change upon thirty (30) days&apos; notice. You may
              cancel your subscription at any time through your Account settings
              or by contacting Castudio.
            </p>
            <h3 className="font-heading">9.4 Refund Policy</h3>
            <p>
              Refunds may be issued at Castudio&apos;s sole discretion in the
              following circumstances: (a) a service was not performed as
              described; (b) significant quality issues are documented and
              reported within forty-eight (48) hours of service completion; or
              (c) a booking was cancelled within the free cancellation window.
              Refund requests must be submitted to{" "}
              <a
                href="mailto:hello@castudio.co"
                className="text-brand-orange hover:underline"
              >
                hello@castudio.co
              </a>{" "}
              with supporting details. Subscription refunds are prorated based on
              unused service periods.
            </p>
            <h3 className="font-heading">9.5 Late Payments</h3>
            <p>
              Late payments shall accrue interest at the rate of one and a half
              percent (1.5%) per month or the maximum rate permitted by applicable
              law, whichever is lower. You shall also be responsible for all costs
              of collection, including reasonable attorneys&apos; fees and court
              costs.
            </p>

            {/* ===== 10. USER CONTENT ===== */}
            <h2 className="font-heading">10. User Content</h2>
            <h3 className="font-heading">10.1 Ownership</h3>
            <p>
              You retain ownership of the Content you submit to the Platform,
              subject to the license grants set forth herein.
            </p>
            <h3 className="font-heading">10.2 License Grant to Castudio</h3>
            <p>
              By submitting Content to the Platform, you grant Castudio a
              worldwide, non-exclusive, royalty-free, sublicensable, transferable
              license to use, reproduce, modify, adapt, publish, translate,
              distribute, display, and create derivative works of such Content in
              connection with the operation, promotion, and improvement of the
              Platform and Services. This license survives the termination of
              your Account.
            </p>
            <h3 className="font-heading">10.3 Representations Regarding Content</h3>
            <p>
              You represent and warrant that: (a) you own or have the necessary
              rights, licenses, and permissions to submit the Content and grant
              the foregoing license; (b) the Content does not infringe,
              misappropriate, or violate any third-party Intellectual Property,
              privacy, publicity, or other rights; (c) the Content is accurate,
              truthful, and not misleading; and (d) the Content complies with all
              applicable laws, regulations, and these Terms.
            </p>
            <h3 className="font-heading">10.4 Content Removal</h3>
            <p>
              Castudio reserves the right to remove, modify, or disable access to
              any Content at any time and for any reason, without prior notice or
              liability.
            </p>

            {/* ===== 11. VEHICLE DAMAGE LIABILITY ===== */}
            <h2 className="font-heading">11. Vehicle Damage Liability</h2>
            <h3 className="font-heading">11.1 Pre-Existing Conditions</h3>
            <p>
              Castudio shall not be liable for any pre-existing damage, wear,
              defects, or conditions present on the vehicle prior to the
              commencement of Car Care Services. A pre-service inspection may be
              conducted and documented to record the vehicle&apos;s condition.
            </p>
            <h3 className="font-heading">11.2 Service-Related Damage</h3>
            <p>
              In the unlikely event that damage occurs to a vehicle as a direct
              result of Castudio&apos;s negligence during the performance of Car
              Care Services, Castudio shall, at its sole discretion, either
              repair the damage or provide reasonable compensation, not to exceed
              the cost of professional repair of the specific damage caused.
              Claims must be reported within twenty-four (24) hours of service
              completion with photographic evidence.
            </p>
            <h3 className="font-heading">11.3 Exclusions</h3>
            <p>
              Castudio shall not be liable for: (a) damage caused by undisclosed
              pre-existing conditions, aftermarket modifications, or substandard
              prior repairs; (b) normal wear and tear revealed during the cleaning
              or detailing process; (c) damage resulting from the Customer&apos;s
              failure to disclose relevant vehicle conditions; or (d) loss of or
              damage to personal items left in the vehicle.
            </p>
            <h3 className="font-heading">11.4 Service Guarantees</h3>
            <p>
              Castudio offers a limited satisfaction guarantee on select services
              as specified on the Platform. If a Customer is not satisfied with
              the quality of a covered service, they may request a re-service
              within seventy-two (72) hours of the original service completion.
              Re-service requests are subject to availability and Castudio&apos;s
              reasonable assessment of the claim. This guarantee does not apply to
              damage caused by the Customer, third parties, or environmental
              factors after service completion.
            </p>

            {/* ===== 12. DISCLAIMERS ===== */}
            <h2 className="font-heading">12. Disclaimers of Warranties</h2>
            <p>
              <strong>
                THE PLATFORM, SERVICES, CAR CARE SERVICES, AND ALL
                CONTENT ARE PROVIDED ON AN &quot;AS IS,&quot; &quot;AS
                AVAILABLE,&quot; AND &quot;WITH ALL FAULTS&quot; BASIS WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS, IMPLIED, OR STATUTORY.
              </strong>
            </p>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CASTUDIO
                EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
              </strong>
            </p>
            <ul>
              <li>
                <strong>
                  IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, TITLE, AND NON-INFRINGEMENT;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES ARISING FROM COURSE OF DEALING, COURSE OF
                  PERFORMANCE, OR USAGE OF TRADE;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES REGARDING THE ACCURACY, COMPLETENESS, RELIABILITY,
                  TIMELINESS, AVAILABILITY, OR SUITABILITY OF THE PLATFORM,
                  SERVICES, OR ANY CONTENT;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED,
                  ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL
                  COMPONENTS;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES REGARDING THE OUTCOME, DURABILITY, OR LONGEVITY
                  OF ANY CAR CARE SERVICE PERFORMED;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES THAT ANY SERVICE WILL PRODUCE ANY PARTICULAR
                  AESTHETIC OR PROTECTIVE RESULT.
                </strong>
              </li>
            </ul>
            <p>
              <strong>
                YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE PLATFORM AND
                SERVICES IS AT YOUR SOLE RISK. NO ADVICE OR INFORMATION,
                WHETHER ORAL OR WRITTEN, OBTAINED FROM CASTUDIO OR THROUGH THE
                PLATFORM SHALL CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN.
              </strong>
            </p>

            {/* ===== 13. LIMITATION OF LIABILITY ===== */}
            <h2 className="font-heading">13. Limitation of Liability</h2>
            <h3 className="font-heading">13.1 Exclusion of Damages</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL CASTUDIO, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS,
                AFFILIATES, SUBSIDIARIES, SUCCESSORS, ASSIGNS, LICENSORS, OR
                SERVICE PROVIDERS (COLLECTIVELY, THE &quot;CASTUDIO PARTIES&quot;)
                BE LIABLE FOR ANY:
              </strong>
            </p>
            <ul>
              <li>
                <strong>
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR
                  EXEMPLARY DAMAGES;
                </strong>
              </li>
              <li>
                <strong>
                  LOSS OF PROFITS, REVENUE, BUSINESS, SAVINGS, GOODWILL, OR
                  ANTICIPATED SAVINGS;
                </strong>
              </li>
              <li>
                <strong>LOSS OF DATA OR BUSINESS INTERRUPTION;</strong>
              </li>
              <li>
                <strong>
                  COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                </strong>
              </li>
              <li>
                <strong>
                  DAMAGES ARISING FROM ANY SERVICE OR BOOKING DECISION MADE IN
                  RELIANCE ON THE PLATFORM OR CAR CARE SERVICES;
                </strong>
              </li>
              <li>
                <strong>
                  DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO, ALTERATION OF,
                  OR LOSS OF YOUR CONTENT, DATA, OR TRANSMISSIONS;
                </strong>
              </li>
            </ul>
            <p>
              <strong>
                WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING
                NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY,
                WHETHER OR NOT CASTUDIO HAS BEEN ADVISED OF THE POSSIBILITY OF
                SUCH DAMAGES, AND EVEN IF A LIMITED REMEDY SET FORTH HEREIN IS
                FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
              </strong>
            </p>
            <h3 className="font-heading">13.2 Cap on Liability</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL
                AGGREGATE LIABILITY OF THE CASTUDIO PARTIES FOR ALL CLAIMS
                ARISING OUT OF OR RELATING TO THESE TERMS, THE PLATFORM, OR THE
                SERVICES SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT
                OF FEES ACTUALLY PAID BY YOU TO CASTUDIO IN THE TWELVE (12)
                MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM;
                OR (B) ONE HUNDRED UNITED STATES DOLLARS (USD $100.00).
              </strong>
            </p>
            <h3 className="font-heading">13.3 Essential Basis of the Bargain</h3>
            <p>
              You acknowledge and agree that the disclaimers and limitations of
              liability set forth in these Terms reflect a reasonable and fair
              allocation of risk between the Parties, and that such limitations
              form an essential basis of the bargain between the Parties. Castudio
              would not be able to provide the Platform and Services to you on an
              economically reasonable basis without these limitations.
            </p>
            <h3 className="font-heading">13.4 Jurisdictional Limitations</h3>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of
              certain warranties or the limitation of liability for certain types
              of damages. In such jurisdictions, the liability of the Castudio
              Parties shall be limited to the fullest extent permitted by
              applicable law.
            </p>

            {/* ===== 14. INDEMNIFICATION ===== */}
            <h2 className="font-heading">14. Indemnification</h2>
            <h3 className="font-heading">14.1 User Indemnification</h3>
            <p>
              You agree to defend, indemnify, and hold harmless the Castudio
              Parties from and against any and all claims, demands, actions,
              losses, damages, liabilities, costs, and expenses (including
              reasonable attorneys&apos; fees and court costs) arising out of or
              relating to:
            </p>
            <ul>
              <li>Your use of the Platform or Services;</li>
              <li>Your Content or reviews;</li>
              <li>Your breach or alleged breach of these Terms;</li>
              <li>
                Your violation of any applicable law, regulation, or third-party
                right;
              </li>
              <li>
                Any Service Booking you make through or in connection with the
                Platform;
              </li>
              <li>
                Any misrepresentation or inaccuracy in information you provide;
              </li>
              <li>
                Any dispute between you and any other User or third party;
              </li>
              <li>
                Any claim that your Content infringes or misappropriates
                third-party Intellectual Property or other rights.
              </li>
            </ul>
            <h3 className="font-heading">14.2 Indemnification Procedure</h3>
            <p>
              Castudio shall promptly notify you of any claim subject to
              indemnification and shall have the right, at your expense, to
              assume the exclusive defense and control of any matter for which you
              are required to indemnify Castudio. You agree to cooperate fully
              with Castudio in the defense of any such claim. You shall not settle
              any claim without Castudio&apos;s prior written consent.
            </p>

            {/* ===== 15. DISPUTE RESOLUTION ===== */}
            <h2 className="font-heading">15. Dispute Resolution</h2>
            <h3 className="font-heading">15.1 Good Faith Negotiation</h3>
            <p>
              In the event of any dispute, controversy, or claim arising out of
              or relating to these Terms, the Platform, or the Services (a{" "}
              <strong>&quot;Dispute&quot;</strong>), the Parties shall first
              attempt to resolve the Dispute through good faith negotiation for a
              period of thirty (30) days from the date one Party notifies the
              other in writing of the Dispute.
            </p>
            <h3 className="font-heading">15.2 Mediation</h3>
            <p>
              If the Dispute is not resolved through negotiation, the Parties
              agree to submit the Dispute to mediation administered by a mutually
              agreed-upon mediator or mediation institution before commencing any
              arbitration or legal proceeding. The costs of mediation shall be
              shared equally by the Parties.
            </p>
            <h3 className="font-heading">15.3 Arbitration</h3>
            <p>
              If the Dispute is not resolved through mediation within sixty (60)
              days, either Party may submit the Dispute to final and binding
              arbitration. The arbitration shall be conducted in accordance with
              the arbitration rules of the Indonesian National Board of
              Arbitration (BANI) or such other arbitration institution as mutually
              agreed. The seat of arbitration shall be Jakarta, Indonesia. The arbitration
              shall be conducted in English by a single arbitrator. The
              arbitrator&apos;s award shall be final and binding and may be
              entered as a judgment in any court of competent jurisdiction.
            </p>
            <h3 className="font-heading">15.4 Class Action Waiver</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE
                THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON
                AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR
                REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A
                CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
              </strong>
            </p>
            <h3 className="font-heading">15.5 Injunctive Relief</h3>
            <p>
              Notwithstanding the foregoing, Castudio may seek injunctive or other
              equitable relief in any court of competent jurisdiction to prevent
              the actual or threatened infringement, misappropriation, or
              violation of Castudio&apos;s Intellectual Property, Confidential
              Information, or other proprietary rights.
            </p>

            {/* ===== 16. TERMINATION ===== */}
            <h2 className="font-heading">16. Termination</h2>
            <h3 className="font-heading">16.1 Termination by You</h3>
            <p>
              You may terminate your Account at any time by contacting Castudio
              at{" "}
              <a
                href="mailto:hello@castudio.co"
                className="text-brand-orange hover:underline"
              >
                hello@castudio.co
              </a>
              . Termination of your Account does not relieve you of any
              obligations incurred prior to termination, including any outstanding
              fees, confidentiality obligations, or indemnification obligations.
            </p>
            <h3 className="font-heading">16.2 Termination by Castudio</h3>
            <p>
              <strong>
                Castudio may suspend, restrict, or terminate your Account and
                access to the Platform at any time, for any reason or no reason,
                with or without notice, and without liability.
              </strong>{" "}
              Reasons for termination may include, but are not limited to: breach
              of these Terms, suspected fraudulent or unlawful activity, extended
              inactivity, non-payment of fees, or any conduct that Castudio deems
              harmful to the Platform, its Users, or its business.
            </p>
            <h3 className="font-heading">16.3 Effects of Termination</h3>
            <p>
              Upon termination of your Account: (a) your license to access and
              use the Platform immediately ceases; (b) you must cease all use of
              the Platform; (c) Castudio may delete your Account, Content, and
              data, without any obligation to retain or provide copies thereof;
              and (d) any provisions of these Terms that by their nature should
              survive termination shall survive, including but not limited to
              Sections 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, and 18.
            </p>
            <h3 className="font-heading">16.4 No Liability for Termination</h3>
            <p>
              Castudio shall not be liable to you or any third party for any
              termination or suspension of your Account or access to the Platform.
            </p>

            {/* ===== 17. DATA PROTECTION ===== */}
            <h2 className="font-heading">17. Data Protection and Privacy</h2>
            <h3 className="font-heading">17.1 Privacy Policy</h3>
            <p>
              Your use of the Platform is also governed by our Privacy Policy,
              which is incorporated into these Terms by reference. Please review
              the Privacy Policy carefully for information about how we collect,
              use, disclose, and protect your personal data.
            </p>
            <h3 className="font-heading">17.2 Consent to Data Processing</h3>
            <p>
              By using the Platform, you consent to the collection, processing,
              storage, and transfer of your personal data as described in the
              Privacy Policy. You acknowledge that your data may be transferred
              to and processed in countries other than your country of residence,
              which may have different data protection laws.
            </p>
            <h3 className="font-heading">17.3 Data Accuracy</h3>
            <p>
              You are responsible for ensuring that any personal data you provide
              to Castudio is accurate, complete, and up to date. Castudio shall
              not be liable for any consequences resulting from inaccurate,
              incomplete, or outdated personal data provided by you.
            </p>
            <h3 className="font-heading">17.4 Compliance with Data Protection Laws</h3>
            <p>
              You agree to comply with all applicable data protection and privacy
              laws in connection with your use of the Platform and the provision
              of any personal data through the Services. It is your responsibility
              to ensure that your use of the Platform and any data you provide
              complies with the laws applicable in your jurisdiction.
            </p>
            <h3 className="font-heading">17.5 Third-Party Data</h3>
            <p>
              If you provide personal data of any third party to Castudio through
              the Platform, you represent and warrant that you have obtained all
              necessary consents and authorizations from such third parties, and
              that Castudio&apos;s use of such data as contemplated by these Terms
              and the Privacy Policy will not violate any applicable law or
              third-party right.
            </p>

            {/* ===== 18. GOVERNING LAW ===== */}
            <h2 className="font-heading">18. Governing Law and Jurisdiction</h2>
            <h3 className="font-heading">18.1 Governing Law</h3>
            <p>
              These Terms and any Dispute arising out of or relating to these
              Terms, the Platform, or the Services shall be governed by and
              construed in accordance with the laws of the Republic of Indonesia,
              without regard to its conflict of laws principles.
            </p>
            <h3 className="font-heading">18.2 Jurisdiction</h3>
            <p>
              Subject to the arbitration provisions in Section 15, the courts of
              the Republic of Indonesia shall have exclusive jurisdiction over any legal
              proceedings arising out of or relating to these Terms that are not
              subject to arbitration. You irrevocably consent to the personal
              jurisdiction and venue of such courts and waive any objection based
              on inconvenient forum or lack of personal jurisdiction.
            </p>

            {/* ===== 19. SEVERABILITY ===== */}
            <h2 className="font-heading">19. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or
              unenforceable by a court or tribunal of competent jurisdiction, such
              provision shall be modified to the minimum extent necessary to make
              it valid, legal, and enforceable while preserving the original
              intent of the Parties. If such modification is not possible, the
              provision shall be severed from these Terms, and the remaining
              provisions shall continue in full force and effect.
            </p>

            {/* ===== 20. FORCE MAJEURE ===== */}
            <h2 className="font-heading">20. Force Majeure</h2>
            <p>
              Castudio shall not be liable for any failure or delay in performing
              any obligation under these Terms if such failure or delay results
              from circumstances beyond Castudio&apos;s reasonable control,
              including but not limited to: acts of God, natural disasters,
              pandemics, epidemics, war, terrorism, civil unrest, government
              actions, sanctions, embargoes, strikes, labor disputes, fire,
              flood, earthquake, power failures, internet or telecommunications
              failures, cyberattacks, or any other event beyond Castudio&apos;s
              reasonable control. During such events, Castudio&apos;s obligations
              shall be suspended for the duration of the force majeure event.
            </p>

            {/* ===== 21. MODIFICATIONS ===== */}
            <h2 className="font-heading">21. Modifications to Terms</h2>
            <h3 className="font-heading">21.1 Right to Modify</h3>
            <p>
              Castudio reserves the right to modify, amend, supplement, or
              replace these Terms at any time and at its sole discretion. Modified
              Terms shall be effective upon posting on the Platform or upon
              notification to you, whichever occurs first.
            </p>
            <h3 className="font-heading">21.2 Notification</h3>
            <p>
              Castudio will make reasonable efforts to notify you of material
              changes to these Terms, including by posting a notice on the
              Platform, sending an email to the address associated with your
              Account, or through other reasonable means.
            </p>
            <h3 className="font-heading">21.3 Acceptance Through Continued Use</h3>
            <p>
              <strong>
                Your continued use of the Platform after the effective date of
                any modification constitutes your acceptance of the modified
                Terms. If you do not agree to the modified Terms, you must
                immediately cease all use of the Platform and terminate your
                Account.
              </strong>
            </p>

            {/* ===== 22. WAIVER ===== */}
            <h2 className="font-heading">22. Waiver</h2>
            <p>
              The failure of Castudio to exercise or enforce any right or
              provision of these Terms shall not constitute a waiver of such right
              or provision. Any waiver of any provision of these Terms shall be
              effective only if made in writing and signed by an authorized
              representative of Castudio. A waiver of any provision on one
              occasion shall not be deemed a waiver of such provision on any
              subsequent occasion.
            </p>

            {/* ===== 23. ASSIGNMENT ===== */}
            <h2 className="font-heading">23. Assignment</h2>
            <p>
              You may not assign, transfer, delegate, or sublicense any of your
              rights or obligations under these Terms without Castudio&apos;s
              prior written consent. Castudio may freely assign, transfer, or
              delegate its rights and obligations under these Terms without
              restriction and without notice to you, including in connection with
              a merger, acquisition, reorganization, sale of assets, or by
              operation of law.
            </p>

            {/* ===== 24. THIRD-PARTY LINKS AND SERVICES ===== */}
            <h2 className="font-heading">24. Third-Party Links and Services</h2>
            <p>
              The Platform may contain links to third-party websites, services, or
              resources. Castudio does not control, endorse, or assume any
              responsibility for the content, privacy policies, practices, or
              availability of any third-party websites or services. Your
              interactions with third-party websites and services are solely
              between you and the third party, and Castudio shall not be liable
              for any damage or loss caused by or in connection with your use of
              or reliance on any third-party content, goods, or services.
            </p>

            {/* ===== 25. ELECTRONIC COMMUNICATIONS ===== */}
            <h2 className="font-heading">25. Electronic Communications and Notices</h2>
            <p>
              By using the Platform and creating an Account, you consent to
              receive electronic communications from Castudio, including emails,
              notifications, and messages through the Platform. You agree that all
              agreements, notices, disclosures, and other communications that
              Castudio provides to you electronically satisfy any legal
              requirement that such communications be in writing. Notices to
              Castudio must be sent to{" "}
              <a
                href="mailto:hello@castudio.co"
                className="text-brand-orange hover:underline"
              >
                hello@castudio.co
              </a>{" "}
              and shall be deemed received upon actual receipt.
            </p>

            {/* ===== 26. ENTIRE AGREEMENT ===== */}
            <h2 className="font-heading">26. Entire Agreement</h2>
            <p>
              These Terms, together with the Privacy Policy and any separate
              service agreements or subscription terms executed between you and
              Castudio, constitute the entire agreement between you and Castudio
              regarding the subject matter hereof and supersede all prior and
              contemporaneous agreements, representations, warranties, and
              understandings, whether oral or written, between the Parties with
              respect to such subject matter. In the event of any conflict
              between these Terms and a separate service agreement, the terms of
              the separate service agreement shall prevail with respect to the
              subject matter covered therein.
            </p>

            {/* ===== 27. RELATIONSHIP OF THE PARTIES ===== */}
            <h2 className="font-heading">27. Relationship of the Parties</h2>
            <p>
              Nothing in these Terms shall be construed to create a joint venture,
              partnership, employment, fiduciary, or agency relationship between
              Castudio and any User. Castudio is an independent contractor, and
              neither Party has the authority to bind the other or incur
              obligations on the other&apos;s behalf without prior written
              consent.
            </p>

            {/* ===== 28. COMPLIANCE WITH LAWS ===== */}
            <h2 className="font-heading">28. Compliance with Laws</h2>
            <p>
              You agree to comply with all applicable local, national, and
              international laws, regulations, and rules in connection with your
              use of the Platform, including without limitation all applicable
              consumer protection laws, tax laws, and data protection laws. It is
              your sole responsibility to determine which laws apply to your use
              of the Platform and to ensure full compliance therewith.
            </p>

            {/* ===== 29. LIMITATION PERIOD ===== */}
            <h2 className="font-heading">29. Limitation Period</h2>
            <p>
              <strong>
                To the maximum extent permitted by applicable law, any claim or
                cause of action arising out of or relating to these Terms, the
                Platform, or the Services must be filed within one (1) year after
                such claim or cause of action arose, or the claim shall be
                permanently barred.
              </strong>
            </p>

            {/* ===== 30. CONTACT ===== */}
            <h2 className="font-heading">30. Contact Information</h2>
            <p>
              If you have any questions, concerns, or notices regarding these
              Terms, please contact us at:
            </p>
            <p>
              <strong>PT Vav Technologies Indonesia (operating as Castudio)</strong>
              <br />
              Email:{" "}
              <a
                href="mailto:hello@castudio.co"
                className="text-brand-orange hover:underline"
              >
                hello@castudio.co
              </a>
            </p>
            <p>
              By using the Platform, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
            </p>

          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}
