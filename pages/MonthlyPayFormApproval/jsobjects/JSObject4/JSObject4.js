export default {
  async submitPayroll() {
    try {
     
      // Now run insert query
      await updatestatus.run();
			await JSObject6.generatePDF();
			await emailnotif_a.run();
			await getcurrentmonth.run();

      showAlert(
        "Payroll reviewed successfully.",
        "success"
      );
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("unique")) {
        showAlert(".", "warning");
      } else {
        showAlert("Error creating payroll: " + err.message, "error");
      }
    }
  }
};