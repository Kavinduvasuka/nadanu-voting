// Admin-only, on-demand downloadable PDF report.
// No public vote data is exposed: the caller must supply already authorized RPC rows.
const jsPDFModuleUrl = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm';

async function loadLogoData() {
  const image = new Image();
  image.src = `${import.meta.env.BASE_URL}nadanu-logo.png`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Logo could not be rendered.');
  ctx.drawImage(image, 0, 0);
  return { data: canvas.toDataURL('image/png'), ratio: image.naturalWidth / image.naturalHeight };
}

export async function downloadVotingResultsPdf({ categories, contestants, results }) {
  const { jsPDF } = await import(/* @vite-ignore */ jsPDFModuleUrl);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 17;
  const now = new Date();
  const generated = now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const orange = [228, 109, 38];
  const dark = [37, 24, 19];
  let logo = null;
  try { logo = await loadLogoData(); } catch { /* Keep report usable if image cannot load. */ }
  const catById = new Map(categories.map(c => [c.id, c]));
  const contestantById = new Map(contestants.map(c => [c.id, c]));
  const groups = new Map();
  for (const cat of categories) groups.set(cat.id, { name: cat.name, rows: [] });
  let overall = 0;
  for (const result of results) {
    const finalist = contestantById.get(result.contestant_id);
    if (!finalist) throw new Error('Finalist/category data is incomplete. Refresh and try again.');
    const group = groups.get(finalist.category_id);
    if (!group) throw new Error('Category data is incomplete. Refresh and try again.');
    const count = Number(result.vote_count);
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid vote total returned by server.');
    overall += count;
    group.rows.push({ name: finalist.name, count });
  }

  function pageHeader() {
    pdf.setFillColor(...dark);
    pdf.rect(0, 0, W, 48, 'F');
    pdf.setFillColor(...orange);
    pdf.rect(0, 47, W, 1.7, 'F');
    if (logo) {
      const h = 32;
      const w = Math.min(42, h * logo.ratio);
      try { pdf.addImage(logo.data, 'PNG', margin, 7, w, h); } catch { /* Text header stays readable. */ }
    }
    pdf.setTextColor(255, 243, 224);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('NADANU 3.0', 66, 18);
    pdf.setFontSize(11);
    pdf.text("PEOPLE'S CHOICE - VOTING RESULTS", 66, 26);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.text('COMPUTING SOCIETY OF ICBT CAMPUS', 66, 33);
    pdf.setTextColor(88, 73, 60);
    pdf.setFontSize(8);
    pdf.text(`Generated: ${generated}`, margin, 58);
    pdf.text('CONFIDENTIAL - ORGANIZERS ONLY', W - margin, 58, { align: 'right' });
  }

  function pageFooter() {
    const n = pdf.internal.getNumberOfPages();
    pdf.setDrawColor(224, 207, 190);
    pdf.line(margin, H - 19, W - margin, H - 19);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(113, 98, 86);
    pdf.text('NADANU 3.0 | OFFICIAL VOTING RESULTS', margin, H - 13);
    pdf.text(`Page ${n}`, W - margin, H - 13, { align: 'right' });
  }

  let y = 66;
  function nextPageIfNeeded(height) {
    if (y + height <= H - 27) return;
    pageFooter();
    pdf.addPage();
    pageHeader();
    y = 67;
  }

  pageHeader();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...dark);
  pdf.text('RESULTS BY CATEGORY', margin, y);
  y += 10;

  const sorted = [...groups.values()].sort((a,b) => a.name.localeCompare(b.name));
  for (const group of sorted) {
    group.rows.sort((a,b) => b.count - a.count || a.name.localeCompare(b.name));
    nextPageIfNeeded(34);
    pdf.setFillColor(245, 234, 223);
    pdf.roundedRect(margin, y, W - 2 * margin, 12, 2, 2, 'F');
    pdf.setTextColor(...dark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(group.name.toUpperCase(), margin + 4, y + 8);
    y += 16;

    pdf.setFillColor(...dark);
    pdf.rect(margin, y, W - 2 * margin, 9, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text('FINALIST / TEAM', margin + 4, y + 6);
    pdf.text('VOTES', W - margin - 4, y + 6, { align: 'right' });
    y += 9;

    if (!group.rows.length) {
      nextPageIfNeeded(11);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(106, 91, 78);
      pdf.text('No finalists available in this category.', margin + 4, y + 7);
      y += 11;
    }
    for (let i = 0; i < group.rows.length; i++) {
      const row = group.rows[i];
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const nameLines = pdf.splitTextToSize(String(row.name), W - 2 * margin - 39);
      const rowHeight = Math.max(10, nameLines.length * 5 + 4);
      nextPageIfNeeded(rowHeight + 10);
      if (i % 2 === 0) { pdf.setFillColor(252, 247, 242); pdf.rect(margin, y, W - 2 * margin, rowHeight, 'F'); }
      pdf.setTextColor(...dark);
      pdf.text(nameLines, margin + 4, y + 6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(row.count.toLocaleString('en-US'), W - margin - 4, y + 6, { align: 'right' });
      y += rowHeight;
    }
    nextPageIfNeeded(13);
    const subtotal = group.rows.reduce((sum, row) => sum + row.count, 0);
    pdf.setDrawColor(226, 196, 175);
    pdf.line(margin, y, W - margin, y);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...dark);
    pdf.text('CATEGORY TOTAL', margin + 4, y + 8);
    pdf.text(subtotal.toLocaleString('en-US'), W - margin - 4, y + 8, { align: 'right' });
    y += 20;
  }
  nextPageIfNeeded(21);
  pdf.setFillColor(...orange);
  pdf.roundedRect(margin, y, W - 2 * margin, 17, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text('OVERALL TOTAL VOTES', margin + 5, y + 11);
  pdf.text(overall.toLocaleString('en-US'), W - margin - 5, y + 11, { align: 'right' });
  pageFooter();

  const stamp = now.toISOString().slice(0, 10);
  pdf.save(`Nadanu_3.0_Voting_Results_${stamp}.pdf`);
}
