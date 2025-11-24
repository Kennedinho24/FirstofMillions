export default {
  async generateExcelDownload() {
    try {
      if (!window.XLSX) {
        showAlert("XLSX library not loaded!", "error");
        return false;
      }

      let rows = TableCurrentM.tableData || [];
      if (!rows.length) {
        showAlert("No data in table!", "warning");
        return false;
      }

      // ----------------------------
      // SORT BY CURRENCY — TZS FIRST
      // ----------------------------
      rows = rows.sort((a, b) => {
        const A = a.currencycode || "";
        const B = b.currencycode || "";
        if (A === "TZS" && B !== "TZS") return -1;
        if (B === "TZS" && A !== "TZS") return 1;
        return A.localeCompare(B);
      });

      const num = (v) => (v ? Number(v) : 0);

      // --------------------------------
      // BUILD DATA WITH SUBTOTALS
      // --------------------------------
      const excelRows = [];
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
            // PUSH SUBTOTAL ROW
            excelRows.push({
              "Payroll Period": "",
              "Staff Name": "SUBTOTAL",
              "Currency": currentCurrency,
              "Basic": subtotal.basicsalary,
              "Benefits": subtotal.otherbenefits,
              "Advance": subtotal.salaryadvance,
              "Loan": subtotal.loandeduction,
              "Social": subtotal.socialdeduction,
              "HELSB": subtotal.helsb,
              "Recovery": subtotal.advancerecovery,
              "Other Deductions": subtotal.otherdeductions,
              "NSSF": subtotal.nssf,
              "PAYE": subtotal.paye,
              "Total Deductions": subtotal.totaldeductions,
              "Net Pay": subtotal.netpay
            });
          }

          currentCurrency = r.currencycode;
          subtotal = startSubtotal();
        }

        // UPDATE SUBTOTAL ACCUMULATION
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

        excelRows.push({
          "Payroll Period": r.payrollperiod,
          "Staff Name": r.staffdName,
          "Currency": r.currencycode,
          "Basic": num(r.basicsalary),
          "Benefits": num(r.otherbenefits),
          "Advance": num(r.salaryadvance),
          "Loan": num(r.loandeduction),
          "Social": num(r.socialdeduction),
          "HELSB": num(r.helsb),
          "Recovery": num(r.advancerecovery),
          "Other Deductions": num(r.otherdeductions),
          "NSSF": num(r.nssf),
          "PAYE": num(r.paye),
          "Total Deductions": num(r.totaldeductions),
          "Net Pay": num(r.netpay)
        });
      });

      // PUSH FINAL SUBTOTAL
      if (currentCurrency !== "") {
        excelRows.push({
          "Payroll Period": "",
          "Staff Name": "SUBTOTAL",
          "Currency": currentCurrency,
          "Basic": subtotal.basicsalary,
          "Benefits": subtotal.otherbenefits,
          "Advance": subtotal.salaryadvance,
          "Loan": subtotal.loandeduction,
          "Social": subtotal.socialdeduction,
          "HELSB": subtotal.helsb,
          "Recovery": subtotal.advancerecovery,
          "Other Deductions": subtotal.otherdeductions,
          "NSSF": subtotal.nssf,
          "PAYE": subtotal.paye,
          "Total Deductions": subtotal.totaldeductions,
          "Net Pay": subtotal.netpay
        });
      }

      // --------------------------------
      // CREATE WORKBOOK + SHEET
      // --------------------------------
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelRows, { origin: "A3" });

      // --------------------------------
      // ADD BEAUTIFUL HEADER (A1 → O1)
      // --------------------------------
      const heading = "MONTHLY PAYROLL REPORT";
      XLSX.utils.sheet_add_aoa(ws, [[heading]], { origin: "A1" });

      ws["!merges"] = ws["!merges"] || [];
      ws["!merges"].push({
        s: { r: 0, c: 0 },  // start cell
        e: { r: 0, c: 14 }  // end cell (column O)
      });

      // Style heading
      ws["A1"].s = {
        font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0B4F3F" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // --------------------------------
      // Style column headers in row 3
      // --------------------------------
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 2, c: C })];
        if (cell) {
          cell.s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "15803D" } },
            alignment: { horizontal: "center" }
          };
        }
      }

      // --------------------------------
      // Subtotal row styling
      // --------------------------------
      excelRows.forEach((r, i) => {
        if (r["Staff Name"] === "SUBTOTAL") {
          const rowIndex = i + 3; // header offset (0 → heading, 2 → titles)
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = ws[XLSX.utils.encode_cell({ r: rowIndex, c: C })];
            if (cell) {
              cell.s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "DFF6DD" } } // light green
              };
            }
          }
        }
      });

      XLSX.utils.book_append_sheet(wb, ws, "Payroll");

      // EXPORT EXCEL
      const base64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });

      const dataURL =
        "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
        base64;

      const period = SelectPM.selectedOptionValue || "Payroll";
      const filename = `Payroll_${period}.xlsx`;

      await download(
        dataURL,
        filename,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      showAlert("Excel downloaded successfully!", "success");
      return true;

    } catch (e) {
      showAlert("Excel generation failed: " + e.message, "error");
      return false;
    }
  }
};

