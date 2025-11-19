export default {
  async runPayroll() {
    try {
      // Trigger cleanRows even if it's not async
      JSObject2.cleanRows();

      // Now run insert query
      await Insert_public_monthlypayraw1.run();

      showAlert(
        "NEXT Month payroll has been created successfully, please review, correct, and submit for approval.",
        "success"
      );
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("unique")) {
        showAlert("This payroll has already been added.", "warning");
      } else {
        showAlert("Error creating payroll: " + err.message, "error");
      }
    }
  }
};



