export default {

  // Convert image URL → Base64
  async toBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  },

  // Create PDF and return as a Base64 URL (NO upload)
  async generatePDFurl() {
    try {
      const { jsPDF } = window.jspdf;

      if (!jsPDF) {
        showAlert("jsPDF not loaded!", "error");
        return "";
      }

      // Image URL
      const imageURL = "https://i.postimg.cc/G3zQvKn8/AKF-Logo.jpg";
      const base64Image = await this.toBase64(imageURL);

      // Create PDF
      const doc = new jsPDF("p", "mm", "a4");

      // ===============================
      // INSERT IMAGE WITH PROPER SCALE
      // ===============================

      // choose a balanced size (square: 60x60 mm)
      const imgWidth = 50;
      const imgHeight = 85;

      // position
      const posX = 15;
      const posY = 20;

      doc.addImage(base64Image, "JPEG", posX, posY, imgWidth, imgHeight);

      return doc.output("datauristring");

    } catch (e) {
      showAlert("Error: " + e.message, "error");
      return "";
    }
  }
};
