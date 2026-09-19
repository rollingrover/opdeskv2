import Link from 'next/link'
import { LegalPageHeader, LegalPageFooter } from '@/components/marketing/LegalPageChrome'

export const metadata = { title: 'Privacy Policy — OpDesk' }

const SECTION_STYLE = { marginBottom: '2rem' }
const H2_STYLE = { fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: 'var(--navy)', marginBottom: '0.75rem' }
const P_STYLE = { fontSize: '0.9375rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.75, marginBottom: '0.75rem' }
const LI_STYLE = { fontSize: '0.9375rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.75, marginBottom: '0.5rem' }

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <LegalPageHeader />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', margin: '0 auto 0.75rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>Last updated: 9 September 2026</p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '760px', margin: '0 auto' }}>

        <div style={SECTION_STYLE}>
          <p style={P_STYLE}>
            This Privacy Policy explains how <strong>OpDesk (Pty) Ltd</strong> (registration number 2026/648649/07,
            "OpDesk", "we", "us") collects, uses, and protects personal information, in compliance with the
            Protection of Personal Information Act, 2013 ("POPIA"). This policy covers both the OpDesk operations
            management platform and RollingRover Productions, our web design service — RollingRover operates under
            OpDesk (Pty) Ltd rather than as a separate legal entity, and this single policy applies to both.
          </p>
          <p style={P_STYLE}>
            OpDesk is registered with the Information Regulator of South Africa under registration number
            <strong> 2026-066318</strong>.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. An important distinction: when OpDesk is the "responsible party" vs. the "operator"</h2>
          <p style={P_STYLE}>
            Under POPIA, this distinction matters, and we want to be upfront about it rather than blur the two together:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}>
              For information you give us directly — creating an OpDesk account, your business details, billing
              information, or a RollingRover web design enquiry — <strong>OpDesk is the responsible party</strong>.
              We determine why and how that information is processed, and this policy describes that processing.
            </li>
            <li style={LI_STYLE}>
              For guest, booking, and staff information that an OpDesk customer (a lodge, tour operator, or other
              business using our platform) enters into their own OpDesk account — <strong>OpDesk acts only as an
              operator</strong> (broadly equivalent to a data processor) on that customer's behalf. That customer is
              the responsible party for their own guests' and staff's personal information, and their own privacy
              policy — not this one — governs how they use it. We process it only on their instructions, to provide
              the platform, and do not use it for our own separate purposes.
            </li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. Information we collect</h2>
          <p style={P_STYLE}>Depending on how you interact with us, we may collect:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}><strong>Account information:</strong> name, email address, phone number, business name, operator type, and password (stored in encrypted/hashed form, never in plain text).</li>
            <li style={LI_STYLE}><strong>Billing information:</strong> billing currency, subscription plan, and payment confirmation records. We do not directly store your card details — payments are handled by PayFast, a licensed South African payment gateway.</li>
            <li style={LI_STYLE}><strong>RollingRover enquiries:</strong> name, email, phone, business name, and project details submitted through our web design quote request form.</li>
            <li style={LI_STYLE}><strong>Support and communication records:</strong> support tickets, and the content of emails or messages you send us.</li>
            <li style={LI_STYLE}><strong>Technical information:</strong> IP-derived approximate location (used only to suggest a likely local currency on our pricing page), browser type, and general usage data.</li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. Why we process your information</h2>
          <p style={P_STYLE}>We process personal information for the following purposes, consistent with POPIA's conditions for lawful processing:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}>To create and administer your account, and to provide the OpDesk platform (necessary to perform our contract with you).</li>
            <li style={LI_STYLE}>To process billing and subscription payments.</li>
            <li style={LI_STYLE}>To respond to support requests and RollingRover project enquiries.</li>
            <li style={LI_STYLE}>To send service-related communications (e.g. billing notices, support updates) and, where you have consented, product or marketing updates.</li>
            <li style={LI_STYLE}>To maintain the security, integrity, and reliability of the platform.</li>
            <li style={LI_STYLE}>To comply with our legal obligations, including tax, accounting, and regulatory recordkeeping.</li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. Who we share information with</h2>
          <p style={P_STYLE}>
            We do not sell personal information. We share it only with service providers who help us operate the
            platform, each acting under our instruction as an operator in POPIA terms:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}><strong>Supabase</strong> — database hosting and authentication.</li>
            <li style={LI_STYLE}><strong>Vercel</strong> — application hosting and infrastructure.</li>
            <li style={LI_STYLE}><strong>PayFast</strong> — payment processing.</li>
            <li style={LI_STYLE}><strong>Resend</strong> — transactional email delivery (billing notices, support updates).</li>
          </ul>
          <p style={P_STYLE}>
            Some of these providers may process information on servers located outside South Africa. Where this
            occurs, we rely on the safeguards POPIA permits for cross-border transfer, including that the recipient
            is subject to a law, binding agreement, or contractual terms that provide an adequate level of
            protection substantially similar to POPIA's conditions.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. How we protect your information</h2>
          <p style={P_STYLE}>
            We use technical and organisational measures appropriate to the risk, including encryption of data in
            transit and at rest, role-based access control, row-level database security so one customer's data is
            never visible to another, and restricted administrative access. No system is perfectly secure, but we
            take reasonable steps to prevent loss, unauthorised access, and unlawful processing.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. How long we keep it</h2>
          <p style={P_STYLE}>
            We retain personal information for as long as your account is active, plus a reasonable period
            afterward to meet legal, tax, and accounting obligations, resolve disputes, and enforce our agreements.
            When no longer needed, we take reasonable steps to delete or anonymise it.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. Your rights</h2>
          <p style={P_STYLE}>Under POPIA, you have the right to:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}>Be notified that we hold your personal information, and what we hold.</li>
            <li style={LI_STYLE}>Request access to the personal information we hold about you.</li>
            <li style={LI_STYLE}>Request correction of inaccurate, outdated, or incomplete information.</li>
            <li style={LI_STYLE}>Request deletion or destruction of personal information we no longer have a lawful basis to retain.</li>
            <li style={LI_STYLE}>Object to processing of your personal information in certain circumstances, including for direct marketing.</li>
            <li style={LI_STYLE}>Withdraw consent, where processing is based on consent, at any time.</li>
            <li style={LI_STYLE}>Lodge a complaint with the Information Regulator (contact details below) if you believe we've handled your information unlawfully.</li>
          </ul>
          <p style={P_STYLE}>
            To exercise any of these rights, contact our Information Officer using the details in section 9. We may
            need to verify your identity before acting on a request.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>8. Cookies</h2>
          <p style={P_STYLE}>
            We use essential cookies required for the platform to function (such as keeping you signed in), and
            limited technical data to detect your approximate region for currency display purposes. We do not use
            third-party advertising or tracking cookies.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>9. Our Information Officer</h2>
          <p style={P_STYLE}>
            <strong>Douw Gerbrand Grobler</strong> is OpDesk's registered Information Officer (appointed 1 September
            2026), registered with the Information Regulator under registration number 2026-066318.
          </p>
          <p style={P_STYLE}>
            To make a request, ask a question, or raise a concern about how we handle personal information, contact:{' '}
            <a href="mailto:central@opdesk.app" style={{ color: 'var(--gold)' }}>central@opdesk.app</a>
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>10. Complaints to the Information Regulator</h2>
          <p style={P_STYLE}>
            If you're not satisfied with our response, you may lodge a complaint with the Information Regulator of
            South Africa:
          </p>
          <p style={P_STYLE}>
            Website: <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>inforegulator.org.za</a><br />
            Email: <a href="mailto:complaints.IR@justice.gov.za" style={{ color: 'var(--gold)' }}>complaints.IR@justice.gov.za</a>
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>11. Changes to this policy</h2>
          <p style={P_STYLE}>
            We may update this policy from time to time to reflect changes in our practices or legal requirements.
            We'll update the "last updated" date above when we do. Material changes will be communicated to
            registered account holders by email.
          </p>
        </div>

        <p style={{ ...P_STYLE, fontSize: '0.8125rem', color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: '1.5rem' }}>
          See also our <Link href="/paia-manual" style={{ color: 'var(--gold)' }}>PAIA Manual</Link>, which sets out
          in more detail the categories of records we hold and how to request access to them under the Promotion of
          Access to Information Act.
        </p>
      </section>

      <LegalPageFooter />
    </div>
  )
}
