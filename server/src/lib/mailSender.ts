import nodemailer from 'nodemailer';
import { getEnv } from './validateEnv.js';
import { AppError } from '../middlewares/errorHandler.ts';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

const mailSender = async (email: string, title: string, body: string) => {
  try {
    let transporter = nodemailer.createTransport<SMTPTransport.Options>({
      host: getEnv('SMTP_HOST'),
      port: Number(getEnv('SMTP_PORT')),
      secure: false,
      auth: {
        user: getEnv('SMTP_USERNAME'),
        pass: getEnv('SMTP_PASSWORD'),
      },
    } as nodemailer.TransportOptions);

    //send email to user
    let info = await transporter.sendMail({
      from: `"${getEnv('SMTP_FROM_NAME')}" <${getEnv('SMTP_FROM_EMAIL')}>`,
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
