export default {
  async generatePAYEPDF() {
    try {
      // Only run if "paye" is selected
      const selectedValue = Select1?.selectedOptionValue?.toString().toLowerCase() || "";
      if (selectedValue !== "paye") {
        showAlert("PAYE PDF can only be generated when PAYE is selected.", "warning");
        return "";
      }

      const { jsPDF } = window.jspdf;
      if (!jsPDF) {
        showAlert("jsPDF not loaded!", "error");
        return "";
      }

      // --- Get table data (all rows including any filtered or calculated data) ---
      const dataRows =
        Array.isArray(TableCurrentMCopy?.tableData) ? TableCurrentMCopy.tableData :
        Array.isArray(TableCurrentMCopy?.filteredData) ? TableCurrentMCopy.filteredData :
        Array.isArray(TableCurrentMCopy?.data) ? TableCurrentMCopy.data :
        [];

      if (dataRows.length === 0) {
        showAlert("No data found in TableCurrentMCopy!", "warning");
        return "";
      }

      const doc = new jsPDF("portrait");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const lineHeight = 8;

      const leftMargin = 15;
      const col2X = 60;
      const col3X = 150;
      const col4X = 180;

      const formatNumber = (n) =>
        (n === null || n === undefined ? "0" : Number(n).toLocaleString());

      // --- HEADER ---
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(21, 128, 61);
      doc.text("Aga Khan Foundation Tanzania", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const payrollPeriod = SelectPMCopy?.selectedOptionLabel || "";
      const headerText = `PAYE Report${payrollPeriod ? " - Payroll Period: " + payrollPeriod : ""}`;
      doc.text(headerText, pageWidth / 2, 25, { align: "center" });

      // --- HORIZONTAL LINE ---
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, 30, pageWidth - leftMargin, 30);

      // --- TABLE HEADER ---
      let y = 40;
      doc.setFont("helvetica", "bold");
      doc.text("Staff ID", leftMargin, y);
      doc.text("Staff Name", col2X, y);
      doc.text("Taxable Income", col3X, y, { align: "right" });
      doc.text("PAYE", col4X, y, { align: "right" });
      y += lineHeight;

      doc.setFont("helvetica", "normal");

      let totalTaxable = 0;
      let totalPAYE = 0;

      dataRows.forEach((row) => {
        const staffID = row.staffid || "";
        const staffName = row.staffdName || "";

        // --- Calculate taxable dynamically ---
        const grossSalary = Number(row.grosssalary || 0);
        const nssf = Number(row.nssf || 0);
        const taxable = grossSalary - nssf;

        const paye = Number(row.paye || 0); // assuming paye column exists

        totalTaxable += taxable;
        totalPAYE += paye;

        doc.text(staffID, leftMargin, y);
        doc.text(staffName, col2X, y);
        doc.text(formatNumber(taxable), col3X, y, { align: "right" });
        doc.text(formatNumber(paye), col4X, y, { align: "right" });

        y += lineHeight;

        // --- PAGE BREAK ---
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;

          // Repeat table header on new page
          doc.setFont("helvetica", "bold");
          doc.text("Staff ID", leftMargin, y);
          doc.text("Staff Name", col2X, y);
          doc.text("Taxable", col3X, y, { align: "right" });
          doc.text("PAYE", col4X, y, { align: "right" });
          y += lineHeight;
          doc.setFont("helvetica", "normal");
        }
      });

      // --- TOTALS ROW ---
      doc.setFont("helvetica", "bold");
      doc.text("Totals", col2X, y);
      doc.text(formatNumber(totalTaxable), col3X, y, { align: "right" });
      doc.text(formatNumber(totalPAYE), col4X, y, { align: "right" });

      // --- FOOTER ---
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("© Aga Khan Foundation Tanzania", pageWidth / 2, pageHeight - 20, { align: "center" });

      return doc.output("datauristring");

    } catch (e) {
      showAlert("Error generating PAYE PDF: " + e.message, "error");
      return "";
    }
  },
};

