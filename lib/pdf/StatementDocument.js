import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a2b3c' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  logo: { width: 90, height: 50, objectFit: 'contain', marginBottom: 6 },
  companyName: { fontSize: 18, fontWeight: 700, color: '#0F2540' },
  companySub: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  statementTitle: { fontSize: 16, fontWeight: 700, color: '#0F2540', textAlign: 'right' },
  statementMeta: { fontSize: 9, color: '#6b7280', textAlign: 'right', marginTop: 2 },
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
  colDate: { width: '18%' }, colRef: { width: '22%' }, colStatus: { width: '20%' }, colAmount: { width: '20%', textAlign: 'right' }, colMethod: { width: '25%' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9ca3af', textAlign: 'center', borderTop: '0.5pt solid #e5e7eb', paddingTop: 8 },
})

export function StatementDocument({ company, client, orders, payments, totalInvoiced, totalPaid, balance, periodLabel, noWatermark }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {company.logo_url && <Image src={company.logo_url} style={styles.logo} />}
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companySub}>{company.email || ''}</Text>
            {company.phone && <Text style={styles.companySub}>{company.phone}</Text>}
            {company.address && <Text style={styles.companySub}>{company.address}</Text>}
            {company.vat_number && <Text style={styles.companySub}>VAT: {company.vat_number}</Text>}
            {company.registration_number && <Text style={styles.companySub}>Reg: {company.registration_number}</Text>}
          </View>
          <View>
            <Text style={styles.statementTitle}>STATEMENT</Text>
            <Text style={styles.statementMeta}>{periodLabel}</Text>
            <Text style={styles.statementMeta}>Generated {new Date().toLocaleDateString('en-ZA')}</Text>
          </View>
        </View>

        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Statement For</Text>
          <Text style={styles.clientName}>{client.name}</Text>
          {client.contact_person && <Text style={styles.companySub}>{client.contact_person}</Text>}
          {client.delivery_address && <Text style={styles.companySub}>{client.delivery_address}</Text>}
          {client.vat_number && <Text style={styles.companySub}>VAT: {client.vat_number}</Text>}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Invoiced</Text>
            <Text style={styles.summaryValue}>{company.currency} {totalInvoiced.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: '#1B8A8F' }]}>{company.currency} {totalPaid.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Balance Owing</Text>
            <Text style={[styles.summaryValue, { color: balance > 0 ? '#dc2626' : '#1B8A8F' }]}>{company.currency} {balance.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.th, styles.colDate]}>Date</Text>
            <Text style={[styles.th, styles.colRef]}>Order</Text>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          {orders.map(o => (
            <View style={styles.tableRow} key={o.id}>
              <Text style={[styles.td, styles.colDate]}>{new Date(o.order_date).toLocaleDateString('en-ZA')}</Text>
              <Text style={[styles.td, styles.colRef]}>{o.order_ref}</Text>
              <Text style={[styles.td, styles.colStatus]}>{o.status}</Text>
              <Text style={[styles.td, styles.colAmount]}>{company.currency} {o.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Payments</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.th, styles.colDate]}>Date</Text>
            <Text style={[styles.th, styles.colMethod]}>Method</Text>
            <Text style={[styles.th, styles.colRef]}>Reference</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          {payments.length === 0 ? (
            <Text style={[styles.td, { color: '#9ca3af', marginTop: 6 }]}>No payments recorded for this period.</Text>
          ) : payments.map(p => (
            <View style={styles.tableRow} key={p.id}>
              <Text style={[styles.td, styles.colDate]}>{new Date(p.payment_date).toLocaleDateString('en-ZA')}</Text>
              <Text style={[styles.td, styles.colMethod]}>{p.method}</Text>
              <Text style={[styles.td, styles.colRef]}>{p.reference || '—'}</Text>
              <Text style={[styles.td, styles.colAmount]}>{company.currency} {Number(p.amount).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          {company.name}{!noWatermark && ' · Generated by OpDesk'} · This statement reflects records held in OpDesk and is provided for reference — please confirm balances with your own records.
        </Text>
      </Page>
    </Document>
  )
}
