import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a2b3c' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  companyName: { fontSize: 18, fontWeight: 700, color: '#0F2540' },
  companySub: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  docTitle: { fontSize: 16, fontWeight: 700, color: '#0F2540', textAlign: 'right' },
  docMeta: { fontSize: 9, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  clientBox: { marginBottom: 20, padding: 12, backgroundColor: '#FDF8F0', borderRadius: 4 },
  clientLabel: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 },
  clientName: { fontSize: 12, fontWeight: 700, color: '#0F2540' },
  summaryRow: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  summaryBox: { flex: 1, padding: 10, border: '1pt solid #e5e7eb', borderRadius: 4 },
  summaryLabel: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase' },
  summaryValue: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#0F2540', marginBottom: 8, marginTop: 16 },
  table: { display: 'flex', width: '100%' },
  tableRowHeader: { flexDirection: 'row', borderBottom: '1pt solid #d1d5db', paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 4, borderBottom: '0.5pt solid #f0f0f0' },
  th: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase' },
  td: { fontSize: 9, color: '#1a2b3c' },
  colDate: { width: '25%' }, colMethod: { width: '25%' }, colRef: { width: '25%' }, colAmount: { width: '25%', textAlign: 'right' },
  totalsBox: { alignItems: 'flex-end', marginTop: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginBottom: 3 },
  totalsLabel: { fontSize: 9, color: '#6b7280' },
  totalsValue: { fontSize: 9, color: '#1a2b3c', fontWeight: 600 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginTop: 4, paddingTop: 4, borderTop: '1pt solid #d1d5db' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9ca3af', textAlign: 'center', borderTop: '0.5pt solid #e5e7eb', paddingTop: 8 },
})

export function InvoiceDocument({ company, invoice, payments }) {
  const balance = Number(invoice.total) - Number(invoice.amount_paid || 0)
  const docLabel = invoice.invoice_type === 'quotation' ? 'QUOTATION' : invoice.invoice_type === 'tax' ? 'TAX INVOICE' : 'PRO FORMA INVOICE'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companySub}>{company.email || ''}</Text>
            {company.phone && <Text style={styles.companySub}>{company.phone}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>{docLabel}</Text>
            <Text style={styles.docMeta}>{invoice.invoice_number}</Text>
            <Text style={styles.docMeta}>{new Date(invoice.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            {invoice.due_date && <Text style={styles.docMeta}>Due: {new Date(invoice.due_date).toLocaleDateString('en-ZA')}</Text>}
            {invoice.invoice_type === 'quotation' && invoice.valid_until && (
              <Text style={styles.docMeta}>Valid until: {new Date(invoice.valid_until).toLocaleDateString('en-ZA')}</Text>
            )}
          </View>
        </View>

        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Billed To</Text>
          <Text style={styles.clientName}>{invoice.guest_name || 'Guest'}</Text>
          {invoice.guest_email && <Text style={styles.companySub}>{invoice.guest_email}</Text>}
          {invoice.guest_address && <Text style={styles.companySub}>{invoice.guest_address}</Text>}
        </View>

        {invoice.invoice_type === 'quotation' ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Quoted Total</Text>
              <Text style={styles.summaryValue}>{invoice.currency} {Number(invoice.total).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Valid Until</Text>
              <Text style={styles.summaryValue}>{invoice.valid_until ? new Date(invoice.valid_until).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry set'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{invoice.currency} {Number(invoice.total).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Paid</Text>
              <Text style={[styles.summaryValue, { color: '#1B8A8F' }]}>{invoice.currency} {Number(invoice.amount_paid || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Balance Due</Text>
              <Text style={[styles.summaryValue, { color: balance > 0 ? '#dc2626' : '#1B8A8F' }]}>{invoice.currency} {balance.toLocaleString()}</Text>
            </View>
          </View>
        )}

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{invoice.currency} {Number(invoice.subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>VAT ({invoice.vat_rate || 0}%)</Text>
            <Text style={styles.totalsValue}>{invoice.currency} {Number(invoice.vat_amount || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={[styles.totalsLabel, { fontWeight: 700, color: '#0F2540' }]}>Total</Text>
            <Text style={[styles.totalsValue, { fontSize: 11 }]}>{invoice.currency} {Number(invoice.total).toLocaleString()}</Text>
          </View>
        </View>

        {invoice.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 9, color: '#4b5563' }}>{invoice.notes}</Text>
          </>
        )}

        {payments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Payments Received</Text>
            <View style={styles.table}>
              <View style={styles.tableRowHeader}>
                <Text style={[styles.th, styles.colDate]}>Date</Text>
                <Text style={[styles.th, styles.colMethod]}>Method</Text>
                <Text style={[styles.th, styles.colRef]}>Reference</Text>
                <Text style={[styles.th, styles.colAmount]}>Amount</Text>
              </View>
              {payments.map(p => (
                <View style={styles.tableRow} key={p.id}>
                  <Text style={[styles.td, styles.colDate]}>{new Date(p.payment_date).toLocaleDateString('en-ZA')}</Text>
                  <Text style={[styles.td, styles.colMethod]}>{p.method}</Text>
                  <Text style={[styles.td, styles.colRef]}>{p.reference || '—'}</Text>
                  <Text style={[styles.td, styles.colAmount]}>{invoice.currency} {Number(p.amount).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.footer} fixed>
          {company.name} · Generated by OpDesk · {invoice.invoice_type === 'proforma' ? 'This is a pro forma invoice, not a tax invoice.' : invoice.invoice_type === 'quotation' ? 'This is a quotation only — prices are not final until accepted and no payment is due yet.' : ''}
        </Text>
      </Page>
    </Document>
  )
}
