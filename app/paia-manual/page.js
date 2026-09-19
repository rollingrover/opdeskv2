import Link from 'next/link'
import { LegalPageHeader, LegalPageFooter } from '@/components/marketing/LegalPageChrome'

export const metadata = { title: 'PAIA Manual — OpDesk' }

const SECTION_STYLE = { marginBottom: '2rem' }
const H2_STYLE = { fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: 'var(--navy)', marginBottom: '0.75rem' }
const P_STYLE = { fontSize: '0.9375rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.75, marginBottom: '0.75rem' }
const LI_STYLE = { fontSize: '0.9375rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.75, marginBottom: '0.5rem' }
const TH_STYLE = { textAlign: 'left', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-100)' }
const TD_STYLE = { padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--navy)', borderBottom: '1px solid var(--gray-100)', verticalAlign: 'top' }

export default function PaiaManualPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <LegalPageHeader />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', margin: '0 auto 0.75rem' }}>
          PAIA Manual
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>
          Manual in terms of Section 51 of the Promotion of Access to Information Act, 2000
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '760px', margin: '0 auto' }}>

        <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
          This manual is a separate, formal statutory document required under the Promotion of Access to Information
          Act ("PAIA") — it is not the same as our <Link href="/privacy" style={{ color: 'var(--gold)', fontWeight: 600 }}>Privacy Policy</Link>,
          which explains how we handle personal information day to day. This manual instead describes what records
          we hold and how to formally request access to them.
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. Body to which this manual applies</h2>
          <p style={P_STYLE}>
            <strong>OpDesk (Pty) Ltd</strong>, registration number 2026/648649/07, a private company registered in
            South Africa (B-BBEE Level 4 Contributor). This manual covers all operations conducted under OpDesk
            (Pty) Ltd, including RollingRover Productions, which operates as a division of OpDesk rather than as a
            separate legal entity.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. Information Officer</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
            <tbody>
              <tr><td style={{ ...TD_STYLE, fontWeight: 600, width: '35%' }}>Name</td><td style={TD_STYLE}>Douw Gerbrand Grobler</td></tr>
              <tr><td style={{ ...TD_STYLE, fontWeight: 600 }}>Title</td><td style={TD_STYLE}>Information Officer</td></tr>
              <tr><td style={{ ...TD_STYLE, fontWeight: 600 }}>Appointment date</td><td style={TD_STYLE}>1 September 2026</td></tr>
              <tr><td style={{ ...TD_STYLE, fontWeight: 600 }}>Information Regulator registration no.</td><td style={TD_STYLE}>2026-066318</td></tr>
              <tr><td style={{ ...TD_STYLE, fontWeight: 600 }}>Email</td><td style={TD_STYLE}><a href="mailto:central@opdesk.app" style={{ color: 'var(--gold)' }}>central@opdesk.app</a></td></tr>
            </tbody>
          </table>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. Guide on how to use PAIA</h2>
          <p style={P_STYLE}>
            The South African Human Rights Commission publishes a guide, as required by Section 10 of PAIA, to
            assist any person wishing to exercise their rights under the Act. It's available from the Commission
            directly and via the Information Regulator's website:{' '}
            <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>inforegulator.org.za</a>.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. Records available without a formal request</h2>
          <p style={P_STYLE}>The following are freely available and do not require a PAIA request:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}>This website's public content — features, pricing, and general company information.</li>
            <li style={LI_STYLE}>Our <Link href="/privacy" style={{ color: 'var(--gold)' }}>Privacy Policy</Link> and this PAIA Manual.</li>
            <li style={LI_STYLE}>Our current CIPC registration status (a matter of public record via CIPC).</li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. Categories of records held</h2>
          <p style={P_STYLE}>
            The table below describes the categories of records OpDesk holds. Where a category relates to
            information an OpDesk customer holds about their own guests or staff, OpDesk holds it only as an
            operator on that customer's behalf (see our Privacy Policy, section 1) — a request concerning that
            information should generally be directed to the OpDesk customer in question, as they are the
            responsible party for it.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={TH_STYLE}>Category</th><th style={TH_STYLE}>Examples</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>Corporate records</td>
                  <td style={TD_STYLE}>CIPC registration, B-BBEE certificate, tax and financial records, POPIA registration.</td>
                </tr>
                <tr>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>OpDesk account records</td>
                  <td style={TD_STYLE}>Customer name, contact details, business details, subscription and billing history, support tickets.</td>
                </tr>
                <tr>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>RollingRover client records</td>
                  <td style={TD_STYLE}>Web design enquiries, project quotes, and payment records for RollingRover Productions clients.</td>
                </tr>
                <tr>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>Guest/booking records (held as operator)</td>
                  <td style={TD_STYLE}>Guest names, bookings, and related data that OpDesk customers enter into their own accounts to run their own tourism/hospitality businesses.</td>
                </tr>
                <tr>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>Staff records (held as operator)</td>
                  <td style={TD_STYLE}>Staff, certification, payroll, and leave records that OpDesk customers enter for their own employees.</td>
                </tr>
                <tr>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>Technical and security records</td>
                  <td style={TD_STYLE}>System access logs, authentication records, and security-related records.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. How to make a request</h2>
          <p style={P_STYLE}>To request access to a record, submit a written request to our Information Officer, including:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={LI_STYLE}>Your full name and contact details, and proof of identity.</li>
            <li style={LI_STYLE}>A description of the record you're requesting, in enough detail to allow us to locate it.</li>
            <li style={LI_STYLE}>Your capacity to make the request, if requesting on behalf of someone else.</li>
            <li style={LI_STYLE}>The form of access you'd prefer (e.g. copy, inspection).</li>
          </ul>
          <p style={P_STYLE}>
            Requests should be submitted using the prescribed PAIA request form (Form 2 for private bodies,
            available from the Information Regulator's website), sent to{' '}
            <a href="mailto:central@opdesk.app" style={{ color: 'var(--gold)' }}>central@opdesk.app</a>.
            We will respond within the time limits prescribed by PAIA (currently 30 days, extendable in certain
            circumstances with notice to you).
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. Fees</h2>
          <p style={P_STYLE}>
            A request fee and access fee may apply, in accordance with the fee structure prescribed under PAIA
            regulations. We will notify you of any applicable fee before processing a request that requires one.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>8. Grounds on which access may be refused</h2>
          <p style={P_STYLE}>
            We may refuse a request where PAIA permits, including where disclosure would unreasonably disclose
            personal information of a third party, involve legally privileged material, or reveal confidential
            commercial or trade secret information belonging to OpDesk or another party. Any refusal will state the
            reasons and your right to appeal or approach a court.
          </p>
        </div>

      </section>

      <LegalPageFooter />
    </div>
  )
}
