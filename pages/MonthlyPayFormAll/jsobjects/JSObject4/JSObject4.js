export default {
  async generateExcelDownload() {
    try {
      if (!window.XLSX) {
        showAlert("XLSX library not loaded!", "error");
        return false;
      }

      const rows = TableCurrentM.tableData || [];
      if (!rows.length) {
        showAlert("No data in table!", "warning");
        return false;
      }

      // Prepare Excel data
      const data = rows.map(r => ({
        "Payroll Period": r.payrollperiod,
        "Staff Name": r.staffdName,
        "Basic": r.basicsalary,
        "Benefits": r.otherbenefits,
        "Advance": r.salaryadvance,
        "Loan": r.loandeduction,
        "Social": r.socialdeduction,
        "HELSB": r.helsb,
        "Recovery": r.advancerecovery,
        "Other Deductions": r.otherdeductions,
        "NSSF": r.nssf,
        "PAYE": r.paye,
        "Total Deductions": r.totaldeductions,
        "Net Pay": r.netpay,
        "WCF": r.wcf
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Payroll");

      // Generate Base64 Excel
      const base64 = XLSX.write(wb, {
        bookType: "xlsx",
        type: "base64"
      });

      // Build Data URL (SAFE!)
      const dataURL =
        "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
        base64;

      // Create filename
      const period = SelectPM.selectedOptionValue || "Payroll";
      const filename = `Payroll_${period}.xlsx`;

      // ⬇ DOWNLOAD USING DATA URL (NEVER CORRUPTS)
      await download(dataURL, filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      showAlert("Excel downloaded successfully!", "success");
      return true;

    } catch (e) {
      showAlert("Excel generation failed: " + e.message, "error");
      return false;
    }
  }
};




