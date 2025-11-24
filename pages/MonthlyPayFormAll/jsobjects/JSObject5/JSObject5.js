export default {
  async generatePDFasURL() {
    try {
      const { jsPDF } = window.jspdf;

      if (!jsPDF) {
        showAlert("jsPDF not loaded!", "error");
        return "";
      }

      const doc = new jsPDF("landscape");
      let rows = TableCurrentM.tableData || [];

      if (!rows.length) {
        showAlert("No data in table!", "warning");
        return "";
      }

      // ----------------------------
      // SORT BY CURRENCY (TZS first)
      // ----------------------------
      rows = rows.sort((a, b) => {
        const A = a.currencycode || "";
        const B = b.currencycode || "";
        if (A === "TZS" && B !== "TZS") return -1;
        if (B === "TZS" && A !== "TZS") return 1;
        return A.localeCompare(B);
      });

      // Footer fields
      const first = rows[0] || {};
      const createdBy = first.createdby || "";
      const reviewedBy = first.reviewedby || "";
      const approvedBy = first.approvedby || "";

      const createdAt = first.createdat || "";
      const reviewedAt = first.reviewedat || "";
      const approvedAt = first.approvedat || "";

      // -----------------------------
      // HEADER
      // -----------------------------
      doc.setFontSize(16);
      doc.text("Monthly Payroll Report", 14, 15);

      // -----------------------------
      // COLUMNS (WCF REMOVED)
      // -----------------------------
      const columns = [
        { header: "Payroll Period", dataKey: "payrollperiod" },
        { header: "Staff Name", dataKey: "staffdName" },

        // NEW COLUMN (currency)
        { header: "Currency", dataKey: "currencycode" },

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
        { header: "Net Pay", dataKey: "netpay" }
      ];

      const num = (v) => (v ? Number(v) : 0);
      const fmt = (v) =>
        v === null || v === undefined || v === "" ? "" : Number(v).toLocaleString();

      // ---------------------------------------
      // GROUP ROWS BY CURRENCY + SUBTOTALS
      // ---------------------------------------
      let groupedRows = [];
      let currentCurrency = "";
      let subtotal = null;

      const startSubtotal = () => ({
        basicsalary: 0,
        otherbenefits: 0,
        salaryadvance: 0,
        loandeduction: 0,
        socialdeduction: 0,
        helsb: 0,
        advancerecovery: 0,
        otherdeductions: 0,
        nssf: 0,
        paye: 0,
        totaldeductions: 0,
        netpay: 0
      });

      rows.forEach((r) => {
        if (r.currencycode !== currentCurrency) {
          if (currentCurrency !== "") {
            groupedRows.push({
              staffdName: "SUBTOTAL",
              currencycode: currentCurrency,
              ...Object.fromEntries(
                Object.entries(subtotal).map(([k, v]) => [k, fmt(v)])
              ),
              isSubtotal: true
            });
          }

          currentCurrency = r.currencycode;
          subtotal = startSubtotal();
        }

        subtotal.basicsalary += num(r.basicsalary);
        subtotal.otherbenefits += num(r.otherbenefits);
        subtotal.salaryadvance += num(r.salaryadvance);
        subtotal.loandeduction += num(r.loandeduction);
        subtotal.socialdeduction += num(r.socialdeduction);
        subtotal.helsb += num(r.helsb);
        subtotal.advancerecovery += num(r.advancerecovery);
        subtotal.otherdeductions += num(r.otherdeductions);
        subtotal.nssf += num(r.nssf);
        subtotal.paye += num(r.paye);
        subtotal.totaldeductions += num(r.totaldeductions);
        subtotal.netpay += num(r.netpay);

        groupedRows.push({
          payrollperiod: r.payrollperiod,
          staffdName: r.staffdName,
          currencycode: r.currencycode,
          basicsalary: fmt(r.basicsalary),
          otherbenefits: fmt(r.otherbenefits),
          salaryadvance: fmt(r.salaryadvance),
          loandeduction: fmt(r.loandeduction),
          socialdeduction: fmt(r.socialdeduction),
          helsb: fmt(r.helsb),
          advancerecovery: fmt(r.advancerecovery),
          otherdeductions: fmt(r.otherdeductions),
          nssf: fmt(r.nssf),
          paye: fmt(r.paye),
          totaldeductions: fmt(r.totaldeductions),
          netpay: fmt(r.netpay),
          isSubtotal: false
        });
      });

      // Final subtotal for last currency
      if (currentCurrency !== "") {
        groupedRows.push({
          staffdName: "SUBTOTAL",
          currencycode: currentCurrency,
          ...Object.fromEntries(
            Object.entries(subtotal).map(([k, v]) => [k, fmt(v)])
          ),
          isSubtotal: true
        });
      }

      // ------------------------------
      // AUTOTABLE
      // ------------------------------
      doc.autoTable({
        startY: 25,
        columns,
        body: groupedRows,
        styles: { fontSize: 8 },
        didParseCell: function (data) {
          if (data.row.raw.isSubtotal) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [210, 245, 210]; // light green
          }
        },
        columnStyles: {
          currencycode: { halign: "center" },
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
          netpay: { halign: "right" }
        }
      });

      // ------------------------------
      // FOOTER
      // ------------------------------
      const pageHeight = doc.internal.pageSize.height;
      const footerY = pageHeight - 28;
      const colWidth = doc.internal.pageSize.width / 3;

      doc.setFontSize(13);
      doc.setFont(undefined, "italic");
      doc.text(`created by: ${createdBy}`, 10, footerY);
      doc.text(`reviewed by: ${reviewedBy}`, colWidth + 10, footerY);
      doc.text(`approved by: ${approvedBy}`, colWidth * 2 + 10, footerY);

      doc.setDrawColor(160, 160, 160);
      doc.line(10, footerY + 2, colWidth - 15, footerY + 2);
      doc.line(colWidth + 10, footerY + 2, colWidth * 2 - 15, footerY + 2);
      doc.line(colWidth * 2 + 10, footerY + 2, colWidth * 3 - 15, footerY + 2);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`created at: ${createdAt}`, 10, footerY + 8);
      doc.text(`reviewed at: ${reviewedAt}`, colWidth + 10, footerY + 8);
      doc.text(`approved at: ${approvedAt}`, colWidth * 2 + 10, footerY + 8);

      // FINAL DATA URL
      const dataUrl = doc.output("datauristring");
      await download(dataUrl, "Payroll_Report.pdf", "application/pdf");
      return dataUrl;

    } catch (e) {
      showAlert("Error generating PDF: " + e.message, "error");
      return "";
    }
  }
};


