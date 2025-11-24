export default {
  generateOTP: async () => {
    // 1. Generate a random 5-digit number
    const otp = Math.floor(10000 + Math.random() * 90000);

    // 2. Store OTP in an Appsmith store (optional)
    storeValue("vendorOTP", otp);

    // 3. Run update query
    await updateuserOTP.run({
      email: getUsers.data[0].useremail,
      otp: otp
    });
    await getUsers.run();
	
		
		
    // 4. Return it (optional)
    return otp;
  }
};