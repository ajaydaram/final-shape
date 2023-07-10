require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const path = require('path');
const sgMail = require('@sendgrid/mail');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('survey', async (req, res) => {
  const surveyData = req.body;

  const pdfBuffer = await generatePdf(surveyData);

  const emailData = {
    from: 'calvary@daramajay.com',
    to: 'calvary@daramajay.com',
    subject: 'Hello from Nodemailer',
    text: 'Please find the survey data attached as a PDF',
    attachments: [
      {
        filename: 'survey.pdf',
        content: pdfBuffer.toString('base64'), // Convert the PDF buffer to base64 string
        type: 'application/pdf', // Add the MIME type of the attachment
        disposition: 'attachment', // Specify the attachment disposition
      },
    ],
  };

  try {
    await sgMail.send(emailData);
    console.log('Email sent successfully');
    res.send('Email sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function generatePdf(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlContent = generateHtml(data);

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf();

  await browser.close();

  return pdfBuffer;
}

function generateHtml(data) {
  let html = '<html><body>';
  html += '<h1>Survey Data</h1>';
  html += '<ul>';
  for (const key in data) {
    let value = data[key];
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    html += `<li>${key}: ${value}</li>`;
  }
  html += '</ul>';
  html += '</body></html>';

  return html;
}