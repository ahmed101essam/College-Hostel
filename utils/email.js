const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.fullName.split(" ")[0];
    this.from = `College Housing <${process.env.EMAIL_FROM}>`;
    console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD);
  }

  _newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async _send(template, options) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      ...options,
      firstName: this.firstName,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: options.subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Create a transport and send email
    await this._newTransport().sendMail(mailOptions);
  }

  async sendVerification(token) {
    await this._send("welcome", {
      subject: "Welcome to the College Housing Family!",
      token,
    });
  }

  async sendPasswordReset(token) {
    await this._send("passwordReset", {
      subject: "Your password reset token (valid for only 10 minutes)",
      token,
    });
  }

  async sendUnitVerification(id) {
    await this._send("unitVerification", {
      subject: "CollegeHousing - Unit Verification",
      token: id,
    });
  }

  async sendAppointmentRequestUser(unit, appointment) {
    await this._send("appointmentRequestUser", {
      subject: "CollegeHousing - Appointment Request Received",
      appointment,
      unit,
    });
  }
  async sendAppointmentRequestOwner(unit, appointment, visitor) {
    await this._send("appointmentRequestOwner", {
      subject: "CollegeHousing - New Visit Request",
      appointment,
      unit,
      user,
    });
  }

  async sendAppointmentRequestConfirmation(appointment, unit, owner) {
    await this._send("appointmentConfirmationUser", {
      subject: "CollegeHousing - Visit Request Accepted ✅",
      appointment,
      unit,
      owner,
    });
  }

  async sendAppointmentRefusal(appointment, unit) {
    await this._send("appointmentRefusal", {
      subject: "CollegeHousing - Appointment Refused",
      appointment,
      unit,
    });
  }

  async sendAppointmentCancellation(appointment, unit, user) {
    await this._send("appointmentCancellation", {
      subject: "CollegeHousing - Appointment Canceled",
      appointment,
      unit,
      user,
    });
  }
};
