import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export interface ExportOptions {
  filename: string
  format: "png" | "jpeg" | "pdf"
  quality?: number
}

export const exportElement = async (element: HTMLElement, options: ExportOptions) => {
  const { filename, format, quality = 0.95 } = options

  try {
    // Create canvas from element
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })

    if (format === "pdf") {
      // Export as PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`${filename}.pdf`)
    } else {
      // Export as PNG or JPEG
      const mimeType = format === "png" ? "image/png" : "image/jpeg"
      const dataURL = canvas.toDataURL(mimeType, quality)

      const link = document.createElement("a")
      link.download = `${filename}.${format}`
      link.href = dataURL
      link.click()
    }
  } catch (error) {
    console.error("Export failed:", error)
    throw new Error("Failed to export. Please try again.")
  }
}

export const generateShareToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
