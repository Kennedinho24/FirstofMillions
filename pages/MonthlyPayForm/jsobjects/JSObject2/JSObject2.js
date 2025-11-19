export default {
   cleanRows() {
		const month = SelectCurrentM.selectedOptionValue; // dynamic value from dropdown
    return inputMonthlyPaytbl.selectedRows.map(r => ({
      staffid: r.staffid,
      staffdName: r.staffdName,
      basicsalary: Number(String(r.basicsalary).replace(/,/g, '')) || 0,
      otherbenefits: Number(String(r.otherbenefits).replace(/,/g, '')) || 0,
      salaryadvance: Number(String(r.salaryadvance).replace(/,/g, '')) || 0,
      loandeduction: Number(String(r.loandeduction).replace(/,/g, '')) || 0,
      socialdeduction: Number(String(r.socialdeduction).replace(/,/g, '')) || 0,
      helsb: Number(String(r.helsb).replace(/,/g, '')) || 0,
      advancerecovery: Number(String(r.advancerecovery).replace(/,/g, '')) || 0,
      otherdeductions: Number(String(r.otherdeductions).replace(/,/g, '')) || 0,
      monthunique: r.staffid + month,
			paye_flag: r.paye_flag,
			nssf_flag: r.nssf_flag
			
    }));
  }
}
