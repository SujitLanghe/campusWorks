import PDFDocument from "pdfkit";

/**
 * Generates a certificate PDF and pipes it into the given response stream.
 * @param {object} res - Express response object
 * @param {object} data - { studentName, projectTitle, professorName, department, completedAt }
 */
const generateCertificate = (res, data) => {
    const { studentName, projectTitle, professorName, department, completedAt } = data;

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 60 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="certificate_${studentName.replace(/\s/g, "_")}.pdf"`
    );

    doc.pipe(res);

    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .strokeColor("#1a237e")
        .stroke();

    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .lineWidth(1)
        .strokeColor("#3949ab")
        .stroke();

    // Header
    doc.moveDown(2)
        .font("Helvetica-Bold")
        .fontSize(36)
        .fillColor("#1a237e")
        .text("CERTIFICATE OF COMPLETION", { align: "center" });

    doc.moveDown(0.5)
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#555555")
        .text("This is to certify that", { align: "center" });

    // Student name
    doc.moveDown(0.8)
        .font("Helvetica-Bold")
        .fontSize(30)
        .fillColor("#000000")
        .text(studentName.toUpperCase(), { align: "center" });

    doc.moveDown(0.5)
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#555555")
        .text("has successfully completed the project", { align: "center" });

    // Project title
    doc.moveDown(0.5)
        .font("Helvetica-BoldOblique")
        .fontSize(22)
        .fillColor("#1a237e")
        .text(`"${projectTitle}"`, { align: "center" });

    doc.moveDown(0.5)
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#555555")
        .text(`under the guidance of Prof. ${professorName}`, { align: "center" })
        .text(`Department of ${department}`, { align: "center" });

    // Completion date
    const formattedDate = new Date(completedAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
    });

    doc.moveDown(1.5)
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#333333")
        .text(`Date of Completion: ${formattedDate}`, { align: "center" });

    // Footer line
    doc.moveDown(2)
        .moveTo(80, doc.y)
        .lineTo(doc.page.width - 80, doc.y)
        .strokeColor("#1a237e")
        .stroke();

    doc.moveDown(0.5)
        .font("Helvetica-Oblique")
        .fontSize(11)
        .fillColor("#666666")
        .text("campusWorks — Bridging Students and Professors", { align: "center" });

    doc.end();
};

export { generateCertificate };
