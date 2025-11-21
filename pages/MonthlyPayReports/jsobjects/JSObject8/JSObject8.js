export default {
  runAll: async () => {
    await JSObject6.generateAndSavePDFs();
    await getcurrentmonth.run();
    await getslipspdf.run();
    await getstaffcontacts.run();
    await JSObject7.sendAllPayslips();
  }
}
