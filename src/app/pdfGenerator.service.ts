import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import * as QRCode from 'qrcode';
import { BaseUrlService } from './baseUrl.service';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor(
    private baseUrlService: BaseUrlService,
  ) { }

  public generateDailySchedule(scheduleData: any[]): void {
    // 1. Initialize jsPDF: Landscape (Letter), Narrow Margins
    const doc = new jsPDF({
      orientation: 'l', // Landscape
      unit: 'mm',
      format: 'letter' 
    });

    const pageHeight = 215.9;
    const pageWidth = 279.4;
    const margin = 5;
    const contentWidth = pageWidth - (margin * 2);

    let yOffset = margin + 5; 

    // --- 2. Title and Date Header ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('J-Bar Poultry Processing, LLC Daily Schedule Worksheet', pageWidth / 2, yOffset, { align: 'center' });
    
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${currentDate}`, pageWidth - margin, yOffset, { align: 'right' });
    yOffset += 10; 

    doc.line(margin, yOffset, pageWidth - margin, yOffset); 
    yOffset += 5;

    // --- 3. The 10-Column Table ---

    // Define the 10 column headers
    const rawHeaders = [
      'Time In',
      'Owner Name, Phone and Address',
      'Withdrawal Period and Organic', // This column will hold the custom format
      'Lot #',
      'Species',
      'Customer Count',
      'Special Instructions',
      'USDA Ante-Mortem Time',
      'FSIS Initial',
      'Final Count'
    ];
    
    // Map your application data to the 10 columns
    const tableBody = scheduleData.map(lot => {
        
        // 🔑 CUSTOM FORMATTING LOGIC FOR COLUMN 3:
        const withdrawalText = 
            `Withdrawal Met:\n` +
            `Yes [${lot.withdrawalMet ? 'X' : ' '}]  ` + // Show X if met, space otherwise
            `No [${!lot.withdrawalMet ? 'X' : ' '}]\n`;   // Show X if NOT met
            
        const organicText = 
            `Organic: [${lot.isOrganic ? 'X' : ' '}]`;

        const columnThreeContent = withdrawalText + organicText;
        // -----------------------------------------------------

        return [
            lot.timeIn,
            `${lot.customer.name || ''}\n${lot.customer.phone || ''}\n${lot.customer.address || ''}`,
            columnThreeContent, // <-- Use the custom formatted string
            lot.lotNumber,
            lot.species,
            lot.customerCount,
            lot.specialInstructions,
            lot.anteMortemTime || '',
            lot.fsisInitial || '',
            lot.finalCount
        ];
    });
    
    // Pad to 8 rows
    const requiredRows = 8;
    while (tableBody.length < requiredRows) {
        tableBody.push(Array(rawHeaders.length).fill('')); 
    }
    
    // Define NEW column widths (Total width: 269.4mm)
    const colWidths = [
      15,   // 1. Time In (15)
      48,   // 2. Owner Name, Phone, Address (Reduced from 55 to 48)
      35,   // 3. Withdrawal/Organic (KEPT at 35 to fit checkboxes)
      15,   // 4. Lot # (Reduced from 20 to 15)
      18,   // 5. Species (Reduced from 20 to 18)
      18,   // 6. Customer Count (18)
      62,   // 7. Special Instructions (Reduced from 45 to 40)
      25,   // 8. USDA Ante-Mortem Time (25)
      15,   // 9. FSIS Initial (Reduced from 18 to 15)
      18    // 10. Final Count (Increased from 28 to 40 for remaining space)
    ];

    // Total width calculation: 15+48+35+15+18+18+40+25+15+40 = 269
    // This fits within the 269.4mm content width.

    // Recalculate total width to ensure layout integrity
    const calculatedTotalWidth = colWidths.reduce((sum, width) => sum + width, 0);
    // console.log("Total Table Width:", calculatedTotalWidth); // Should be ~269.4

    // Define the type for the accumulator (acc) for columnStyles
    type ColumnStyles = { [key: number]: any }; 
    
    autoTable(doc, {
      startY: yOffset,
      head: [rawHeaders],
      body: tableBody.slice(0, requiredRows), 
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      theme: 'grid',
      styles: { 
        fontSize: 7, 
        cellPadding: 1.5,
        valign: 'middle',
        // 🔑 Left align content in the checkbox column for better reading
        halign: 'center', 
        minCellHeight: ((pageHeight - yOffset - margin - 5) / requiredRows) - 0.5 
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        minCellHeight: 8 
      },
      columnStyles: {
        // Apply custom left alignment for the checkbox column (index 2)
        2: { halign: 'left' },
        ...colWidths.reduce((acc: ColumnStyles, width, index) => {
            acc[index] = { cellWidth: width };
            return acc;
        }, {} as ColumnStyles)
      }
    });

    // --- 4. Final Save ---
    doc.save(`Daily_Schedule_${new Date().toISOString().substring(0, 10)}.pdf`);
  }

  public async generateLotLabelsPdf(lotsToPrint: any[]): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait', 
      unit: 'mm',
      format: 'letter'
    });
    
    const INCH_TO_MM = 25.4;
    const labelWidth = 4 * INCH_TO_MM;   // 101.6 mm
    const labelHeight = 5 * INCH_TO_MM;  // 127.0 mm
    
    const pageW = doc.internal.pageSize.getWidth();
    const MIN_MARGIN = 5; 

    const startMarginX = (pageW - (labelWidth * 2)) / 2;
    const startMarginY = MIN_MARGIN; 
    
    const qrSizeMM = 35; 
    
    let currentX = startMarginX;
    let currentY = startMarginY;
    let labelsOnPage = 0;
    
    for (const lot of lotsToPrint) {
      if (labelsOnPage > 0 && labelsOnPage % 4 === 0) {
        doc.addPage();
        currentX = startMarginX;
        currentY = startMarginY;
        labelsOnPage = 0;
      }
      
      const lotNumber = lot.lotNumber;
      // Assuming baseUrlService is correctly injected and used
      const absoluteUrl = this.baseUrlService.getBaseUrl() + '/landing/lots/lot-details/' + lotNumber; 
      
      // --- A. Generate QR Code Image Data URL ---
      const qrDataURL = await QRCode.toDataURL(absoluteUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: qrSizeMM * 4
      });
      
      // --- B. Draw Label Content (Stacked Layout) ---
      
      // Label Border (for cutting guide) - Must be drawn first
      doc.setDrawColor(150); 
      doc.rect(currentX, currentY, labelWidth, labelHeight); 
        
      // 🔑 FIX: Start content (elementY) 12mm down from the currentY position.
      // This ensures the 22pt font baseline is well below the top label border.
      let elementY = currentY + 12; 
      
      // 1. LOT NUMBER (Top of the label, Centered)
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(`LOT #: ${lotNumber}`, currentX + (labelWidth / 2), elementY, { align: 'center' }); 
      elementY += 10; // Space for the QR code below
      
      // 2. QR CODE (Below Lot #, Centered)
      const qrStartX = currentX + (labelWidth / 2) - (qrSizeMM / 2);
      doc.addImage(qrDataURL, 'PNG', qrStartX, elementY, qrSizeMM, qrSizeMM);
      elementY += qrSizeMM + 10; // Move Y down past the QR code plus 10mm buffer
      
      // 3. OTHER DETAILS (Below QR Code)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // Customer Info
      doc.text(`Owner: ${lot.customer.name || 'N/A'}`, currentX + 5, elementY);
      elementY += 8;

      // Species Info
      doc.text(`Species: ${lot.species || 'N/A'}`, currentX + 5, elementY);
      elementY += 8;

      // Process Date
      const procDate = new Date(lot.processDate).toLocaleDateString('en-US');
      doc.text(`Proc. Date: ${procDate}`, currentX + 5, elementY);

      // --- C. Update Position for Next Label ---
      labelsOnPage++;
      
      if (labelsOnPage % 2 === 0) {
        currentX = startMarginX;
        currentY += labelHeight;
      } else {
        currentX += labelWidth;
      }
    }

    doc.save(`Lot_Labels_4x5_Narrow_Margin_${new Date().toISOString().substring(0, 10)}.pdf`);
  }
}