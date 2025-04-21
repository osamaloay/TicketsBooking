
const fs = require('fs');
const PDFDocument = require('pdfkit'); 

const createPDF = (booking, qrCode, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();

        // Pipe the PDF into a file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add booking details to the PDF
        doc.fontSize(20).text('Event Ticket', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Booking ID: ${booking._id}`);
        doc.text(`Event: ${booking.event.title}`);
        doc.text(`User: ${booking.user.name}`);
        doc.text(`Number of Tickets: ${booking.numberOfTickets}`);
        doc.text(`Total Price: $${booking.totalPrice}`);
        doc.text(`Status: ${booking.status}`);
        
        // Add QR code to the PDF
        doc.image(qrCode, {
            fit: [150, 150],
            align: 'center',
            valign: 'center'
        });

        // Finalize the PDF
        doc.end();

        writeStream.on('finish', () => {
            resolve();
        });

        writeStream.on('error', (error) => {
            reject(error);
        });
    });
};

module.exports = { createPDF };
