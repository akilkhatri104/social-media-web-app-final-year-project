import nodemailer from 'nodemailer';
import { AppError } from '../middlewares/errorHandler.ts';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

const mailSender = async (email: string, title: string, body: string) => {
  try {
    let transporter = nodemailer.createTransport<SMTPTransport.Options>({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME!,
        pass: process.env.SMTP_PASSWORD,
      },
    } as nodemailer.TransportOptions);

    //send email to user
    let info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL!,
      to: email,
      subject: title,
      html: body,
    });

    console.log('Email info: ', info);
    return info;
  } catch (error) {
    console.error('mailSender :: ', error);
    throw new AppError();
  }
};

export default mailSender;
