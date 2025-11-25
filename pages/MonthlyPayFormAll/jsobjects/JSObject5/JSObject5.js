export default {

  async toBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  },

  async generatePDFasURL() {
    try {
      const { jsPDF } = window.jspdf;

      if (!jsPDF) {
        showAlert("jsPDF not loaded!", "error");
        return "";
      }

      // -----------------------------
      // LOAD LOGO
      // -----------------------------
      const imageURL = "https://i.postimg.cc/G3zQvKn8/AKF-Logo.jpg?dl=1";
      const base64Image = await this.toBase64(imageURL);

      const doc = new jsPDF("landscape");

      let rows = TableCurrentM.tableData || [];
      if (!rows.length) {
        showAlert("No data in table!", "warning");
        return "";
      }

      // -----------------------------
      // SORT BY CURRENCY
      // -----------------------------
      rows = rows.sort((a, b) => {
        const A = a.currencycode || "";
        const B = b.currencycode || "";
        if (A === "TZS" && B !== "TZS") return -1;
        if (B === "TZS" && A !== "TZS") return 1;
        return A.localeCompare(B);
      });

      // -----------------------------
      // FOOTER FIELDS
      // -----------------------------
      const first = rows[0] || {};
      const createdBy = first.createdby || "";
      const reviewedBy = first.reviewedby || "";
      const approvedBy = first.approvedby || "";

      const createdAt = first.createdat || "";
      const reviewedAt = first.reviewedat || "";
      const approvedAt = first.approvedat || "";

      // -----------------------------
      // ADD LOGO
      // -----------------------------
      doc.addImage(base64Image, "JPEG", 10, 5, 20, 30);

      // -----------------------------
      // HEADER TEXT (updated to include SelectPM label)
      // -----------------------------
      doc.setFontSize(14);
			doc.setTextColor(0, 100, 0);
      doc.text(`Monthly Payroll Report`, 125, 18);
			
			doc.text(
        `${SelectPM?.selectedOptionLabel}`, 140, 28);

      doc.setFontSize(18);
			doc.setTextColor(0, 100, 0);
      doc.text("AGA KHAN FOUNDATION, TANZANIA", 100, 40);

      // -----------------------------
      // COLUMNS
      // -----------------------------
      const columns = [
        { header: "Payroll Period", dataKey: "payrollperiod" },
        { header: "Staff Name", dataKey: "staffdName" },
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

      // -----------------------------
      // GROUP ROWS + SUBTOTALS
      // -----------------------------
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

      // FINAL subtotal
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

      // -----------------------------
      // DRAW TABLE
      // -----------------------------
      doc.autoTable({
        columns: columns,
        body: groupedRows,
        startY: 50,
        styles: { fontSize: 8 },
        didParseCell: function (data) {
          if (data.row.raw && data.row.raw.isSubtotal) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [230, 244, 238];
          }
        }
      });

      // -----------------------------
      // FOOTER
      // -----------------------------
      let y = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : 50) + 15;

      doc.setFont("Pacifico", "italic");
			doc.setFontSize(10);
			doc.setTextColor(0, 0, 39);
			
      doc.text("Created By:", 14, y);
      doc.text(createdBy, 14, y + 6);
      doc.text(createdAt, 14, y + 12);

      doc.text("Reviewed By:", 120, y);
      doc.text(reviewedBy, 120, y + 6);
      doc.text(reviewedAt, 120, y + 12);

      doc.text("Approved By:", 240, y);
      doc.text(approvedBy, 240, y + 6);
      doc.text(approvedAt, 240, y + 12);
			
			doc.setFont("times", "bolditalic");
			doc.setFontSize(8);
			doc.setTextColor(0, 100, 0);
			doc.text(`Payroll powered by DocuTrack ERP ©`, 14, y + 70);
			doc.text(`It cannot get greener than this! Print Responsibly!!`, 80, y + 70);

      // -----------------------------
      // AUTO-DOWNLOAD (reliable anchor + blob method)
      // -----------------------------
      // Create PDF blob
      const pdfBlob = doc.output("blob");

      // Create object URL
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create hidden anchor and click it
      const fileName = `Payroll_Report${SelectPM?.selectedOptionLabel ? `_${SelectPM.selectedOptionLabel}` : ""}.pdf`;

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      // Some environments (sandboxed iframe) require the anchor to be added to DOM first:
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        try { a.remove(); } catch (e) { /* ignore */ }
      }, 1000);

      // Return something meaningful for the JSObject caller
       const dataUrl = doc.output("datauristring");
      await download(dataUrl, `Payroll_Report_${SelectPM?.selectedOptionLabel || ''}.pdf`, "application/pdf");

      return dataUrl;

    } catch (e) {
      showAlert("PDF generation error: " + e.message, "error");
      return { status: "error", message: e.message };
    }
  }
};






