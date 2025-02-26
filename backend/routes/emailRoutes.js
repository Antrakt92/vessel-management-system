const express = require('express');
const router = express.Router();
const Vessel = require('../models/Vessel');
const emailService = require('../utils/emailService');

/**
 * @route POST /api/email/send-service-notification
 * @desc Send a service notification email
 * @access Private
 */
router.post('/send-service-notification', async (req, res) => {
  try {
    const { vesselId, serviceType } = req.body;
    
    if (!vesselId || !serviceType) {
      return res.status(400).json({ message: 'Vessel ID and service type are required' });
    }
    
    // Get vessel data
    const vessel = await Vessel.findById(vesselId);
    if (!vessel) {
      return res.status(404).json({ message: 'Vessel not found' });
    }
    
    let emailResult;
    
    // Send appropriate email based on service type
    switch (serviceType) {
      case 'linesmen':
        emailResult = await emailService.sendLinesmenRequestEmail(vessel);
        break;
      case 'towage':
        emailResult = await emailService.sendTugRequestEmail(vessel);
        break;
      case 'terminal':
        emailResult = await emailService.sendTerminalRequestEmail(vessel);
        break;
      case 'freshWater':
        emailResult = await emailService.sendFreshWaterRequestEmail(vessel);
        break;
      default:
        return res.status(400).json({ message: 'Invalid service type' });
    }
    
    return res.status(200).json({ 
      message: `${serviceType} notification email sent successfully`,
      emailId: emailResult.messageId
    });
  } catch (error) {
    console.error('Error sending service notification email:', error);
    return res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

/**
 * @route POST /api/email/send-custom-notification
 * @desc Send a custom notification email
 * @access Private
 */
router.post('/send-custom-notification', async (req, res) => {
  try {
    const { 
      vesselId, 
      emailType,
      toAddress,
      ccAddress,
      greeting,
      serviceText,
      requestText
    } = req.body;
    
    if (!vesselId || !emailType || !toAddress) {
      return res.status(400).json({ 
        message: 'Vessel ID, email type, and recipient address are required' 
      });
    }
    
    // Get vessel data
    const vessel = await Vessel.findById(vesselId);
    if (!vessel) {
      return res.status(404).json({ message: 'Vessel not found' });
    }
    
    // Send custom email
    const emailResult = await emailService.sendServiceEmail(
      vessel,
      emailType,
      toAddress,
      ccAddress || '',
      greeting || 'Hello,',
      serviceText || 'Please see the vessel details below:',
      requestText || 'Please confirm receipt of this information.'
    );
    
    return res.status(200).json({ 
      message: 'Custom notification email sent successfully',
      emailId: emailResult.messageId
    });
  } catch (error) {
    console.error('Error sending custom notification email:', error);
    return res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

module.exports = router;
