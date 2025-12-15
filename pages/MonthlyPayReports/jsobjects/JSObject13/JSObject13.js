export default {
  async generatePDFWithGen2PDF() {
    try {
      const htmlContent = "<h1>Test PDF (Gen2PDF)</h1><p>Hardcoded content.</p>";
      const apiKey = "YOUR_GEN2PDF_API_KEY";

      const response = await fetch("https://api.gen2pdf.com/v1/html2pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          html: htmlContent,
          file_name: "test_gen2pdf.pdf"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      console.log("PDF URL:", pdfUrl);
      return pdfUrl;

    } catch (error) {
      console.error("Error generating PDF with Gen2PDF:", error);
      return null;
    }
  }
}

