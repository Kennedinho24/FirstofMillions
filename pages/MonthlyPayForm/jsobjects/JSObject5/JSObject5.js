export default {
  async generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    const darkGreen = "#0B4F3F";
    const pageWidth = doc.internal.pageSize.getWidth();

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
    // COLUMNS
    // ============================
    const columns = [
      "Staff ID",
      "Staff Name",
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
    // ROWS: format numbers with commas
    // ============================
    const toNumber = (v) =>
      v ? Number(String(v).replace(/,/g, "")).toLocaleString() : "0";

    const rows = sourceRows.map(row => [
      row.staffid ?? "",
      row.staffdName ?? "",
      toNumber(row.basicsalary),
      toNumber(row.otherbenefits),
      toNumber(row.salaryadvance),
      toNumber(row.loandeduction),
      toNumber(row.socialdeduction),
      toNumber(row.helsb),
      toNumber(row.advancerecovery),
      toNumber(row.otherdeductions),
      toNumber(row.nssf),
      toNumber(row.paye),
      toNumber(row.netpay)
    ]);

    // ============================
    // RIGHT-ALIGN ALL NUMBER COLUMNS
    // columns 2 → 13 = numeric
    // ============================
    const columnStyles = {
      0: { halign: "left" },
      1: { halign: "left" },
    };

    // Loop numeric columns and set halign = right
    for (let i = 2; i < columns.length; i++) {
      columnStyles[i] = { halign: "right" };
    }

    // ============================
    // GENERATE TABLE
    // ============================
    doc.autoTable({
      head: [columns],
      body: rows,
      theme: "grid",
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: darkGreen, textColor: "#ffffff" },
      margin: { top: 50 },
      columnStyles: columnStyles
    });

    // ============================
    // RETURN BLOB URL
    // ============================
    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }
};
