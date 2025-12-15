export default {
  // small helper to update progress and status
  updateProgress: async function(percent, status) {
    // persist: false keeps it transient for this session; you can remove third arg if you want persistence
    await storeValue('pdfProgress', percent, { persist: false });
    await storeValue('pdfStatus', status, { persist: false });
  },

  // main flow
  runAll: async function() {
    try {
      // show modal and initialize progress
      await this.updateProgress(0, 'Starting...');
      showModal('PDFProgressModal'); // open the modal

      // Step 1: generate and save PDFs
      await this.updateProgress(5, 'Generating PDFs...');
      await JSObject6.generateAndSavePDFs();
      await this.updateProgress(30, 'PDFs generated');

      // Step 2: get current month
      await this.updateProgress(35, 'Fetching current month...');
      await getcurrentmonth.run();
      await this.updateProgress(45, 'Month loaded');

      // Step 3: get slips pdf
      await this.updateProgress(50, 'Fetching slips PDFs...');
      await getslipspdf.run();
      await this.updateProgress(65, 'Slips fetched');

      // Step 4: get staff contacts
      await this.updateProgress(70, 'Loading staff contacts...');
      await getstaffcontacts.run();
      await this.updateProgress(80, 'Contacts loaded');

      // Step 5: send payslips
      await this.updateProgress(85, 'Sending payslips...');
      await JSObject7.sendAllPayslips();
      await this.updateProgress(95, 'Payslips sent');

      // Step 6: delete PDF urls (cleanup)
      await this.updateProgress(97, 'Cleaning up...');
      await deletePDFurl.run();

      // finished
      await this.updateProgress(100, 'Complete');
      // small pause so user sees 100% (optional)
      await new Promise(res => setTimeout(res, 600));

      closeModal('PDFProgressModal');
      // clear transient store values (optional)
      await storeValue('pdfProgress', null, { persist: false });
      await storeValue('pdfStatus', null, { persist: false });

      showAlert('All done!', 'success');
    } catch (err) {
      // show error and hide modal
      await this.updateProgress(0, 'Error');
      closeModal('PDFProgressModal');
      showAlert(('Error: ' + (err.message || err)).slice(0,250), 'error');
      // rethrow if you want caller to see the error
      throw err;
    }
  }
}
