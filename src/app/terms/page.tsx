import { FadeIn } from "@/components/ui/fade-in";

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto py-24 md:py-32">
          <FadeIn direction="up">
            <div className="text-center space-y-4 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Terms of Service
              </h1>
              <p className="text-lg text-blue-100">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-24 md:py-32 bg-white section-lines-dark">
        <div className="container mx-auto">
          <div className="prose prose-lg max-w-4xl mx-auto px-4 text-justify [&_h2]:text-left [&_h3]:text-left [&_h2]:mt-20 [&_h2]:mb-6 [&_h2]:pt-10 [&_h2]:border-t [&_h2]:border-brand-dark-blue/10 [&_h3]:mt-10 [&_h3]:mb-4 [&_p]:!mb-[1.5em] [&_p]:leading-relaxed [&_li]:!mb-[0.5em] [&_ul]:!mb-[1.5em] [&_strong]:font-semibold">

            <p>
              Welcome to Nobridge. These Terms of Service (<strong>&quot;Terms,&quot;</strong>{" "}
              <strong>&quot;Agreement&quot;</strong>) constitute a legally binding
              agreement between you (<strong>&quot;User,&quot;</strong>{" "}
              <strong>&quot;you,&quot;</strong> <strong>&quot;your&quot;</strong>)
              and PT Vav Technologies Indonesia, operating under the name Nobridge (<strong>&quot;Nobridge,&quot;</strong>{" "}
              <strong>&quot;Company,&quot;</strong> <strong>&quot;we,&quot;</strong>{" "}
              <strong>&quot;us,&quot;</strong> <strong>&quot;our&quot;</strong>),
              governing your access to and use of the Nobridge website, platform,
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
                <strong>&quot;Advisory Services&quot;</strong> means the mergers
                and acquisitions advisory, consulting, deal-structuring,
                valuation, due-diligence coordination, negotiation support, and
                related professional services provided by Nobridge.
              </li>
              <li>
                <strong>&quot;Buyer&quot;</strong> means any individual, entity,
                or organization that accesses the Platform with the intent to
                acquire, invest in, merge with, or otherwise transact with
                respect to a business or business assets listed on the Platform.
              </li>
              <li>
                <strong>&quot;Confidential Information&quot;</strong> means any
                non-public information disclosed by one party to another in
                connection with the use of the Platform or Advisory Services,
                including but not limited to business plans, financial data,
                customer lists, trade secrets, proprietary methodologies,
                valuations, deal terms, and any materials marked as confidential
                or that a reasonable person would understand to be confidential.
              </li>
              <li>
                <strong>&quot;Content&quot;</strong> means all text, data,
                images, graphics, videos, documents, files, listings, valuations,
                analyses, reports, and any other materials uploaded, submitted,
                posted, or transmitted by Users through the Platform.
              </li>
              <li>
                <strong>&quot;Deal&quot;</strong> or{" "}
                <strong>&quot;Transaction&quot;</strong> means any merger,
                acquisition, divestiture, investment, joint venture, partnership,
                asset purchase, equity transfer, or similar business transaction
                facilitated through or in connection with the Platform.
              </li>
              <li>
                <strong>&quot;Intellectual Property&quot;</strong> means all
                patents, copyrights, trademarks, service marks, trade names,
                domain names, trade secrets, know-how, proprietary processes,
                software, algorithms, databases, designs, and any other
                intellectual property rights.
              </li>
              <li>
                <strong>&quot;Listing&quot;</strong> means any business-for-sale,
                investment opportunity, or acquisition opportunity posted on the
                Platform by a Seller or by Nobridge on behalf of a Seller.
              </li>
              <li>
                <strong>&quot;Marketplace&quot;</strong> means the online
                marketplace functionality of the Platform through which Sellers
                may list businesses and Buyers may browse, evaluate, and express
                interest in such businesses.
              </li>
              <li>
                <strong>&quot;NDA&quot;</strong> means a non-disclosure agreement,
                whether entered into electronically through the Platform or via
                separate written instrument.
              </li>
              <li>
                <strong>&quot;Party&quot;</strong> or{" "}
                <strong>&quot;Parties&quot;</strong> means Nobridge and/or the
                User, as the context requires.
              </li>
              <li>
                <strong>&quot;Seller&quot;</strong> means any individual, entity,
                or organization that lists a business, business assets, or
                investment opportunity for sale or seeks advisory services in
                connection with a potential sale or transaction on the Platform.
              </li>
              <li>
                <strong>&quot;SME&quot;</strong> means small and medium-sized
                enterprises, as commonly understood in the relevant Asian
                jurisdictions.
              </li>
              <li>
                <strong>&quot;User&quot;</strong> means any individual, entity, or
                organization that accesses, registers on, or uses the Platform,
                including but not limited to Buyers, Sellers, advisors,
                intermediaries, and any other visitors.
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
              removed, or banned from the Platform by Nobridge; or (d) otherwise
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
              any authentication tokens. You agree to immediately notify Nobridge
              at{" "}
              <a
                href="mailto:Business@nobridge.co"
                className="text-brand-dark-blue hover:underline"
              >
                Business@nobridge.co
              </a>{" "}
              of any unauthorized access to or use of your Account.
            </p>
            <h3 className="font-heading">3.3 Account Responsibility</h3>
            <p>
              You are fully responsible for all activities that occur under your
              Account, whether or not authorized by you. Nobridge shall not be
              liable for any loss or damage arising from your failure to maintain
              the security of your Account credentials.
            </p>
            <h3 className="font-heading">3.4 Verification</h3>
            <p>
              Nobridge may, at its sole discretion, require identity verification,
              business verification, or additional documentation before granting
              access to certain features, listings, or Advisory Services.
              Verification by Nobridge does not constitute an endorsement,
              guarantee, or representation regarding any User, Listing, or
              Transaction.
            </p>
            <h3 className="font-heading">3.5 One Account Per User</h3>
            <p>
              Each individual or entity may maintain only one Account unless
              expressly authorized by Nobridge in writing. Nobridge reserves the
              right to merge, suspend, or terminate duplicate Accounts without
              notice.
            </p>

            {/* ===== 4. PLATFORM USE ===== */}
            <h2 className="font-heading">4. Platform Use and Acceptable Conduct</h2>
            <h3 className="font-heading">4.1 Permitted Use</h3>
            <p>
              The Platform is provided solely for legitimate business purposes
              related to mergers, acquisitions, investments, divestitures, and
              related business transactions involving SMEs in Asia. You agree to
              use the Platform only for its intended purposes and in compliance
              with all applicable laws, regulations, and these Terms.
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
                any Listing, financial disclosure, or registration;
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
                written authorization from Nobridge;
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
                Contact Users, Sellers, or Buyers directly to circumvent
                Nobridge&apos;s role as intermediary or to avoid applicable fees
                (commonly known as &quot;deal jumping&quot;);
              </li>
              <li>
                Use information obtained through the Platform for any purpose
                other than evaluating a potential Transaction through Nobridge;
              </li>
              <li>
                Engage in any activity that could damage, disable, overburden, or
                impair the Platform&apos;s servers or networks;
              </li>
              <li>
                Harass, threaten, defame, or intimidate any User, Nobridge
                employee, or third party;
              </li>
              <li>
                Solicit or recruit Users of the Platform for competing services
                or platforms;
              </li>
              <li>
                Violate any applicable anti-money laundering, anti-corruption,
                anti-bribery, or sanctions laws;
              </li>
              <li>
                Use the Platform in any manner that could interfere with,
                disrupt, negatively affect, or inhibit other Users from fully
                enjoying the Platform.
              </li>
            </ul>
            <h3 className="font-heading">4.3 Monitoring and Enforcement</h3>
            <p>
              Nobridge reserves the right, but is not obligated, to monitor,
              review, or investigate any User activity on the Platform. Nobridge
              may, at its sole discretion and without prior notice, remove
              Content, restrict access, suspend or terminate Accounts, or take
              any other action it deems necessary to enforce these Terms or
              protect the Platform, its Users, or third parties.
            </p>

            {/* ===== 5. ADVISORY SERVICES ===== */}
            <h2 className="font-heading">5. Advisory Services</h2>
            <h3 className="font-heading">5.1 Nature of Advisory Services</h3>
            <p>
              Nobridge provides M&amp;A advisory services to assist Buyers and
              Sellers in structuring, evaluating, negotiating, and consummating
              Transactions. Advisory Services may include, but are not limited to,
              business valuations, deal structuring, due-diligence coordination,
              financial analysis, buyer/seller matching, negotiation support, and
              post-transaction integration consulting.
            </p>
            <h3 className="font-heading">5.2 No Guarantee of Outcome</h3>
            <p>
              <strong>
                Nobridge does not guarantee, warrant, or represent that any
                Transaction will be successfully completed, that any particular
                valuation or price will be achieved, or that Advisory Services
                will produce any specific outcome.
              </strong>{" "}
              All Advisory Services are provided on a best-efforts basis. The
              success of any Transaction depends on numerous factors beyond
              Nobridge&apos;s control, including market conditions, the
              performance of the target business, regulatory approvals, and the
              cooperation of the parties involved.
            </p>
            <h3 className="font-heading">5.3 Not Legal, Tax, or Accounting Advice</h3>
            <p>
              Advisory Services provided by Nobridge do not constitute legal, tax,
              accounting, regulatory, or investment advice. You are strongly
              encouraged to retain your own qualified legal, tax, accounting, and
              other professional advisors in connection with any Transaction. All
              decisions regarding Transactions are made solely by the parties
              involved, and Nobridge assumes no liability for such decisions.
            </p>
            <h3 className="font-heading">5.4 Engagement Terms</h3>
            <p>
              Specific Advisory Services may be subject to separate engagement
              letters, service agreements, or statements of work. In the event of
              any conflict between such separate agreements and these Terms, the
              terms of the separate agreement shall prevail with respect to the
              specific Advisory Services covered therein.
            </p>
            <h3 className="font-heading">5.5 Reliance on Information</h3>
            <p>
              In providing Advisory Services, Nobridge relies upon information
              provided by Users, Sellers, Buyers, and third parties. Nobridge does
              not independently verify all such information and makes no
              representations or warranties regarding its accuracy, completeness,
              or reliability. You acknowledge that any valuation, analysis, or
              recommendation provided by Nobridge is based on the information
              available at the time and is subject to the limitations inherent in
              such information.
            </p>

            {/* ===== 6. MARKETPLACE ===== */}
            <h2 className="font-heading">6. Marketplace</h2>
            <h3 className="font-heading">6.1 Listing Accuracy</h3>
            <p>
              Sellers are solely responsible for the accuracy, completeness,
              legality, and truthfulness of all information contained in their
              Listings, including but not limited to financial data, revenue
              figures, EBITDA, cash flow, customer data, employee information,
              asset descriptions, and any other material facts. Nobridge does not
              independently verify Listing information and shall not be liable for
              any inaccuracies, omissions, or misrepresentations.
            </p>
            <h3 className="font-heading">6.2 No Endorsement</h3>
            <p>
              The inclusion of any Listing on the Platform does not constitute an
              endorsement, recommendation, or guarantee by Nobridge of the
              Listing, the underlying business, the Seller, or the viability of
              any Transaction. Nobridge expressly disclaims all responsibility for
              the quality, safety, legality, or any other aspect of any business
              or opportunity listed on the Platform.
            </p>
            <h3 className="font-heading">6.3 Buyer Due Diligence</h3>
            <p>
              <strong>
                Buyers are solely responsible for conducting their own thorough
                and independent due diligence before entering into any
                Transaction.
              </strong>{" "}
              This includes, without limitation, independent verification of all
              financial, legal, operational, regulatory, and commercial aspects of
              the target business. Nobridge shall not be liable for any
              Transaction entered into by a Buyer based on information provided on
              or through the Platform.
            </p>
            <h3 className="font-heading">6.4 Intermediary Role</h3>
            <p>
              Nobridge acts as an intermediary and facilitator. Nobridge is not a
              party to any Transaction between Buyers and Sellers unless
              explicitly stated in a separate written agreement. Nobridge does not
              own, operate, manage, or control any businesses listed on the
              Platform.
            </p>
            <h3 className="font-heading">6.5 Removal of Listings</h3>
            <p>
              Nobridge reserves the right to remove, modify, or decline to
              publish any Listing at its sole discretion, for any reason or no
              reason, including but not limited to Listings that violate these
              Terms, contain inaccurate information, or are deemed inappropriate.
            </p>

            {/* ===== 7. CONFIDENTIALITY AND NDAs ===== */}
            <h2 className="font-heading">7. Confidentiality and Non-Disclosure</h2>
            <h3 className="font-heading">7.1 Confidentiality Obligations</h3>
            <p>
              All Confidential Information exchanged between the Parties in
              connection with the Platform or any Transaction shall be kept
              strictly confidential and shall not be disclosed to any third party
              without the prior written consent of the disclosing Party, except
              as: (a) required by applicable law, regulation, or court order; (b)
              disclosed to professional advisors bound by confidentiality
              obligations; or (c) otherwise permitted under a separate NDA.
            </p>
            <h3 className="font-heading">7.2 Platform-Based NDAs</h3>
            <p>
              Nobridge may require Users to execute NDAs through the Platform
              before accessing certain Confidential Information, detailed Listing
              data, or engaging in discussions with counterparties. Such NDAs are
              legally binding agreements and survive the termination of your
              Account or these Terms.
            </p>
            <h3 className="font-heading">7.3 No Unauthorized Use</h3>
            <p>
              You agree not to use any Confidential Information obtained through
              the Platform for any purpose other than evaluating a specific
              Transaction through Nobridge. You shall not use Confidential
              Information to compete with the disclosing party, solicit their
              customers or employees, or for any other unauthorized purpose.
            </p>
            <h3 className="font-heading">7.4 Return or Destruction</h3>
            <p>
              Upon termination of your Account, completion or abandonment of a
              Transaction, or upon request by Nobridge or the disclosing party,
              you shall promptly return or destroy all Confidential Information in
              your possession and certify such return or destruction in writing
              upon request.
            </p>
            <h3 className="font-heading">7.5 Equitable Relief</h3>
            <p>
              You acknowledge that any breach of the confidentiality obligations
              herein may cause irreparable harm to Nobridge or the disclosing
              party for which monetary damages would be an inadequate remedy. In
              the event of any such breach or threatened breach, the aggrieved
              party shall be entitled to seek equitable relief, including
              injunctive relief and specific performance, without the necessity of
              posting a bond or proving actual damages.
            </p>
            <h3 className="font-heading">7.6 Nobridge Confidential Information</h3>
            <p>
              Without limiting the foregoing, all proprietary methodologies,
              algorithms, pricing structures, fee arrangements, client lists, deal
              pipelines, internal analyses, and business strategies of Nobridge
              constitute Confidential Information of Nobridge and may not be
              disclosed, reproduced, or used without Nobridge&apos;s express
              written consent.
            </p>

            {/* ===== 8. INTELLECTUAL PROPERTY ===== */}
            <h2 className="font-heading">8. Intellectual Property</h2>
            <h3 className="font-heading">8.1 Nobridge IP</h3>
            <p>
              The Platform, including all software, algorithms, code, databases,
              designs, graphics, user interfaces, text, images, logos, trademarks,
              service marks, trade names, and all other content, materials, and
              Intellectual Property contained therein (collectively,{" "}
              <strong>&quot;Nobridge IP&quot;</strong>), are the exclusive property
              of Nobridge and/or its licensors and are protected by applicable
              intellectual property laws. No rights in or to Nobridge IP are
              granted to you except for the limited license expressly set forth in
              these Terms.
            </p>
            <h3 className="font-heading">8.2 Limited License</h3>
            <p>
              Subject to your compliance with these Terms, Nobridge grants you a
              limited, non-exclusive, non-transferable, non-sublicensable,
              revocable license to access and use the Platform solely for its
              intended purposes. This license does not include any right to: (a)
              modify, adapt, or create derivative works of the Platform or
              Nobridge IP; (b) sell, license, distribute, or commercially exploit
              the Platform or Nobridge IP; (c) use any data mining, robots,
              scraping, or similar data-gathering tools; or (d) use the Platform
              for any purpose not expressly permitted by these Terms.
            </p>
            <h3 className="font-heading">8.3 Trademarks</h3>
            <p>
              The Nobridge name, logo, and all related names, logos, product and
              service names, designs, and slogans are trademarks of Nobridge or
              its affiliates. You may not use such marks without the prior
              written permission of Nobridge. All other names, logos, product and
              service names, designs, and slogans on the Platform are the
              trademarks of their respective owners.
            </p>
            <h3 className="font-heading">8.4 Feedback</h3>
            <p>
              If you provide Nobridge with any feedback, suggestions, ideas,
              improvements, or other input regarding the Platform or Services
              (<strong>&quot;Feedback&quot;</strong>), you hereby irrevocably
              assign to Nobridge all right, title, and interest in and to such
              Feedback. Nobridge shall be free to use, disclose, reproduce,
              license, and otherwise distribute and exploit Feedback without
              obligation or restriction of any kind.
            </p>

            {/* ===== 9. FEES AND PAYMENTS ===== */}
            <h2 className="font-heading">9. Fees and Payments</h2>
            <h3 className="font-heading">9.1 Fee Structure</h3>
            <p>
              Certain features of the Platform and Advisory Services may be
              subject to fees, including but not limited to advisory fees, success
              fees, retainer fees, subscription fees, listing fees, and
              transaction-based fees. The applicable fee structure will be
              communicated to you prior to your use of fee-based services and may
              be set forth in a separate engagement agreement.
            </p>
            <h3 className="font-heading">9.2 Payment Terms</h3>
            <p>
              All fees are due and payable in accordance with the payment terms
              specified in the applicable fee schedule or engagement agreement.
              Unless otherwise agreed in writing, all fees are non-refundable. You
              are responsible for all applicable taxes, duties, levies, and
              withholdings associated with the fees.
            </p>
            <h3 className="font-heading">9.3 Success Fees and Tail Provisions</h3>
            <p>
              <strong>
                Where Advisory Services are provided on a success-fee basis,
                the success fee shall be payable upon the closing of the
                applicable Transaction.
              </strong>{" "}
              Nobridge&apos;s entitlement to a success fee shall survive the
              termination of these Terms or any engagement agreement if a
              Transaction closes with a party introduced by or through Nobridge
              within twenty-four (24) months following such termination (the{" "}
              <strong>&quot;Tail Period&quot;</strong>). The Tail Period applies
              regardless of whether Nobridge was directly involved in the
              negotiation or closing of the Transaction.
            </p>
            <h3 className="font-heading">9.4 Late Payments</h3>
            <p>
              Late payments shall accrue interest at the rate of one and a half
              percent (1.5%) per month or the maximum rate permitted by applicable
              law, whichever is lower. You shall also be responsible for all costs
              of collection, including reasonable attorneys&apos; fees and court
              costs.
            </p>
            <h3 className="font-heading">9.5 No Circumvention</h3>
            <p>
              <strong>
                You agree not to circumvent Nobridge&apos;s fee arrangements by
                dealing directly with any party introduced through the Platform
                or Advisory Services.
              </strong>{" "}
              Any attempt to circumvent Nobridge&apos;s fees shall entitle
              Nobridge to the full fee that would have been payable had the
              Transaction been completed through Nobridge, plus any additional
              damages, costs, and expenses incurred.
            </p>

            {/* ===== 10. USER CONTENT ===== */}
            <h2 className="font-heading">10. User Content</h2>
            <h3 className="font-heading">10.1 Ownership</h3>
            <p>
              You retain ownership of the Content you submit to the Platform,
              subject to the license grants set forth herein.
            </p>
            <h3 className="font-heading">10.2 License Grant to Nobridge</h3>
            <p>
              By submitting Content to the Platform, you grant Nobridge a
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
              Nobridge reserves the right to remove, modify, or disable access to
              any Content at any time and for any reason, without prior notice or
              liability.
            </p>

            {/* ===== 11. DISCLAIMERS ===== */}
            <h2 className="font-heading">11. Disclaimers of Warranties</h2>
            <p>
              <strong>
                THE PLATFORM, SERVICES, ADVISORY SERVICES, MARKETPLACE, AND ALL
                CONTENT ARE PROVIDED ON AN &quot;AS IS,&quot; &quot;AS
                AVAILABLE,&quot; AND &quot;WITH ALL FAULTS&quot; BASIS WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS, IMPLIED, OR STATUTORY.
              </strong>
            </p>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NOBRIDGE
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
                  WARRANTIES REGARDING THE ACCURACY OF ANY VALUATION, FINANCIAL
                  ANALYSIS, PROJECTION, OR RECOMMENDATION PROVIDED THROUGH THE
                  ADVISORY SERVICES;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES REGARDING THE SUITABILITY, RELIABILITY, OR
                  CREDITWORTHINESS OF ANY BUYER, SELLER, OR OTHER USER;
                </strong>
              </li>
              <li>
                <strong>
                  WARRANTIES THAT ANY TRANSACTION WILL BE SUCCESSFULLY COMPLETED
                  OR PRODUCE ANY PARTICULAR RESULT.
                </strong>
              </li>
            </ul>
            <p>
              <strong>
                YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE PLATFORM AND
                SERVICES IS AT YOUR SOLE RISK. NO ADVICE OR INFORMATION,
                WHETHER ORAL OR WRITTEN, OBTAINED FROM NOBRIDGE OR THROUGH THE
                PLATFORM SHALL CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN.
              </strong>
            </p>

            {/* ===== 12. LIMITATION OF LIABILITY ===== */}
            <h2 className="font-heading">12. Limitation of Liability</h2>
            <h3 className="font-heading">12.1 Exclusion of Damages</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL NOBRIDGE, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS,
                AFFILIATES, SUBSIDIARIES, SUCCESSORS, ASSIGNS, LICENSORS, OR
                SERVICE PROVIDERS (COLLECTIVELY, THE &quot;NOBRIDGE PARTIES&quot;)
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
                  DAMAGES ARISING FROM ANY TRANSACTION, DEAL, OR BUSINESS
                  DECISION MADE IN RELIANCE ON THE PLATFORM OR ADVISORY SERVICES;
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
                WHETHER OR NOT NOBRIDGE HAS BEEN ADVISED OF THE POSSIBILITY OF
                SUCH DAMAGES, AND EVEN IF A LIMITED REMEDY SET FORTH HEREIN IS
                FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
              </strong>
            </p>
            <h3 className="font-heading">12.2 Cap on Liability</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL
                AGGREGATE LIABILITY OF THE NOBRIDGE PARTIES FOR ALL CLAIMS
                ARISING OUT OF OR RELATING TO THESE TERMS, THE PLATFORM, OR THE
                SERVICES SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT
                OF FEES ACTUALLY PAID BY YOU TO NOBRIDGE IN THE TWELVE (12)
                MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM;
                OR (B) ONE HUNDRED UNITED STATES DOLLARS (USD $100.00).
              </strong>
            </p>
            <h3 className="font-heading">12.3 Essential Basis of the Bargain</h3>
            <p>
              You acknowledge and agree that the disclaimers and limitations of
              liability set forth in these Terms reflect a reasonable and fair
              allocation of risk between the Parties, and that such limitations
              form an essential basis of the bargain between the Parties. Nobridge
              would not be able to provide the Platform and Services to you on an
              economically reasonable basis without these limitations.
            </p>
            <h3 className="font-heading">12.4 Jurisdictional Limitations</h3>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of
              certain warranties or the limitation of liability for certain types
              of damages. In such jurisdictions, the liability of the Nobridge
              Parties shall be limited to the fullest extent permitted by
              applicable law.
            </p>

            {/* ===== 13. INDEMNIFICATION ===== */}
            <h2 className="font-heading">13. Indemnification</h2>
            <h3 className="font-heading">13.1 User Indemnification</h3>
            <p>
              You agree to defend, indemnify, and hold harmless the Nobridge
              Parties from and against any and all claims, demands, actions,
              losses, damages, liabilities, costs, and expenses (including
              reasonable attorneys&apos; fees and court costs) arising out of or
              relating to:
            </p>
            <ul>
              <li>Your use of the Platform or Services;</li>
              <li>Your Content or Listings;</li>
              <li>Your breach or alleged breach of these Terms;</li>
              <li>
                Your violation of any applicable law, regulation, or third-party
                right;
              </li>
              <li>
                Any Transaction you enter into through or in connection with the
                Platform;
              </li>
              <li>
                Any misrepresentation or inaccuracy in information you provide;
              </li>
              <li>
                Any dispute between you and any other User, Buyer, Seller, or
                third party;
              </li>
              <li>
                Your breach of any confidentiality or non-disclosure obligations;
              </li>
              <li>
                Any claim that your Content infringes or misappropriates
                third-party Intellectual Property or other rights.
              </li>
            </ul>
            <h3 className="font-heading">13.2 Indemnification Procedure</h3>
            <p>
              Nobridge shall promptly notify you of any claim subject to
              indemnification and shall have the right, at your expense, to
              assume the exclusive defense and control of any matter for which you
              are required to indemnify Nobridge. You agree to cooperate fully
              with Nobridge in the defense of any such claim. You shall not settle
              any claim without Nobridge&apos;s prior written consent.
            </p>

            {/* ===== 14. DISPUTE RESOLUTION ===== */}
            <h2 className="font-heading">14. Dispute Resolution</h2>
            <h3 className="font-heading">14.1 Good Faith Negotiation</h3>
            <p>
              In the event of any dispute, controversy, or claim arising out of
              or relating to these Terms, the Platform, or the Services (a{" "}
              <strong>&quot;Dispute&quot;</strong>), the Parties shall first
              attempt to resolve the Dispute through good faith negotiation for a
              period of thirty (30) days from the date one Party notifies the
              other in writing of the Dispute.
            </p>
            <h3 className="font-heading">14.2 Mediation</h3>
            <p>
              If the Dispute is not resolved through negotiation, the Parties
              agree to submit the Dispute to mediation administered by a mutually
              agreed-upon mediator or mediation institution before commencing any
              arbitration or legal proceeding. The costs of mediation shall be
              shared equally by the Parties.
            </p>
            <h3 className="font-heading">14.3 Arbitration</h3>
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
            <h3 className="font-heading">14.4 Class Action Waiver</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE
                THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON
                AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR
                REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A
                CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
              </strong>
            </p>
            <h3 className="font-heading">14.5 Injunctive Relief</h3>
            <p>
              Notwithstanding the foregoing, Nobridge may seek injunctive or other
              equitable relief in any court of competent jurisdiction to prevent
              the actual or threatened infringement, misappropriation, or
              violation of Nobridge&apos;s Intellectual Property, Confidential
              Information, or other proprietary rights.
            </p>

            {/* ===== 15. TERMINATION ===== */}
            <h2 className="font-heading">15. Termination</h2>
            <h3 className="font-heading">15.1 Termination by You</h3>
            <p>
              You may terminate your Account at any time by contacting Nobridge
              at{" "}
              <a
                href="mailto:Business@nobridge.co"
                className="text-brand-dark-blue hover:underline"
              >
                Business@nobridge.co
              </a>
              . Termination of your Account does not relieve you of any
              obligations incurred prior to termination, including any outstanding
              fees, confidentiality obligations, or indemnification obligations.
            </p>
            <h3 className="font-heading">15.2 Termination by Nobridge</h3>
            <p>
              <strong>
                Nobridge may suspend, restrict, or terminate your Account and
                access to the Platform at any time, for any reason or no reason,
                with or without notice, and without liability.
              </strong>{" "}
              Reasons for termination may include, but are not limited to: breach
              of these Terms, suspected fraudulent or unlawful activity, extended
              inactivity, non-payment of fees, or any conduct that Nobridge deems
              harmful to the Platform, its Users, or its business.
            </p>
            <h3 className="font-heading">15.3 Effects of Termination</h3>
            <p>
              Upon termination of your Account: (a) your license to access and
              use the Platform immediately ceases; (b) you must cease all use of
              the Platform and destroy or return all Confidential Information in
              your possession; (c) Nobridge may delete your Account, Content, and
              data, without any obligation to retain or provide copies thereof;
              and (d) any provisions of these Terms that by their nature should
              survive termination shall survive, including but not limited to
              Sections 7, 8, 9, 10, 11, 12, 13, 14, 16, and 17.
            </p>
            <h3 className="font-heading">15.4 No Liability for Termination</h3>
            <p>
              Nobridge shall not be liable to you or any third party for any
              termination or suspension of your Account or access to the Platform.
            </p>

            {/* ===== 16. DATA PROTECTION ===== */}
            <h2 className="font-heading">16. Data Protection and Privacy</h2>
            <h3 className="font-heading">16.1 Privacy Policy</h3>
            <p>
              Your use of the Platform is also governed by our Privacy Policy,
              which is incorporated into these Terms by reference. Please review
              the Privacy Policy carefully for information about how we collect,
              use, disclose, and protect your personal data.
            </p>
            <h3 className="font-heading">16.2 Consent to Data Processing</h3>
            <p>
              By using the Platform, you consent to the collection, processing,
              storage, and transfer of your personal data as described in the
              Privacy Policy. You acknowledge that your data may be transferred
              to and processed in countries other than your country of residence,
              which may have different data protection laws.
            </p>
            <h3 className="font-heading">16.3 Data Accuracy</h3>
            <p>
              You are responsible for ensuring that any personal data you provide
              to Nobridge is accurate, complete, and up to date. Nobridge shall
              not be liable for any consequences resulting from inaccurate,
              incomplete, or outdated personal data provided by you.
            </p>
            <h3 className="font-heading">16.4 Compliance with Data Protection Laws</h3>
            <p>
              You agree to comply with all applicable data protection and privacy
              laws in connection with your use of the Platform and the provision
              of any personal data through the Services. It is your responsibility
              to ensure that your use of the Platform and any data you provide
              complies with the laws applicable in your jurisdiction.
            </p>
            <h3 className="font-heading">16.5 Third-Party Data</h3>
            <p>
              If you provide personal data of any third party to Nobridge through
              the Platform, you represent and warrant that you have obtained all
              necessary consents and authorizations from such third parties, and
              that Nobridge&apos;s use of such data as contemplated by these Terms
              and the Privacy Policy will not violate any applicable law or
              third-party right.
            </p>

            {/* ===== 17. GOVERNING LAW ===== */}
            <h2 className="font-heading">17. Governing Law and Jurisdiction</h2>
            <h3 className="font-heading">17.1 Governing Law</h3>
            <p>
              These Terms and any Dispute arising out of or relating to these
              Terms, the Platform, or the Services shall be governed by and
              construed in accordance with the laws of the Republic of Indonesia,
              without regard to its conflict of laws principles.
            </p>
            <h3 className="font-heading">17.2 Jurisdiction</h3>
            <p>
              Subject to the arbitration provisions in Section 14, the courts of
              the Republic of Indonesia shall have exclusive jurisdiction over any legal
              proceedings arising out of or relating to these Terms that are not
              subject to arbitration. You irrevocably consent to the personal
              jurisdiction and venue of such courts and waive any objection based
              on inconvenient forum or lack of personal jurisdiction.
            </p>

            {/* ===== 18. SEVERABILITY ===== */}
            <h2 className="font-heading">18. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or
              unenforceable by a court or tribunal of competent jurisdiction, such
              provision shall be modified to the minimum extent necessary to make
              it valid, legal, and enforceable while preserving the original
              intent of the Parties. If such modification is not possible, the
              provision shall be severed from these Terms, and the remaining
              provisions shall continue in full force and effect.
            </p>

            {/* ===== 19. FORCE MAJEURE ===== */}
            <h2 className="font-heading">19. Force Majeure</h2>
            <p>
              Nobridge shall not be liable for any failure or delay in performing
              any obligation under these Terms if such failure or delay results
              from circumstances beyond Nobridge&apos;s reasonable control,
              including but not limited to: acts of God, natural disasters,
              pandemics, epidemics, war, terrorism, civil unrest, government
              actions, sanctions, embargoes, strikes, labor disputes, fire,
              flood, earthquake, power failures, internet or telecommunications
              failures, cyberattacks, or any other event beyond Nobridge&apos;s
              reasonable control. During such events, Nobridge&apos;s obligations
              shall be suspended for the duration of the force majeure event.
            </p>

            {/* ===== 20. MODIFICATIONS ===== */}
            <h2 className="font-heading">20. Modifications to Terms</h2>
            <h3 className="font-heading">20.1 Right to Modify</h3>
            <p>
              Nobridge reserves the right to modify, amend, supplement, or
              replace these Terms at any time and at its sole discretion. Modified
              Terms shall be effective upon posting on the Platform or upon
              notification to you, whichever occurs first.
            </p>
            <h3 className="font-heading">20.2 Notification</h3>
            <p>
              Nobridge will make reasonable efforts to notify you of material
              changes to these Terms, including by posting a notice on the
              Platform, sending an email to the address associated with your
              Account, or through other reasonable means.
            </p>
            <h3 className="font-heading">20.3 Acceptance Through Continued Use</h3>
            <p>
              <strong>
                Your continued use of the Platform after the effective date of
                any modification constitutes your acceptance of the modified
                Terms. If you do not agree to the modified Terms, you must
                immediately cease all use of the Platform and terminate your
                Account.
              </strong>
            </p>

            {/* ===== 21. WAIVER ===== */}
            <h2 className="font-heading">21. Waiver</h2>
            <p>
              The failure of Nobridge to exercise or enforce any right or
              provision of these Terms shall not constitute a waiver of such right
              or provision. Any waiver of any provision of these Terms shall be
              effective only if made in writing and signed by an authorized
              representative of Nobridge. A waiver of any provision on one
              occasion shall not be deemed a waiver of such provision on any
              subsequent occasion.
            </p>

            {/* ===== 22. ASSIGNMENT ===== */}
            <h2 className="font-heading">22. Assignment</h2>
            <p>
              You may not assign, transfer, delegate, or sublicense any of your
              rights or obligations under these Terms without Nobridge&apos;s
              prior written consent. Nobridge may freely assign, transfer, or
              delegate its rights and obligations under these Terms without
              restriction and without notice to you, including in connection with
              a merger, acquisition, reorganization, sale of assets, or by
              operation of law.
            </p>

            {/* ===== 23. THIRD-PARTY LINKS AND SERVICES ===== */}
            <h2 className="font-heading">23. Third-Party Links and Services</h2>
            <p>
              The Platform may contain links to third-party websites, services, or
              resources. Nobridge does not control, endorse, or assume any
              responsibility for the content, privacy policies, practices, or
              availability of any third-party websites or services. Your
              interactions with third-party websites and services are solely
              between you and the third party, and Nobridge shall not be liable
              for any damage or loss caused by or in connection with your use of
              or reliance on any third-party content, goods, or services.
            </p>

            {/* ===== 24. ELECTRONIC COMMUNICATIONS ===== */}
            <h2 className="font-heading">24. Electronic Communications and Notices</h2>
            <p>
              By using the Platform and creating an Account, you consent to
              receive electronic communications from Nobridge, including emails,
              notifications, and messages through the Platform. You agree that all
              agreements, notices, disclosures, and other communications that
              Nobridge provides to you electronically satisfy any legal
              requirement that such communications be in writing. Notices to
              Nobridge must be sent to{" "}
              <a
                href="mailto:Business@nobridge.co"
                className="text-brand-dark-blue hover:underline"
              >
                Business@nobridge.co
              </a>{" "}
              and shall be deemed received upon actual receipt.
            </p>

            {/* ===== 25. ENTIRE AGREEMENT ===== */}
            <h2 className="font-heading">25. Entire Agreement</h2>
            <p>
              These Terms, together with the Privacy Policy, any applicable NDAs,
              and any separate engagement agreements or service agreements
              executed between you and Nobridge, constitute the entire agreement
              between you and Nobridge regarding the subject matter hereof and
              supersede all prior and contemporaneous agreements, representations,
              warranties, and understandings, whether oral or written, between the
              Parties with respect to such subject matter. In the event of any
              conflict between these Terms and a separate engagement agreement,
              the terms of the separate engagement agreement shall prevail with
              respect to the subject matter covered therein.
            </p>

            {/* ===== 26. ANTI-CIRCUMVENTION ===== */}
            <h2 className="font-heading">26. Anti-Circumvention</h2>
            <p>
              <strong>
                You acknowledge and agree that Nobridge invests significant
                resources in identifying, evaluating, and facilitating
                Transactions and introductions between parties.
              </strong>{" "}
              You agree not to directly or indirectly circumvent, avoid, bypass,
              or obviate the intent of these Terms, including but not limited to
              dealing directly or indirectly with any party introduced through the
              Platform without Nobridge&apos;s involvement, using intermediaries
              or third parties to effect introductions originally facilitated by
              Nobridge, or structuring a Transaction to avoid or reduce fees
              payable to Nobridge. Any breach of this provision shall entitle
              Nobridge to the full fees that would have been payable, plus all
              damages, costs, and expenses (including reasonable attorneys&apos;
              fees) incurred as a result of such circumvention.
            </p>

            {/* ===== 27. RELATIONSHIP OF THE PARTIES ===== */}
            <h2 className="font-heading">27. Relationship of the Parties</h2>
            <p>
              Nothing in these Terms shall be construed to create a joint venture,
              partnership, employment, fiduciary, or agency relationship between
              Nobridge and any User. Nobridge is an independent contractor, and
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
              anti-money laundering laws, anti-bribery and anti-corruption laws,
              sanctions and export control laws, tax laws, securities laws, and
              data protection laws. It is your sole responsibility to determine
              which laws apply to your use of the Platform and to ensure full
              compliance therewith.
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
              <strong>PT Vav Technologies Indonesia (operating as Nobridge)</strong>
              <br />
              Email:{" "}
              <a
                href="mailto:Business@nobridge.co"
                className="text-brand-dark-blue hover:underline"
              >
                Business@nobridge.co
              </a>
            </p>
            <p>
              By using the Platform, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
