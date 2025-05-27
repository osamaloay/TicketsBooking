const fs = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const path = require('path');

const createPDF = async (booking, qrCode, userPhotoUrl, filePath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            // Pipe the PDF into a file
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Add header with logo or title
            doc.fontSize(24).text('Event Ticket', { align: 'center' });
            doc.moveDown();

            // Add user photo if available
            if (userPhotoUrl) {
                try {
                    // Download the image
                    const response = await axios.get(userPhotoUrl, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    
                    // Add the image to the PDF
                    doc.image(imageBuffer, {
                        fit: [100, 100],
                        align: 'center'
                    });
                    doc.moveDown();
                } catch (error) {
                    console.error('Error adding user photo to PDF:', error);
                    // Continue without the photo if there's an error
                }
            }

            // Add booking details
            doc.fontSize(16).text('Booking Details', { underline: true });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Booking ID: ${booking._id}`);
            doc.text(`Event: ${booking.event.title}`);
            doc.text(`Date: ${new Date(booking.event.date).toLocaleDateString()}`);
            doc.text(`Time: ${booking.event.time || 'TBA'}`);
            doc.text(`User: ${booking.user.name}`);
            doc.text(`Email: ${booking.user.email}`);
            doc.text(`Number of Tickets: ${booking.numberOfTickets}`);
            doc.text(`Total Price: $${booking.totalPrice}`);
            doc.text(`Status: ${booking.status}`);
            doc.moveDown();

            // Add event location
            doc.fontSize(16).text('Event Location', { underline: true });
            doc.moveDown();
            doc.fontSize(12);
            if (booking.event.location?.address) {
                doc.text(`Address: ${booking.event.location.address}`);
            }
            if (booking.event.location?.coordinates) {
                doc.text(`Coordinates: ${booking.event.location.coordinates.lat}, ${booking.event.location.coordinates.lng}`);
            }
            doc.moveDown();

            // Add QR code
            doc.fontSize(16).text('Entry QR Code', { underline: true });
            doc.moveDown();
            doc.image(qrCode, {
                fit: [150, 150],
                align: 'center'
            });

            // Add footer
            doc.moveDown(2);
            doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });
            doc.text('Please present this ticket at the event entrance.', { align: 'center' });

            // Finalize the PDF
            doc.end();

            writeStream.on('finish', () => {
                resolve();
            });

            writeStream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = createPDF;
