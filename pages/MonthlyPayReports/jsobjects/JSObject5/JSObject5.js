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

      const doc = new jsPDF("portrait");
      const selectedRow = TableCurrentM.selectedRow;

      if (!selectedRow) {
        showAlert("No row selected!", "warning");
        return "";
      }

      const formatNumber = (n) => (n === null || n === undefined ? "0" : n.toLocaleString());

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- WATERMARK (diagonal 45°, repeated from bottom-left) ---
      const watermarkText = "Aga Khan Foundation Tanzania";
      const fontSize = 40;
      const textColor = [220, 220, 220]; // very light gray
      doc.setFontSize(fontSize);
      doc.setTextColor(...textColor);
      doc.setFont(undefined, "bold");

      const xSpacing = 200; // horizontal spacing
      const ySpacing = 150; // vertical spacing

      // Start from bottom-left corner
      for (let y = pageHeight; y > -fontSize; y -= ySpacing) {
        for (let x = 0; x < pageWidth + xSpacing; x += xSpacing) {
          doc.text(watermarkText, x, y, { align: "center", angle: 45 });
        }
      }

      // --- HEADER ---
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(21, 128, 61); // #15803d
      doc.text("Aga Khan Foundation Tanzania", pageWidth / 2, 15, { align: "center" });
			
      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0); // reset to black
      doc.text(`Salary Slip: ${selectedRow.payrollperiod || ""}`, pageWidth / 2, 23, { align: "center" });

      let y = 40;
      const lineHeight = 8;
      const labelX = 20;
      const rightMargin = 190;
			
			// logo
			const logoURL = "https://i.postimg.cc/G3zQvKn8/AKF-Logo.jpg?dl=1";
			const base64Logo = await this.toBase64(logoURL);

    try {
      doc.addImage(base64Logo, "JPEG", 20, 0, 20, 35);
    } catch (e) {
      console.log("Logo load failed:", e);
    }
			
		
      // --- Staff Name ---
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Staff:", labelX, y+5);
      doc.text(selectedRow.staffdName || "", rightMargin+4, y+5, { align: "right" });
      y += lineHeight * 2;

      // --- Earnings ---
      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      doc.text("Basic Salary:", labelX, y);
      doc.text(formatNumber(selectedRow.basicsalary), rightMargin, y, { align: "right" });
      y += lineHeight;

      doc.text("Other Benefits:", labelX, y);
      doc.text(formatNumber(selectedRow.otherbenefits), rightMargin, y, { align: "right" });
      y += lineHeight;

      // Gross Salary (bold, from table)
      doc.setFont(undefined, "bold");
      doc.text("Gross Salary:", labelX, y);
      doc.text(formatNumber(selectedRow.grosssalary), rightMargin, y, { align: "right" });
      y += lineHeight * 2;

      // --- Deductions ---
      doc.setFont(undefined, "normal");
      const deductions = [
        { label: "NSSF", key: "nssf" },
        { label: "PAYE", key: "paye" },
        { label: "Salary Advance", key: "salaryadvance" },
        { label: "Loan Deduction", key: "loandeduction" },
        { label: "Social Contribution", key: "socialdeduction" },
        { label: "HELSB", key: "helsb" },
        { label: "Travel Advance", key: "advancerecovery" },
        { label: "Other Deductions", key: "otherdeductions" }
      ];

      deductions.forEach(d => {
        doc.text(`${d.label}:`, labelX, y);
        doc.text(formatNumber(selectedRow[d.key]), rightMargin, y, { align: "right" });
        y += lineHeight;
      });

      // Net Pay (bold)
      doc.setFont(undefined, "bold");
      doc.text("Net Pay:", labelX, y);
      doc.text(formatNumber(selectedRow.netpay), rightMargin, y, { align: "right" });
      y += lineHeight * 2;

      // --- ADD SECOND IMAGE BELOW NET PAY ---
      const secondImgURL = "https://i.postimg.cc/VN1Hq540/Designer.png";
      const base64SecondImg = await this.toBase64(secondImgURL);

      try {
        doc.addImage(base64SecondImg, "PNG", 55, y, 90, 40);
      } catch (e) {
        console.log("Second image load failed:", e);
      }

      y += 55;

      // --- Footer ---
      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("© Payroll powered by DocuTrack ERP", pageWidth / 2, pageHeight - 20, { align: "center" });

      // --- Return PDF as URL for preview ---
      const dataUrl = doc.output("datauristring");
      return dataUrl;

    } catch (e) {
      showAlert("Error generating PDF: " + e.message, "error");
      return "";
    }
  }
};
