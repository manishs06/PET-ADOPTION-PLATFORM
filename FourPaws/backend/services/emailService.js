const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @returns {Promise<Object>} - Email sending result
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact form email
 * @param {Object} formData - Contact form data
 * @returns {Promise<Object>} - Email sending result
 */
const sendContactEmail = async (formData) => {
  const { user_name, user_email, subject, message } = formData;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
        <p><strong>Name:</strong> ${user_name}</p>
        <p><strong>Email:</strong> ${user_email}</p>
        <p><strong>Subject:</strong> ${subject || 'No subject provided'}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #4f46e5;">${message}</p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        This message was sent from the FourPaws contact form.
      </p>
    </div>
  `;

  const text = `
    New Contact Form Submission
    
    Name: ${user_name}
    Email: ${user_email}
    Subject: ${subject || 'No subject provided'}
    
    Message:
    ${message}
  `;

  return await sendEmail({
    to: process.env.EMAIL_USER, // Send to admin email
    subject: `FourPaws Contact Form: ${subject || 'New Message'}`,
    text,
    html,
  });
};

/**
 * Send adoption request notification to pet owner
 * @param {Object} requestData - Adoption request data
 * @returns {Promise<Object>} - Email sending result
 */
const sendAdoptionRequestNotification = async (requestData) => {
  const { ownerEmail, userName, userEmail, petName, petId } = requestData;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Adoption Request</h2>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
        <p>You have received a new adoption request for your pet <strong>${petName}</strong>.</p>
        <p><strong>Request Details:</strong></p>
        <ul>
          <li><strong>Pet ID:</strong> ${petId}</li>
          <li><strong>Requester Name:</strong> ${userName}</li>
          <li><strong>Requester Email:</strong> ${userEmail}</li>
        </ul>
        <p>Please log in to your FourPaws account to review and respond to this request.</p>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        This is an automated notification from FourPaws.
      </p>
    </div>
  `;

  const text = `
    New Adoption Request
    
    You have received a new adoption request for your pet ${petName}.
    
    Request Details:
    Pet ID: ${petId}
    Requester Name: ${userName}
    Requester Email: ${userEmail}
    
    Please log in to your FourPaws account to review and respond to this request.
    
    This is an automated notification from FourPaws.
  `;

  return await sendEmail({
    to: ownerEmail,
    subject: `New Adoption Request for ${petName}`,
    text,
    html,
  });
};

/**
 * Send adoption request status update to requester
 * @param {Object} requestData - Adoption request data
 * @param {string} status - New status (accepted/rejected)
 * @returns {Promise<Object>} - Email sending result
 */
const sendAdoptionStatusUpdate = async (requestData, status) => {
  const { userEmail, userName, petName, petId } = requestData;

  const statusText = status === 'accepted' ? 'approved' : 'rejected';
  const statusColor = status === 'accepted' ? '#10b981' : '#ef4444';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Adoption Request Update</h2>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
        <p>Dear ${userName},</p>
        <p>Your adoption request for <strong>${petName}</strong> has been <strong style="color: ${statusColor};">${statusText}</strong>.</p>
        <p><strong>Request Details:</strong></p>
        <ul>
          <li><strong>Pet Name:</strong> ${petName}</li>
          <li><strong>Pet ID:</strong> ${petId}</li>
          <li><strong>Status:</strong> <span style="color: ${statusColor};">${statusText.toUpperCase()}</span></li>
        </ul>
        ${status === 'accepted' 
          ? '<p>Congratulations! Please contact the pet owner to arrange the adoption process.</p>' 
          : '<p>We encourage you to browse other pets that might be a good match for you.</p>'}
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        This is an automated notification from FourPaws.
      </p>
    </div>
  `;

  const text = `
    Adoption Request Update
    
    Dear ${userName},
    
    Your adoption request for ${petName} has been ${statusText}.
    
    Request Details:
    Pet Name: ${petName}
    Pet ID: ${petId}
    Status: ${statusText.toUpperCase()}
    
    ${status === 'accepted' 
      ? 'Congratulations! Please contact the pet owner to arrange the adoption process.' 
      : 'We encourage you to browse other pets that might be a good match for you.'}
    
    This is an automated notification from FourPaws.
  `;

  return await sendEmail({
    to: userEmail,
    subject: `Adoption Request for ${petName} ${statusText}`,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendContactEmail,
  sendAdoptionRequestNotification,
  sendAdoptionStatusUpdate,
};