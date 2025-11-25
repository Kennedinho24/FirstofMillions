export default {
  async returnPayroll() {
    try {
     
      // Now run insert query
      await updatestatus2.run();
			await emailnotif_r.run();
			await getcurrentmonth.run();

      showAlert(
        "Payroll returned successfully.",
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