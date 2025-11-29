const pug = require('pug');

const { htmlToText } = require('html-to-text');
const nodemailer = require('nodemailer');

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
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,

      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
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

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    try {
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to trav-el-Exotica');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset link. (valid only for 10 minutes)',
    );
  }

  async sendBookingConfirm() {
    await this.send('bookingConfirm', `Booking Confirmation -${this.tourName}`);
  }
};
