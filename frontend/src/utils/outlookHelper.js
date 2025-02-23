export const createOutlookEmail = async (to, subject, body) => {
  if (window.Office && window.Office.context && window.Office.context.mailbox) {
    try {
      window.Office.context.mailbox.displayNewMessageForm({
        toRecipients: [to],
        subject: subject,
        body: body
      });
      return true;
    } catch (e) {
      console.log('Failed to create Outlook email via Office.js:', e);
      return false;
    }
  }
  
  // If Office.js is not available, try using outlook: protocol
  try {
    const outlookUrl = `outlook:/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = outlookUrl;
    return true;
  } catch (e) {
    console.log('Failed to create Outlook email via protocol:', e);
    return false;
  }
};
