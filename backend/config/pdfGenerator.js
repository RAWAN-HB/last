const PDFDocument = require("pdfkit");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateConventionPDF = (convention) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);

        // Upload to Cloudinary
        const uploadResult = await new Promise((res, rej) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "stag-io/conventions",
              resource_type: "raw",
              format: "pdf",
              public_id: `convention_${convention._id}`,
            },
            (error, result) => {
              if (error) rej(error);
              else res(result);
            }
          );
          const readable = new Readable();
          readable.push(pdfBuffer);
          readable.push(null);
          readable.pipe(uploadStream);
        });

        resolve(uploadResult.secure_url);
      } catch (err) {
        reject(err);
      }
    });

    doc.on("error", reject);

    // ─── HEADER ───────────────────────────────────────────
    doc.fontSize(10)
       .fillColor("#666666")
       .text("République Algérienne Démocratique et Populaire", { align: "center" })
       .text("Ministère de l'Enseignement Supérieur et de la Recherche Scientifique", { align: "center" })
       .moveDown(0.3);

    doc.fontSize(12)
       .fillColor("#000000")
       .font("Helvetica-Bold")
       .text("Université — [Nom de l'Université]", { align: "center" })
       .moveDown(0.5);

    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor("#000000")
       .lineWidth(2)
       .stroke()
       .moveDown(0.5);

    doc.fontSize(18)
       .font("Helvetica-Bold")
       .fillColor("#000000")
       .text("Convention de Stage", { align: "center" })
       .moveDown(0.2);

    doc.fontSize(11)
       .font("Helvetica")
       .fillColor("#666666")
       .text("Année Universitaire 2025/2026", { align: "center" })
       .moveDown(0.5);

    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor("#000000")
       .lineWidth(1)
       .stroke()
       .moveDown(1);

    // ─── INTRO ────────────────────────────────────────────
    doc.fontSize(10)
       .font("Helvetica")
       .fillColor("#333333")
       .text(
         "La présente convention est conclue entre les parties suivantes, dans le cadre du stage prévu par les textes réglementaires en vigueur.",
         { align: "justify" }
       )
       .moveDown(1);

    // ─── HELPER FUNCTIONS ─────────────────────────────────
    const drawSectionTitle = (title) => {
      doc.fontSize(12)
         .font("Helvetica-Bold")
         .fillColor("#000000")
         .text(title)
         .moveDown(0.3);
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .strokeColor("#CCCCCC")
         .lineWidth(0.5)
         .stroke()
         .moveDown(0.5);
    };

    const drawField = (label, value) => {
      doc.fontSize(10)
         .font("Helvetica-Bold")
         .fillColor("#666666")
         .text(label + ": ", { continued: true })
         .font("Helvetica")
         .fillColor("#000000")
         .text(value || "N/A")
         .moveDown(0.3);
    };

    // ─── ARTICLE 1: PARTIES ───────────────────────────────
    drawSectionTitle("Article 1 — Parties concernées");

    doc.fontSize(11)
       .font("Helvetica-Bold")
       .text("L'Établissement:")
       .moveDown(0.2);
    drawField("Nom", "Université — [Nom de l'Université]");
    drawField("Représenté par", "Le Doyen de la Faculté");
    doc.moveDown(0.5);

    doc.fontSize(11)
       .font("Helvetica-Bold")
       .text("L'Organisme d'accueil:")
       .moveDown(0.2);
    drawField("Nom", convention.company?.name || "N/A");
    drawField("Email", convention.company?.email || "N/A");
    doc.moveDown(0.5);

    // ─── ARTICLE 2: STAGIAIRE ─────────────────────────────
    drawSectionTitle("Article 2 — Informations du stagiaire");
    drawField("Nom & Prénom", convention.student?.name || "N/A");
    drawField("Email", convention.student?.email || "N/A");
    drawField("Filière", convention.offer?.department || "N/A");
    drawField("Niveau", convention.offer?.educationLevel || "N/A");
    doc.moveDown(0.5);

    // ─── ARTICLE 3: STAGE ─────────────────────────────────
    drawSectionTitle("Article 3 — Objet et durée du stage");
    drawField("Poste", convention.offer?.jobTitle || "N/A");
    drawField("Département", convention.offer?.department || "N/A");
    drawField("Lieu", convention.offer?.location || "N/A");
    drawField("Type de travail", convention.offer?.workType || "N/A");
    drawField(
      "Date de début",
      convention.startDate
        ? new Date(convention.startDate).toLocaleDateString("fr-DZ")
        : "N/A"
    );
    drawField(
      "Date de fin",
      convention.endDate
        ? new Date(convention.endDate).toLocaleDateString("fr-DZ")
        : "N/A"
    );
    drawField("Durée", convention.offer?.duration || "N/A");
    doc.moveDown(0.3);
    doc.fontSize(10)
       .font("Helvetica-Bold")
       .fillColor("#666666")
       .text("Tâches & Objectifs:")
       .moveDown(0.2);
    doc.fontSize(10)
       .font("Helvetica")
       .fillColor("#000000")
       .text(convention.tasks || "N/A", { align: "justify" })
       .moveDown(0.5);

    // ─── ARTICLE 4: ENCADREMENT ───────────────────────────
    drawSectionTitle("Article 4 — Encadrement");
    drawField(
      "Encadreur universitaire",
      convention.supervisor?.name || "À désigner"
    );
    drawField(
      "Email encadreur",
      convention.supervisor?.email || "N/A"
    );
    doc.moveDown(0.5);

    // ─── ARTICLE 5: ENGAGEMENTS ───────────────────────────
    drawSectionTitle("Article 5 — Engagements des parties");
    doc.fontSize(10)
       .font("Helvetica")
       .fillColor("#333333")
       .text(
         "L'organisme d'accueil s'engage à accueillir le stagiaire dans de bonnes conditions et à lui fournir les moyens nécessaires à l'accomplissement de sa mission. L'université s'engage à assurer le suivi pédagogique du stagiaire. Le stagiaire s'engage à respecter le règlement intérieur de l'organisme d'accueil et à accomplir les tâches qui lui sont confiées.",
         { align: "justify" }
       )
       .moveDown(1.5);

    // ─── SIGNATURES ───────────────────────────────────────
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor("#CCCCCC")
       .lineWidth(0.5)
       .stroke()
       .moveDown(1);

    const signatureY = doc.y;
    const col1 = 50;
    const col2 = 210;
    const col3 = 390;

    doc.fontSize(10)
       .font("Helvetica-Bold")
       .fillColor("#000000");

    doc.text("Le Doyen de la Faculté", col1, signatureY, { width: 150, align: "center" });
    doc.text("Le Directeur de l'Entreprise", col2, signatureY, { width: 150, align: "center" });
    doc.text("Le Stagiaire", col3, signatureY, { width: 150, align: "center" });

    const signLineY = signatureY + 60;
    doc.moveTo(col1, signLineY).lineTo(col1 + 150, signLineY).stroke();
    doc.moveTo(col2, signLineY).lineTo(col2 + 150, signLineY).stroke();
    doc.moveTo(col3, signLineY).lineTo(col3 + 150, signLineY).stroke();

    doc.fontSize(9)
       .font("Helvetica")
       .fillColor("#666666")
       .text("Signature & Cachet", col1, signLineY + 5, { width: 150, align: "center" })
       .text("Signature & Cachet", col2, signLineY + 5, { width: 150, align: "center" })
       .text("Signature", col3, signLineY + 5, { width: 150, align: "center" });

    // ─── FOOTER ───────────────────────────────────────────
    doc.moveDown(3);
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor("#CCCCCC")
       .lineWidth(0.5)
       .stroke()
       .moveDown(0.3);

    doc.fontSize(9)
       .font("Helvetica")
       .fillColor("#999999")
       .text(
         `Fait le ${new Date().toLocaleDateString("fr-DZ")} — Document généré automatiquement par Stag.io`,
         { align: "center" }
       );

    doc.end();
  });
};

module.exports = { generateConventionPDF };