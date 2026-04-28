import { jsPDF } from "jspdf";
import QRCode from "qrcode";

/**
 * Generates a professional PDF certificate for a verified product
 * @param {Object} productData - Data retrieved from blockchain
 */
export const generateCertificate = async (productData) => {
    const {
        productId,
        productName,
        warrantyStart,
        warrantyEnd,
        isValid,
        daysRemaining,
        ownerName,
        owner,
        ownerContact,
        ownerEmail,
        serialNumber,
        specifications,
        history,
        contractAddress,
        network = "Ganache Blockchain"
    } = productData;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const col2X = margin + 60;
    let yPos = 25;

    // --- 🔧 HELPER FUNCTIONS ---
    const drawBorder = () => {
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.getHeight() - 10);
    };

    drawBorder(); // Draw border on first page

    // --- 🖋 HEADER SECTION ---
    doc.setTextColor(0, 51, 102); // Navy Blue
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("WARRANTYCHAIN VERIFICATION CERTIFICATE", margin, yPos);
    
    yPos += 5;
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(1.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 15;

    // --- 🔧 HELPER FUNCTIONS ---
    const checkPageOverflow = (neededHeight) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (yPos + neededHeight > pageHeight - 20) { // 20mm bottom margin
            doc.addPage();
            drawBorder(); // Add border to new page
            yPos = 25; // Reset yPos for new page
            return true;
        }
        return false;
    };

    const addSectionHeader = (title) => {
        checkPageOverflow(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text(title.toUpperCase(), margin, yPos);
        yPos += 2;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
    };

    const addDataRow = (label, value, isMonospace = false) => {
        if (!value || value === "0x0000000000000000000000000000000000000000") return;
        
        checkPageOverflow(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`${label}:`, margin, yPos);
        
        doc.setFont(isMonospace ? "courier" : "helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(String(value), col2X, yPos);
        yPos += 8;
    };

    // --- 1. PRODUCT DETAILS ---
    addSectionHeader("PRODUCT DETAILS");
    addDataRow("Product Name", productName);
    addDataRow("Product ID", productId);
    addDataRow("Warranty Start", warrantyStart ? new Date(warrantyStart * 1000).toLocaleDateString() : null);
    addDataRow("Warranty End", warrantyEnd ? new Date(warrantyEnd * 1000).toLocaleDateString() : null);

    yPos += 5;

    // --- 1b. PRODUCT SPECIFICATIONS ---
    let parsedSpecs = null;
    let category = null;
    try {
        if (specifications) {
            const data = JSON.parse(specifications);
            if (data.specs) parsedSpecs = data.specs;
            if (data.category) category = data.category;
        }
    } catch (e) {}

    const hasSpecs = (parsedSpecs && Object.keys(parsedSpecs).length > 0) || (specifications && specifications.trim());
    
    if (hasSpecs || serialNumber) {
        addSectionHeader("PRODUCT SPECIFICATIONS");
        if (serialNumber) addDataRow("Serial Number", serialNumber);
        if (category && category !== "Other") addDataRow("Category", category);
        
        if (parsedSpecs) {
            Object.entries(parsedSpecs).forEach(([key, value]) => {
                if (value) addDataRow(key, value);
            });
        } else if (specifications && specifications.trim()) {
            // Old string format fallback
            const pairs = specifications.split(/[,\n]/).map(p => p.trim()).filter(p => p.includes(":"));
            
            if (pairs.length > 0) {
                pairs.forEach(pair => {
                    const [key, ...valParts] = pair.split(":");
                    const value = valParts.join(":").trim();
                    if (key && value && key.trim().toLowerCase() !== 'serial number') {
                        addDataRow(key.trim(), value);
                    }
                });
            } else {
                addDataRow("Technical Detail", specifications);
            }
        }
        yPos += 5;
    }

    // --- 2. OWNER INFORMATION ---
    addSectionHeader("OWNER INFORMATION");
    addDataRow("Owner Name", ownerName);
    addDataRow("Owner Address", owner, true);
    addDataRow("Owner Contact", ownerContact);
    addDataRow("Owner Email", ownerEmail);

    yPos += 5;

    // --- 2b. OWNERSHIP HISTORY ---
    if (history && history.length > 1) {
        addSectionHeader("OWNERSHIP HISTORY");
        
        const firstOwner = history[0];
        const currentOwner = history[history.length - 1];

        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text("FIRST OWNER", margin, yPos);
        yPos += 6;
        addDataRow("Name", firstOwner.ownerName);
        addDataRow("Wallet Address", firstOwner.owner, true);
        addDataRow("Ownership Start", new Date((warrantyStart && Number(warrantyStart) > 0 ? Number(warrantyStart) : firstOwner.transferDate) * 1000).toLocaleDateString());
        
        yPos += 4;

        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text("CURRENT OWNER", margin, yPos);
        yPos += 6;
        addDataRow("Name", currentOwner.ownerName);
        addDataRow("Wallet Address", currentOwner.owner, true);
        addDataRow("Ownership Transfer", new Date(currentOwner.transferDate * 1000).toLocaleDateString());
        
        yPos += 5;
    }

    // --- 2c. MAINTENANCE HISTORY ---
    if (productData.services && productData.services.length > 0) {
        addSectionHeader("MAINTENANCE HISTORY");
        
        productData.services.forEach((service, index) => {
            checkPageOverflow(25);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text(`RECORD #${index + 1}`, margin, yPos);
            yPos += 6;
            
            addDataRow("Service", service.description);
            addDataRow("Technician", service.technicianName);
            addDataRow("Location", service.location);
            addDataRow("Date", new Date(service.serviceDate * 1000).toLocaleDateString());
            
            yPos += 4;
        });
        
        yPos += 5;
    }

    // --- 3. WARRANTY STATUS ---
    addSectionHeader("WARRANTY STATUS");
    const statusStartY = yPos;
    
    checkPageOverflow(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74); // Success Green label
    doc.text("Status:", margin, yPos);
    
    doc.setFont("helvetica", "bold");
    const isExtended = productData.services && productData.services.some(s => s.description.includes("Extended"));
    doc.text(isValid ? (isExtended ? "VALID (EXTENDED)" : "VALID") : "EXPIRED", col2X, yPos);
    
    yPos += 8;
    checkPageOverflow(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Days Remaining:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(String(daysRemaining), col2X, yPos);

    // QR Code for status section (Right-aligned)
    try {
        const qrSize = 40;
        const verificationLink = `${window.location.origin}/verify/${productId}`;
        const qrBase64 = await QRCode.toDataURL(verificationLink);
        // Ensure QR code is on the same page as the section start
        doc.addImage(qrBase64, "PNG", pageWidth - margin - qrSize, statusStartY - 10, qrSize, qrSize);
    } catch (err) {
        console.error("QR Code failed", err);
    }

    yPos += 20;

    // --- 4. BLOCKCHAIN RECORD ---
    addSectionHeader("BLOCKCHAIN RECORD");
    addDataRow("Contract Address", contractAddress, true);
    addDataRow("Network", network);
    addDataRow("Verification Time", new Date().toLocaleString());

    // --- 5. FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    const footerText = "This certificate is cryptographically secured and immutable.";
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: "center" });

    // --- 🚀 SAVE ---
    doc.save(`WarrantyChain_Verification_${productId || "Data"}.pdf`);
};
