export default {
  async sendAllPayslips() {
    try {
      const pdfRows = getslipspdf.data;      // staffid, pdfurl
      const contacts = getstaffcontacts.data; // staffid, emailaddress

      if (!pdfRows || pdfRows.length === 0) {
        showAlert("No PDF records found!", "warning");
        return;
      }

      let sentCount = 0;
      let skippedCount = 0;

      for (let row of pdfRows) {
        const staffid = row.staffid;
        const pdfurl = row.pdfurl;
				const staffname = row.staffdName;
				const month = row.payrollperiod;
				
        // FIND EMAIL FOR THIS STAFF
        const contact = contacts.find(c => c.staffid === staffid);
        if (!contact || !contact.emailaddress) {
          skippedCount++;
          continue; // no email → skip
        }

        const email = contact.emailaddress;

        // --- Convert data URL to File-like object ---
        const pdfBase64 = pdfurl.replace("data:application/pdf;base64,", "");

        // ---- SEND EMAIL through your SMTP API ----
        await sendPayslipEmail.run({
          to: email,
          subject: `Your ${month} Salary Slip`,
          body: `Dear ${staffname},\n\nAttached is your monthly salary slip.\n\nRegards,\nAKFT HR Office`,
          attachmentName: `payslip_${staffid}.pdf`,
          attachment: pdfBase64
        });

        sentCount++;
      }

      showAlert(`Emails sent: ${sentCount}, Skipped (no email): ${skippedCount}`, "success");

    } catch (e) {
      showAlert("Error sending emails: " + e.message, "error");
    }
  }
};
