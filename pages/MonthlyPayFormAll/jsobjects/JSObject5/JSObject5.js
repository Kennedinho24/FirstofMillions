export default {
  async generatePDFasURL() {
    try {
      const { jsPDF } = window.jspdf;

      if (!jsPDF) {
        showAlert("jsPDF not loaded!", "error");
        return "";
      }

      const doc = new jsPDF("landscape");
      const rows = TableCurrentM.tableData || [];

      if (!rows.length) {
        showAlert("No data in table!", "warning");
        return "";
      }

      // Footer fields (lowercase)
      const first = rows[0] || {};
      const createdBy = first.createdby || "";
      const reviewedBy = first.reviewedby || "";
      const approvedBy = first.approvedby || "";

      const createdAt = first.createdat || "";
      const reviewedAt = first.reviewedat || "";
      const approvedAt = first.approvedat || "";

      // Title
      doc.setFontSize(16);
      doc.text("Monthly Payroll Report", 14, 15);

      // Columns
      const columns = [
        { header: "Payroll Period", dataKey: "payrollperiod" },
        { header: "Staff Name", dataKey: "staffdName" },
        { header: "Basic", dataKey: "basicsalary" },
        { header: "Benefits", dataKey: "otherbenefits" },
        { header: "Advance", dataKey: "salaryadvance" },
        { header: "Loan", dataKey: "loandeduction" },
        { header: "Social", dataKey: "socialdeduction" },
        { header: "HELSB", dataKey: "helsb" },
        { header: "Recovery", dataKey: "advancerecovery" },
        { header: "Other Deductions", dataKey: "otherdeductions" },
        { header: "NSSF", dataKey: "nssf" },
        { header: "PAYE", dataKey: "paye" },
        { header: "Total Deductions", dataKey: "totaldeductions" },
        { header: "Net Pay", dataKey: "netpay" },
        { header: "WCF", dataKey: "wcf" }
      ];

      const formatNumber = (n) => (n === null || n === undefined ? "" : n.toLocaleString());

      const body = rows.map(r => ({
        payrollperiod: r.payrollperiod,
        staffdName: r.staffdName,
        basicsalary: formatNumber(r.basicsalary),
        otherbenefits: formatNumber(r.otherbenefits),
        salaryadvance: formatNumber(r.salaryadvance),
        loandeduction: formatNumber(r.loandeduction),
        socialdeduction: formatNumber(r.socialdeduction),
        helsb: formatNumber(r.helsb),
        advancerecovery: formatNumber(r.advancerecovery),
        otherdeductions: formatNumber(r.otherdeductions),
        nssf: formatNumber(r.nssf),
        paye: formatNumber(r.paye),
        totaldeductions: formatNumber(r.totaldeductions),
        netpay: formatNumber(r.netpay),
        wcf: formatNumber(r.wcf)
      }));

      // Generate table
      doc.autoTable({
        startY: 25,
        columns,
        body,
        styles: { fontSize: 8 },
        columnStyles: {
          basicsalary: { halign: "right" },
          otherbenefits: { halign: "right" },
          salaryadvance: { halign: "right" },
          loandeduction: { halign: "right" },
          socialdeduction: { halign: "right" },
          helsb: { halign: "right" },
          advancerecovery: { halign: "right" },
          otherdeductions: { halign: "right" },
          nssf: { halign: "right" },
          paye: { halign: "right" },
          totaldeductions: { halign: "right" },
          netpay: { halign: "right" },
          wcf: { halign: "right" }
        },
        didParseCell: function(data) {
          if (data.row.raw.staffdName === "TOTALS") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [214, 234, 255];
          }
        }
      });

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      const footerY = pageHeight - 28;
      const colWidth = doc.internal.pageSize.width / 3;

      doc.setFontSize(13);
      doc.setFont(undefined, "italic");
      doc.setTextColor(70, 70, 70);
      doc.text(`created by: ${createdBy}`, 10, footerY);
      doc.text(`reviewed by: ${reviewedBy}`, colWidth + 10, footerY);
      doc.text(`approved by: ${approvedBy}`, colWidth * 2 + 10, footerY);

      // Underlines
      doc.setDrawColor(160, 160, 160);
      doc.line(10, footerY + 2, colWidth - 15, footerY + 2);
      doc.line(colWidth + 10, footerY + 2, colWidth * 2 - 15, footerY + 2);
      doc.line(colWidth * 2 + 10, footerY + 2, colWidth * 3 - 15, footerY + 2);

      // Dates
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`created at: ${createdAt}`, 10, footerY + 8);
      doc.text(`reviewed at: ${reviewedAt}`, colWidth + 10, footerY + 8);
      doc.text(`approved at: ${approvedAt}`, colWidth * 2 + 10, footerY + 8);

      // --- Download directly as data URL to avoid corruption ---
      const dataUrl = doc.output("datauristring");
      await download(dataUrl, "Payroll_Report.pdf", "application/pdf");

      // Return URL as well if needed for preview
      return dataUrl;

    } catch (e) {
      showAlert("Error generating PDF: " + e.message, "error");
      return "";
    }
  }
};
