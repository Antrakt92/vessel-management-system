const router = require('express').Router();
const nodemailer = require('nodemailer');
const config = require('../../config/default.json');
const Vessel = require('../models/Vessel');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth,
  tls: config.email.tls
});

const emailTemplates = {
  'Linesmen': {
    subject: (vessel) => `Linesmen Request for ${vessel.name}`,
    body: (vessel) => `Vessel Name: ${vessel.name}\nETA: ${vessel.eta}\nServices Required: ${JSON.stringify(vessel.services)}`
  },
  'Tug': {
    subject: (vessel) => `Tug Assistance Request for ${vessel.name}`,
    body: (vessel) => `Vessel Details:\nName: ${vessel.name}\nETB: ${vessel.etb}\nETD: ${vessel.etd}`
  }
};

router.post('/send', async (req, res) => {
  try {
    const { vesselId, requestType, recipient } = req.body;
    
    const vessel = await Vessel.findById(vesselId);
    if (!vessel) return res.status(404).json({ msg: 'Vessel not found' });

    const template = emailTemplates[requestType];
    if (!template) return res.status(400).json({ msg: 'Invalid request type' });

    const mailOptions = {
      from: config.email.auth.user,
      to: recipient,
      subject: template.subject(vessel),
      text: template.body(vessel)
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Email sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
