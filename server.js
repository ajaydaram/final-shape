const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const path = require('path');
const mg = require('nodemailer-mailgun-transport');


const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Add this line to parse JSON data in the request body

// Serve static files from the React app
app.use(express.static('public'));

app.post('/survey', async (req, res) => {
    const surveyData = req.body;

    // Generate a PDF from the survey data
    const pdfBuffer = await generatePdf(surveyData);

    // Create a Nodemailer transporter
    const auth = {
        auth: {
            api_key: 'key-59bf2691d6ffe4886f7599fe05e012aa',
            domain: 'sandboxd67c630cd295490680338e44ad69057a.mailgun.org'
        }
    };
    const transporter = nodemailer.createTransport(mg(auth));

    // Set up email data
    let mailOptions = {
        from: 'ajayforchrist777@gmail.com',
        to: 'ajayforchrist777@gmail.com',
        subject: 'Hello from Nodemailer',
        text: 'Please find the survey data attached as a PDF',
        attachments: [
            {
                filename: 'survey.pdf',
                content: pdfBuffer
            }
        ]
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent successfully');
        }
    });
});
//other routes
app.get('*', (req, res) => {
    res.sendFile(path.resolvedirname(__, 'public', 'index.html'));
});

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}/`);
});

async function generatePdf(data) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate HTML content from the survey data
    const htmlContent = generateHtml(data);

    // Set the HTML content and generate PDF
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf();

    await browser.close();

    return pdfBuffer;
}

function generateHtml(data) {
    // Generate the HTML content based on the survey data
    // You can use a templating engine like Handlebars or EJS to generate dynamic HTML
    // Here's a simple example using string concatenation:
    let html = '<html><body>';
    html += '<h1>Survey Data</h1>';
    html += '<ul>';
    for (const key in data) {
        html += `<li>${key}: ${data[key]}</li>`;
    }
    html += '</ul>';
    html += '</body></html>';

    return html;
}