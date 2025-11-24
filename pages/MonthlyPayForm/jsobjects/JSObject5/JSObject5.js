export default {
  async generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    const darkGreen = "#0B4F3F";
    const subtotalBg = "#E6F4EE";
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ============================
    // HEADER + LOGO
    // ============================
    try {
      if (Image1 && Image1.image) {
        doc.addImage(Image1.image, "PNG", 10, 8, 25, 25);
      }
    } catch (e) {
      console.log("Logo error:", e);
    }

    doc.setTextColor(darkGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Aga Khan Foundation Tanzania", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Monthly Payroll", pageWidth / 2, 27, { align: "center" });

    doc.setFontSize(12);
    const monthLabel = SelectPM?.selectedOptionValue ?? "";
    doc.text(monthLabel, pageWidth / 2, 35, { align: "center" });

    doc.setTextColor("#000000");

    // ============================
    // TABLE COLUMNS
    // ============================
    const columns = [
      "Staff ID",
      "Staff Name",
      "Currency",
      "Basic Salary",
      "Other Benefits",
      "Salary Advance",
      "Loan Deduction",
      "Social Deduction",
      "HELSB",
      "Advance Recovery",
      "Other Deductions",
      "NSSF",
      "PAYE",
      "Net Pay"
    ];

    const sourceRows =
      TableCurrentM?.selectedRows?.length
        ? TableCurrentM.selectedRows
        : TableCurrentM?.tableData ?? [];

    // ============================
    // NUMBER FORMATTER
    // ============================
    const cleanNum = (v) => Number(String(v ?? 0).replace(/,/g, "")) || 0;
    const fmt = (v) => cleanNum(v).toLocaleString();

    // ============================
    // SORT BY CURRENCY (TZS → USD)
    // ============================
    const sorted = [...sourceRows].sort((a, b) => {
      const order = { "TZS": 1, "USD": 2 };
      return (order[a.currencycode] ?? 99) - (order[b.currencycode] ?? 99);
    });

    // ============================
    // GROUP + SUBTOTALS
    // ============================
    const rows = [];
    let currentCurrency = null;

    let subtotal = {
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
      netpay: 0
    };

    const pushSubtotal = (currency) => {
      rows.push([
        "", `Subtotal (${currency})`, currency,
        fmt(subtotal.basicsalary),
        fmt(subtotal.otherbenefits),
        fmt(subtotal.salaryadvance),
        fmt(subtotal.loandeduction),
        fmt(subtotal.socialdeduction),
        fmt(subtotal.helsb),
        fmt(subtotal.advancerecovery),
        fmt(subtotal.otherdeductions),
        fmt(subtotal.nssf),
        fmt(subtotal.paye),
        fmt(subtotal.netpay)
      ]);
    };

    for (let row of sorted) {
      if (currentCurrency && currentCurrency !== row.currencycode) {
        pushSubtotal(currentCurrency);
        subtotal = Object.fromEntries(Object.keys(subtotal).map(k => [k, 0]));
      }

      currentCurrency = row.currencycode;

      subtotal.basicsalary += cleanNum(row.basicsalary);
      subtotal.otherbenefits += cleanNum(row.otherbenefits);
      subtotal.salaryadvance += cleanNum(row.salaryadvance);
      subtotal.loandeduction += cleanNum(row.loandeduction);
      subtotal.socialdeduction += cleanNum(row.socialdeduction);
      subtotal.helsb += cleanNum(row.helsb);
      subtotal.advancerecovery += cleanNum(row.advancerecovery);
      subtotal.otherdeductions += cleanNum(row.otherdeductions);
      subtotal.nssf += cleanNum(row.nssf);
      subtotal.paye += cleanNum(row.paye);
      subtotal.netpay += cleanNum(row.netpay);

      rows.push([
        row.staffid ?? "",
        row.staffdName ?? "",
        row.currencycode ?? "",
        fmt(row.basicsalary),
        fmt(row.otherbenefits),
        fmt(row.salaryadvance),
        fmt(row.loandeduction),
        fmt(row.socialdeduction),
        fmt(row.helsb),
        fmt(row.advancerecovery),
        fmt(row.otherdeductions),
        fmt(row.nssf),
        fmt(row.paye),
        fmt(row.netpay)
      ]);
    }

    if (currentCurrency) pushSubtotal(currentCurrency);

    // ============================
    // COLUMN ALIGNMENT
    // ============================
    const columnStyles = { 0: { halign: "left" }, 1: { halign: "left" } };
    for (let i = 2; i < columns.length; i++) {
      columnStyles[i] = { halign: "right" };
    }

    // ============================
    // RENDER TABLE
    // ============================
    doc.autoTable({
      head: [columns],
      body: rows,
      theme: "grid",
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: darkGreen, textColor: "#ffffff" },
      columnStyles: columnStyles,

      // >>> Subtotal Styling <<<
      didParseCell: function (data) {
        const row = data.row.raw;

        if (!row) return;

        const isSubtotal =
          row[1] && String(row[1]).includes("Subtotal");

        if (isSubtotal) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = darkGreen;
          data.cell.styles.fillColor = subtotalBg;
        }
      }
    });

    // ============================
    // FOOTER
    // ============================
    const footerY = pageHeight - 20;

    const createdBy = appsmith.store.user.username ?? "";
    const createdAt = new Date().toLocaleString();

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);

    doc.text(`created by: ${createdBy}`, 15, footerY);
    doc.text(`date: ${createdAt}`, 15, footerY + 6);

    // ============================
    // RETURN BLOB URL
    // ============================
    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }
};


