export default {
  async generatePDFstatutory() {
    try {
      const { jsPDF } = window.jspdf;

      if (!jsPDF) {
        showAlert("jsPDF not loaded!", "error");
        return "";
      }

      // --- Get table data robustly ---
      const dataRows =
        Array.isArray(TableCurrentMCopy?.data) ? TableCurrentMCopy.data :
        Array.isArray(TableCurrentMCopy?.filteredData) ? TableCurrentMCopy.filteredData :
        Array.isArray(TableCurrentMCopy?.tableData) ? TableCurrentMCopy.tableData :
        [];

      if (dataRows.length === 0) {
        showAlert("No data found in TableCurrentMCopy!", "warning");
        return "";
      }

      const doc = new jsPDF("portrait");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const lineHeight = 8;

      const leftMargin = 20;
      const col2X = 80;
      const col3X = 160;

      const formatNumber = (n) => (n === null || n === undefined ? "0" : n.toLocaleString());

      // --- HEADER ---
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(21, 128, 61); // #15803d
      doc.text("Aga Khan Foundation Tanzania", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      // Report type followed by Payroll period
      const reportLabel = Select1?.selectedOptionLabel || "";
      const payrollPeriod = SelectPMCopy?.selectedOptionLabel || "";
      const headerText = payrollPeriod ? `${reportLabel} - Payroll Period: ${payrollPeriod}` : reportLabel;

      doc.text(headerText, pageWidth / 2, 23, { align: "center" });

      // --- HORIZONTAL LINE ---
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, 28, pageWidth - leftMargin, 28);

      // --- TABLE HEADER ---
      let y = 40;
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Staff ID", leftMargin, y);
      doc.text("Staff Name", col2X, y);
      doc.text(reportLabel || "Value", col3X, y, { align: "right" });
      y += lineHeight;

      // --- TABLE ROWS ---
      doc.setFont(undefined, "normal");
      let totalValue = 0;

      dataRows.forEach(row => {
        doc.text(row.staffid || "", leftMargin, y);
        doc.text(row.staffdName || "", col2X, y);

        const dynamicKey = Select1.selectedOptionValue;
        const dynamicValue = row.hasOwnProperty(dynamicKey) ? row[dynamicKey] : 0;

        doc.text(formatNumber(dynamicValue), col3X, y, { align: "right" });
        totalValue += Number(dynamicValue) || 0;
        y += lineHeight;

        // --- PAGE BREAK ---
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }
      });

      // --- TOTAL ROW ---
      doc.setFont(undefined, "bold");
      doc.text("Totals", col2X, y);
      doc.text(formatNumber(totalValue), col3X, y, { align: "right" });

      // --- FOOTER ---
      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("© Aga Khan Foundation Tanzania", pageWidth / 2, pageHeight - 20, { align: "center" });

      return doc.output("datauristring");

    } catch (e) {
      showAlert("Error generating PDF: " + e.message, "error");
      return "";
    }
  }
};

