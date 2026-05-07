const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'imbanker@naver.com';

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail',
  });
}

async function sendAdminNotification(submission) {
  const transporter = createTransport();
  const summary = [
    `${submission.mode === 'sell' ? '매각 희망' : '인수 희망'} 정보 접수`,
    `네이버 검색제휴 여부: ${submission.searchAffiliation}`,
    `매체 유형: ${submission.mediaTypes.length ? submission.mediaTypes.join(', ') : '선택 없음'}`,
    `2025년도 매출: ${submission.revenueRange}`,
    `${submission.mode === 'sell' ? '매각 희망가' : '인수 희망가'}: ${submission.price}억원`,
    `하고 싶은 말: ${submission.notes || '없음'}`,
    `이메일: ${submission.email}`,
  ].join('\n');

  const message = {
    from: process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || 'example.com'}`,
    to: ADMIN_EMAIL,
    subject: `${submission.mode === 'sell' ? '매각' : '인수'} 희망 정보 접수`,
    text: `${summary}\n\n관리자 이메일: ${ADMIN_EMAIL}`,
  };

  return transporter.sendMail(message);
}

async function sendUserConfirmation(submission) {
  const transporter = createTransport();
  const subject = `${submission.mode === 'sell' ? '매각' : '인수'} 희망 접수가 완료되었습니다`;
  const body = [
    `${submission.mode === 'sell' ? '매각 희망' : '인수 희망'} 정보가 접수되었습니다.`,
    `네이버 검색제휴 여부: ${submission.searchAffiliation}`,
    `매체 유형: ${submission.mediaTypes.length ? submission.mediaTypes.join(', ') : '선택 없음'}`,
    `2025년도 매출: ${submission.revenueRange}`,
    `${submission.mode === 'sell' ? '매각 희망가' : '인수 희망가'}: ${submission.price}억원`,
    `하고 싶은 말: ${submission.notes || '없음'}`,
    '',
    '중개 담당자가 확인 후 연락 드리겠습니다.',
  ].join('\n');

  const message = {
    from: process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || 'example.com'}`,
    to: submission.email,
    subject,
    text: body,
  };

  return transporter.sendMail(message);
}

module.exports = {
  sendAdminNotification,
  sendUserConfirmation,
  ADMIN_EMAIL,
};
