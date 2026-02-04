import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CreditInvoice } from '@/types/agents';

export type InvoicePdfInput = Pick<CreditInvoice, 'id' | 'amount' | 'credits' | 'paymentMethod' | 'createdAt' | 'description'> & {
  currency?: string;
  vendorName?: string;
};

export async function createInvoicePdf(input: InvoicePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Recibo ${input.id}`);

  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const top = height - margin;

  // Header
  page.drawText(input.vendorName ?? 'AgentHub', {
    x: margin,
    y: top,
    size: 20,
    font: fontBold,
    color: rgb(0.12, 0.12, 0.12),
  });
  page.drawText('Comprobante de recarga de créditos', {
    x: margin,
    y: top - 28,
    size: 12,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  // Meta
  const currency = input.currency ?? 'USD';
  const date = new Date(input.createdAt);
  const leftY = top - 80;
  const line = 18;
  const labelColor = rgb(0.35, 0.35, 0.35);
  const valueColor = rgb(0.12, 0.12, 0.12);

  const rows: Array<[string, string]> = [
    ['Recibo', input.id],
    ['Fecha', date.toLocaleString()],
    ['Descripción', input.description || 'Recarga de créditos'],
    ['Créditos', String(input.credits)],
    ['Monto', `${currency} $${input.amount}`],
    ['Método', input.paymentMethod],
  ];

  rows.forEach(([label, value], idx) => {
    const y = leftY - idx * line;
    page.drawText(label, { x: margin, y, size: 11, font, color: labelColor });
    page.drawText(value, { x: margin + 120, y, size: 11, font: fontBold, color: valueColor });
  });

  // Divider
  page.drawLine({
    start: { x: margin, y: leftY - rows.length * line - 14 },
    end: { x: width - margin, y: leftY - rows.length * line - 14 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Footer note
  page.drawText('Este recibo es informativo. La factura fiscal se gestiona offline.', {
    x: margin,
    y: margin,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return await doc.save();
}

