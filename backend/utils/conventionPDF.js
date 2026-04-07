/**
 * Add this route to your existing contracts router.
 *
 * File: routes/contracts.js  (or wherever your contract routes live)
 *
 * Run once:  npm install pdfkit
 *
 * Then add inside your router:
 *   const { generateConventionPDF } = require('../utils/conventionPDF');
 *   router.get('/:id/pdf', auth, contractPdfHandler);
 */

const PDFDocument = require('pdfkit');

/**
 * Generates the Convention de Stage PDF matching the
 * University of Constantine 2 official format.
 *
 * @param {Object} data  – contract fields
 * @returns {Promise<Buffer>}
 */
function generateConventionPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc    = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
      const chunks = [];
      doc.on('data',  c => chunks.push(c));
      doc.on('end',   () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const PW = 595.28;
      const ML = 45;
      const MR = 45;
      const UW = PW - ML - MR; // 505.28

      const d = (k, def = '') => String(data[k] || def);

      // ── helpers ────────────────────────────────────────────
      const hline = (x1, y, x2, lw = 0.6, col = '#222') =>
        doc.save().moveTo(x1,y).lineTo(x2,y).lineWidth(lw).strokeColor(col).stroke().restore();

      const vline = (x, y1, y2, lw = 0.3, col = '#bbb') =>
        doc.save().moveTo(x,y1).lineTo(x,y2).lineWidth(lw).strokeColor(col).stroke().restore();

      const fillBox = (x, y, w, h, fill, stroke = '#222', lw = 0.9) =>
        doc.save().lineWidth(lw).strokeColor(stroke)
           .rect(x,y,w,h).fillAndStroke(fill, stroke).restore();

      const strokeBox = (x, y, w, h, stroke = '#222', lw = 1.1) =>
        doc.save().lineWidth(lw).strokeColor(stroke).rect(x,y,w,h).stroke().restore();

      const bold = (text, x, y, size = 8.5, color = '#111') =>
        doc.save().font('Helvetica-Bold').fontSize(size).fillColor(color)
           .text(text, x, y, { lineBreak: false }).restore();

      const normal = (text, x, y, size = 8.5, color = '#111') =>
        doc.save().font('Helvetica').fontSize(size).fillColor(color)
           .text(text, x, y, { lineBreak: false }).restore();

      const center = (text, x, y, w, size, isBold = false) =>
        doc.save().font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor('#111')
           .text(text, x, y, { width: w, align: 'center', lineBreak: false }).restore();

      const dotted = (x1, y, x2) =>
        doc.save().moveTo(x1,y).lineTo(x2,y).lineWidth(0.3)
           .strokeColor('#aaa').dash(1,{space:3}).stroke().restore();

      // ══════════════════════════════════════
      // TITLE
      // ══════════════════════════════════════
      let Y = 26;

      // University logo (green circle)
      doc.save().circle(ML + 18, Y + 17, 17).fillAndStroke('#e8f5e9','#2e7d32').restore();
      doc.save().font('Helvetica-Bold').fontSize(6).fillColor('#2e7d32')
         .text('UCA', ML + 6, Y + 13, { width: 24, align: 'center', lineBreak: false }).restore();

      center('CONVENTION DE STAGE', 0, Y + 2,  PW, 15, true);
      center('ENTRE',               0, Y + 22, PW, 12, true);

      Y += 46;

      // ══════════════════════════════════════
      // UNIVERSITY | ET | COMPANY
      // ══════════════════════════════════════
      const BOX_H  = 112;
      const UNI_W  = 215;
      const ET_W   = 36;
      const COMP_X = ML + UNI_W + ET_W;
      const COMP_W = UW - UNI_W - ET_W;

      // University box
      fillBox(ML, Y, UNI_W, BOX_H, '#f7f7f7');
      let uy = Y + 8;
      center("L'UNIVERSITE DE CONSTANTINE 2", ML, uy, UNI_W, 7.5, true); uy += 12;
      center('Abdelhamid Mehri', ML, uy, UNI_W, 7);                       uy += 10;
      center('Site Nouvelle ville Ali Mendjeli, Constantine – Algérie', ML + 4, uy, UNI_W - 8, 5.8); uy += 13;
      bold('Représentée par :', ML + 7, uy, 7);                           uy += 10;
      normal('Monsieur le Vice Recteur chargé des', ML + 7, uy, 6.5, '#333'); uy += 9;
      normal('relations extérieures, ci après désignée', ML + 7, uy, 6.5, '#333'); uy += 9;
      normal('université', ML + 7, uy, 6.5, '#333');                      uy += 11;
      normal('Tél/Fax : + 00 213 031 82 45 79', ML + 7, uy, 6.5, '#333');

      // ET
      center('ET', ML + UNI_W, Y + BOX_H / 2 - 9, ET_W, 12, true);

      // Company box
      fillBox(COMP_X, Y, COMP_W, BOX_H, '#f7f7f7');
      let cy = Y + 8;
      center("L'entreprise (nom et adresse)", COMP_X, cy, COMP_W, 7); cy += 15;
      // 4 dotted lines (company name / address left blank for manual fill or populated)
      [d('companyName'), d('companyAddress'), '', ''].forEach(v => {
        if (v) normal(v, COMP_X + 6, cy - 2, 7);
        dotted(COMP_X + 5, cy + 9, COMP_X + COMP_W - 5); cy += 14;
      });
      bold('Représentée par :', COMP_X + 6, cy, 7); cy += 11;
      normal(`Monsieur ${d('companyRepName')}`, COMP_X + 6, cy, 7); cy += 10;
      dotted(COMP_X + 6, cy + 7, COMP_X + COMP_W - 5); cy += 14;
      normal(`Tél : ${d('companyPhone')}     Fax : ${d('companyFax')}`, COMP_X + 6, cy, 6.5, '#333');

      Y += BOX_H + 14;

      // ══════════════════════════════════════
      // STUDENT DATA BOX
      // ══════════════════════════════════════
      const HDR_H = 20;
      const ROW_H = 21;

      const fmt = v => {
        if (!v) return '';
        if (typeof v === 'string' && /\d{1,2}\/\d{1,2}\/\d{4}/.test(v)) return v;
        try { return new Date(v).toLocaleDateString('fr-DZ'); } catch { return String(v); }
      };

      const ROWS = [
        { l: 'Nom et prénom :',           v: d('internName'),     l2: null,                    v2: null },
        { l: 'Faculté :',                 v: d('school'),         l2: null,                    v2: null },
        { l: 'Département :',             v: d('department'),     l2: null,                    v2: null },
        { l: "Carte d'étudiant n° :",     v: '',                  l2: 'N° Sécurité Sociale :', v2: ''   },
        { l: 'Tél :',                     v: '',                  l2: null,                    v2: null },
        { l: 'Diplôme préparé :',         v: '',                  l2: null,                    v2: null },
        { l: 'Thème du stage :',          v: d('role'),           l2: null,                    v2: null },
        { l: 'Responsable pédagogique :', v: d('supervisorName'), l2: null,                    v2: null },
        { l: 'Durée du stage :',          v: '',                  l2: null,                    v2: null },
        { l: 'Date de début du stage :',  v: fmt(d('startDate')), l2: 'Date de fin du stage :', v2: fmt(d('endDate')) },
      ];

      const STD_H = HDR_H + ROWS.length * ROW_H + 5;
      const MID_X = ML + UW / 2;

      strokeBox(ML, Y, UW, STD_H);
      fillBox(ML, Y, UW, HDR_H, '#ececec', '#222', 0.8);
      center("DONNÉES RELATIVES À L'ÉTUDIANT", ML, Y + 5, UW, 10, true);

      // row separators
      for (let i = 1; i < ROWS.length; i++) {
        hline(ML, Y + HDR_H + i * ROW_H, ML + UW, 0.3, '#cccccc');
      }

      ROWS.forEach((row, i) => {
        const ry  = Y + HDR_H + i * ROW_H + 6;
        const lx  = ML + 7;

        bold(row.l, lx, ry, 8.5);
        // approximate label width
        const lw = row.l.length * 4.7;
        const vx = lx + lw + 3;

        if (row.l2 !== null) {
          vline(MID_X, Y + HDR_H + i * ROW_H, Y + HDR_H + (i+1) * ROW_H);
          if (row.v) normal(row.v, vx, ry, 8.5);
          dotted(vx + (row.v ? row.v.length * 4.5 : 0), ry + 9, MID_X - 3);
          const r2x = MID_X + 6;
          bold(row.l2, r2x, ry, 8.5);
          const lw2 = row.l2.length * 4.7;
          const v2x = r2x + lw2 + 3;
          if (row.v2) normal(row.v2, v2x, ry, 8.5);
          dotted(v2x + (row.v2 ? row.v2.length * 4.5 : 0), ry + 9, ML + UW - 5);
        } else {
          if (row.v) normal(row.v, vx, ry, 8.5);
          dotted(vx + (row.v ? row.v.length * 4.5 : 0), ry + 9, ML + UW - 5);
        }
      });

      Y += STD_H + 14;

      // ══════════════════════════════════════
      // FOOTER NOTE
      // ══════════════════════════════════════
      normal(
        "Etablie en 02 exemplaires originaux : 1 exemplaire pour l'université et 01 exemplaire pour l'entreprise",
        ML, Y, 6.8, '#333'
      );
      Y += 16;

      doc.save().font('Helvetica').fontSize(8.5).fillColor('#111')
         .text('Fait à Constantine le : ...............................', ML, Y, {
           width: UW, align: 'right', lineBreak: false,
         }).restore();
      Y += 28;

      // Visa du chef
      bold('Visa du chef de département:', ML, Y, 8.5);
      hline(ML, Y + 15, ML + 155, 0.5);
      Y += 68;

      // Signature blocks
      const COL = UW / 2;
      center("Pour l'entreprise", ML,       Y, COL, 9, true);
      center("Pour l'université", ML + COL, Y, COL, 9, true);
      Y += 14;
      center('(Signature & Cachet)', ML,       Y, COL, 7);
      center('(Signature & Cachet)', ML + COL, Y, COL, 7);
      Y += 42;
      hline(ML + 10,       Y, ML + COL - 10,  0.8);
      hline(ML + COL + 10, Y, ML + UW - 10,   0.8);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ── Route handler — add to your contracts router ─────────────────────────────
// router.get('/:id/pdf', auth, async (req, res) => {
async function contractPdfHandler(req, res) {
  try {
    // Adjust the model import to match your project
    const Contract = require('../models/Convention');
    const contract = await Contract.findById(req.params.id);

    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Only the owner or admin can download
    const uid     = req.user._id.toString();
    const isOwner = contract.createdBy?.toString() === uid
                 || contract.company?.toString()   === uid;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const pdfBuffer = await generateConventionPDF({
      internName:     contract.internName,
      school:         contract.school,
      department:     contract.department,
      role:           contract.role,
      supervisorName: contract.supervisorName,
      startDate:      contract.startDate,
      endDate:        contract.endDate,
      stipend:        contract.stipend,
      // company fields — populate if your Contract model has them
      companyName:    contract.companyName    || '',
      companyAddress: contract.companyAddress || '',
      companyRepName: contract.companyRepName || '',
      companyPhone:   contract.companyPhone   || '',
      companyFax:     contract.companyFax     || '',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="convention-de-stage-${contract.internName.replace(/\s+/g,'-')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Contract PDF error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Failed to generate PDF' });
  }
}

module.exports = { generateConventionPDF, contractPdfHandler };

/*
─────────────────────────────────────────────────────
HOW TO WIRE UP IN YOUR PROJECT
─────────────────────────────────────────────────────

1. npm install pdfkit

2. Save this file as:  utils/conventionPDF.js
   (move the generateConventionPDF function there)

3. In your contracts router file (e.g. routes/contracts.js):

   const { contractPdfHandler } = require('../utils/conventionPDF');
   router.get('/:id/pdf', auth, contractPdfHandler);

4. Make sure your app.js has:
   app.use('/api/contracts', contractsRouter);

   That's it — the endpoint GET /api/contracts/:id/pdf is live.
─────────────────────────────────────────────────────
*/