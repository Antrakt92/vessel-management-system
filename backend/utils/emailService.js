const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const createTransporter = () => {
  // In production, use actual SMTP settings from config
  // For development, we can use a test account or ethereal.email
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Generate email HTML body based on vessel data and service type
 * @param {Object} vessel - The vessel data
 * @param {String} emailType - Type of email (e.g., "Linesmen Request")
 * @param {String} greeting - Greeting text
 * @param {String} serviceText - Service description text
 * @param {String} requestText - Request confirmation text
 * @returns {String} HTML body for the email
 */
const generateEmailBody = (vessel, emailType, greeting, serviceText, requestText) => {
  // Build table rows with vessel information
  let tableRows = `
    <tr><td><strong>Vessel:</strong></td><td>${vessel.name}</td></tr>
    <tr><td><strong>Location:</strong></td><td>${vessel.berth || 'Not specified'}</td></tr>
  `;

  // Add cargo row if available
  if (vessel.cargo) {
    tableRows += `<tr><td><strong>Cargo:</strong></td><td>${vessel.cargo}</td></tr>`;
  }

  // Format dates
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Prepare fresh water text only for Fresh Water Request
  let freshWaterText = '';
  if (emailType === 'Fresh Water Request' && vessel.freshWaterQuantity) {
    freshWaterText = `<p><strong>Estimated FW Required:</strong> ${vessel.freshWaterQuantity} m³</p>`;
  }

  // Build movements section
  const movementsSection = `
    <p><strong>Movements:</strong></p>
    <ul>
      <li><strong>ETA:</strong> ${formatDate(vessel.eta)}</li>
      ${vessel.etb ? `<li><strong>ETB:</strong> ${formatDate(vessel.etb)}</li>` : ''}
      ${vessel.etd ? `<li><strong>ETD:</strong> ${formatDate(vessel.etd)}</li>` : ''}
    </ul>
  `;

  // Build the complete HTML body
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>${greeting}</p>
      <p>${serviceText}</p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        ${tableRows}
      </table>
      ${freshWaterText}
      ${movementsSection}
      <p>${requestText}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This is an automated message from the Vessel Management System.
      </p>
    </div>
  `;
};

/**
 * Send an email notification for a vessel service
 * @param {Object} vessel - The vessel data
 * @param {String} emailType - Type of email (e.g., "Linesmen Request")
 * @param {String} toAddress - Recipient email address
 * @param {String} ccAddress - CC email address
 * @param {String} greeting - Greeting text
 * @param {String} serviceText - Service description text
 * @param {String} requestText - Request confirmation text
 * @returns {Promise} Promise resolving to the send result
 */
const sendServiceEmail = async (
  vessel,
  emailType,
  toAddress,
  ccAddress,
  greeting,
  serviceText,
  requestText
) => {
  try {
    const transporter = createTransporter();
    
    // Create email subject
    const timeLabel = 'ETA';
    const emailSubject = `${emailType} - ${vessel.name} at ${vessel.berth || 'port'} - ${timeLabel}: ${
      new Date(vessel.eta).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }`;

    // Generate email HTML body
    const htmlBody = generateEmailBody(
      vessel,
      emailType,
      greeting,
      serviceText,
      requestText
    );

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Vessel Management System" <vms@example.com>',
      to: toAddress,
      cc: ccAddress,
      subject: emailSubject,
      html: htmlBody,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Predefined email templates
const sendLinesmenRequestEmail = (vessel) => {
  return sendServiceEmail(
    vessel,
    'Linesmen Request',
    process.env.LINESMEN_EMAIL || 'jaysutton@yahoo.ie',
    process.env.AGENCY_EMAIL || 'agency.dublin@gac.com',
    'Hi Jay,',
    'We kindly request your linesmen services for the following vessel:',
    'Please confirm if you can provide linesmen services at the specified times.'
  );
};

const sendTugRequestEmail = (vessel) => {
  return sendServiceEmail(
    vessel,
    'Tug Request',
    process.env.TUG_EMAIL || 'master.gianotug@gmail.com',
    process.env.AGENCY_EMAIL || 'agency.dublin@gac.com',
    'Hi,',
    'We kindly request your tug services for the following vessel:',
    'Please confirm if you can provide tug services at the specified times.'
  );
};

const sendTerminalRequestEmail = (vessel) => {
  return sendServiceEmail(
    vessel,
    'Terminal Readiness Confirmation',
    process.env.TERMINAL_EMAIL || 'terminal@example.com',
    process.env.AGENCY_EMAIL || 'agency.dublin@gac.com',
    'Dear Terminal Operators,',
    'We kindly request confirmation regarding terminal readiness for the following vessel:',
    'Please confirm if the terminal is prepared to receive the vessel upon arrival as scheduled.'
  );
};

const sendFreshWaterRequestEmail = (vessel) => {
  return sendServiceEmail(
    vessel,
    'Fresh Water Request',
    process.env.WATER_EMAIL || 'roy.walsh@dublincity.ie',
    process.env.AGENCY_EMAIL || 'agency.dublin@gac.com',
    'Dear Roy,',
    'Could you please arrange fresh water supply for the following vessel:',
    'Please confirm availability and proposed timing for the fresh water supply.'
  );
};

module.exports = {
  sendLinesmenRequestEmail,
  sendTugRequestEmail,
  sendTerminalRequestEmail,
  sendFreshWaterRequestEmail,
  sendServiceEmail
};
