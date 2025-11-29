const pug = require('pug');
const { htmlToText } = require('html-to-text');
const Brevo = require('@getbrevo/brevo');

module.exports = class Email {
  constructor(user, url, booking) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = process.env.EMAIL_FROM;
    this.url = url || null;
    this.orderId = booking ? booking.orderId : null;
    this.tourName = booking ? booking.tourName : null;
    this.tourDate = booking
      ? new Date(booking.tourDate).toLocaleDateString().split('/').join('-')
      : null;
    this.adult = booking ? booking.adult : null;
    this.children = booking ? booking.children : null;

    this.emailApi = new Brevo.TransactionalEmailsApi();
    this.emailApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      orderId: this.orderId,
      tourName: this.tourName,
      tourDate: this.tourDate,
      adult: this.adult,
      children: this.children,
    });

    const textContent = htmlToText(html);

    const emailPayload = {
      sender: { name: process.env.EMAIL_SENDER_NAME, email: this.from },
      to: [{ email: this.to }],
      subject: subject,
      htmlContent: html,
      textContent: textContent,
    };

    try {
      // 4. Send using Brevo API
      await this.emailApi.sendTransacEmail(emailPayload);
      console.log(`Email sent to ${this.to}`);
    } catch (error) {
      console.log('Email sending failed:', error);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to trav-el-Exotica');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset link (valid only for 10 minutes)',
    );
  }

  async sendBookingConfirm() {
    await this.send(
      'bookingConfirm',
      `Booking Confirmation - ${this.tourName}`,
    );
  }
};
