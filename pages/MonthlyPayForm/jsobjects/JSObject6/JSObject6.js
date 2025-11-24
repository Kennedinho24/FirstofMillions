export default {
  async handledeletion() {
    try {
     
      // Now run insert query
      await Deletestaff.run();
			
			await getcurrentmonth.run();

      showAlert(
        "Payroll has been deleted successfully.",
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