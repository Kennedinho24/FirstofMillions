export default {
  async generateAndSavePDFs() {

		// Use the query directly
    const tableData = getcurrentmonth?.data || [];

    console.log("DEBUG tableData:", tableData);

    if (!tableData || tableData.length === 0) {
      showAlert("No rows found in getcurrentmonth!", "warning");
      return [];
    }

    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showAlert("jsPDF not loaded!", "error");
      return [];
    }

    showAlert("Generating PDFs... Please wait.", "info");

    for (let row of tableData) {
      const pdfUrl = await this._generateSinglePDF(row);

      // Save PDF URL into DB using your update query
      await UpdatePDFUrl.run({
        id: row.transid,
        pdfUrl: pdfUrl,
      });
    }

    showAlert("All PDFs generated and saved successfully!", "success");

    return [];
  },

  async _generateSinglePDF(row) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("portrait");

      const formatNumber = (n) =>
        n === null || n === undefined ? "0" : n.toLocaleString();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Watermark
      doc.setFontSize(40);
      doc.setTextColor(220, 220, 220);
      doc.setFont(undefined, "bold");

      for (let y = pageHeight; y > -40; y -= 150) {
        for (let x = 0; x < pageWidth + 200; x += 200) {
          doc.text("Aga Khan Foundation Tanzania", x, y, {
            align: "center",
            angle: 45,
          });
        }
      }

      // Header
      doc.setFontSize(16);
      doc.setTextColor(21, 128, 61);
      doc.setFont(undefined, "bold");
      doc.text("Aga Khan Foundation Tanzania", pageWidth / 2, 15, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Salary Slip: ${row.payrollperiod || ""}`, pageWidth / 2, 23, {
        align: "center",
      });

      let y = 40;
      const lh = 8;
      const left = 20;
      const right = 190;

      doc.text("Staff:", left, y);
      doc.text(row.staffdName || "", right, y, { align: "right" });
      y += lh * 2;

      doc.text("Basic Salary:", left, y);
      doc.text(formatNumber(row.basicsalary), right, y, { align: "right" });
      y += lh;

      doc.text("Other Benefits:", left, y);
      doc.text(formatNumber(row.otherbenefits), right, y, { align: "right" });
      y += lh;

      doc.setFont(undefined, "bold");
      doc.text("Gross Salary:", left, y);
      doc.text(formatNumber(row.grosssalary), right, y, { align: "right" });
      doc.setFont(undefined, "normal");
      y += lh * 2;

      const deductions = [
        { label: "NSSF", key: "nssf" },
        { label: "PAYE", key: "paye" },
        { label: "Salary Advance", key: "salaryadvance" },
        { label: "Loan Deduction", key: "loandeduction" },
        { label: "Social Contribution", key: "socialdeduction" },
        { label: "HELSB", key: "helsb" },
        { label: "Travel Advance", key: "advancerecovery" },
        { label: "Other Deductions", key: "otherdeductions" },
      ];

      deductions.forEach((d) => {
        doc.text(`${d.label}:`, left, y);
        doc.text(formatNumber(row[d.key]), right, y, { align: "right" });
        y += lh;
      });

      doc.setFont(undefined, "bold");
      doc.text("Net Pay:", left, y);
      doc.text(formatNumber(row.netpay), right, y, { align: "right" });

      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "© Aga Khan Foundation Tanzania",
        pageWidth / 2,
        pageHeight - 20,
        { align: "center" }
      );

      return doc.output("datauristring");
    } catch (e) {
      showAlert("PDF Error: " + e.message, "error");
      return "";
    }
  },
};


