import type { Form, Submission } from '../types';
import { emailApi, pdfApi } from '../services/apiService';

// メール通知のHTMLテンプレートを生成
export const generateEmailHTML = (form: Form, submission: Submission): string => {
  const answersHTML = Object.entries(submission.answers)
    .map(([questionId, answer]) => {
      const question = form.questions.find(q => q.id === questionId);
      if (!question) return '';
      
      const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${question.text}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${answerText}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f3f4f6; padding: 12px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>学校説明会 申込受付完了</h1>
        </div>
        <div class="content">
          <p>この度は、学校説明会にお申し込みいただき、ありがとうございます。</p>
          <p>以下の内容で受付いたしました。</p>
          
          <h3>フォーム情報</h3>
          <p><strong>タイトル:</strong> ${form.title}</p>
          <p><strong>受付番号:</strong> ${submission.id}</p>
          <p><strong>受付日時:</strong> ${new Date(submission.submittedAt).toLocaleString('ja-JP')}</p>
          
          <h3>回答内容</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">質問</th>
                <th style="width: 60%;">回答</th>
              </tr>
            </thead>
            <tbody>
              ${answersHTML}
            </tbody>
          </table>
          
          <p>受付表は別途PDFでお送りいたします。</p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        </div>
        <div class="footer">
          <p>このメールは自動送信されています。</p>
          <p>学校説明会フォーム管理システム</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// メール通知を送信
export const sendNotificationEmail = async (
  form: Form, 
  submission: Submission, 
  userEmail: string
): Promise<void> => {
  try {
    const html = generateEmailHTML(form, submission);
    const text = `学校説明会申込受付完了\n\nフォーム: ${form.title}\n受付番号: ${submission.id}\n受付日時: ${new Date(submission.submittedAt).toLocaleString('ja-JP')}`;
    
    await emailApi.sendNotification({
      to: userEmail,
      subject: `【受付完了】${form.title} - 学校説明会`,
      html,
      text
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw error;
  }
};

// PDF受付表を生成してダウンロード
export const generateAndDownloadReceipt = async (
  form: Form, 
  submission: Submission
): Promise<void> => {
  try {
    // QRコードに含める個人情報（暗号化推奨）
    const qrCodeData = {
      submissionId: submission.id,
      formId: form.id,
      submittedAt: submission.submittedAt,
      // 個人情報を含む（実際の運用では暗号化することを推奨）
      personalInfo: submission.answers
    };

    const result = await pdfApi.generateReceipt({
      formData: form,
      submissionData: submission,
      qrCodeData
    });

    // PDFをダウンロード
    const link = document.createElement('a');
    link.href = result.pdfData;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to generate PDF receipt:', error);
    throw error;
  }
};

// 管理者向けメール通知（新規申込があった場合）
export const sendAdminNotification = async (
  form: Form, 
  submission: Submission
): Promise<void> => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>新規申込通知</h1>
          </div>
          <div class="content">
            <p>新しい申込がありました。</p>
            <p><strong>フォーム:</strong> ${form.title}</p>
            <p><strong>受付番号:</strong> ${submission.id}</p>
            <p><strong>申込者:</strong> ${submission.submittedBy}</p>
            <p><strong>受付日時:</strong> ${new Date(submission.submittedAt).toLocaleString('ja-JP')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailApi.sendNotification({
      to: 'g-igasaki@shinko.ed.jp', // 管理者メールアドレス
      subject: `【新規申込】${form.title}`,
      html
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // 管理者通知の失敗はログに記録するが、ユーザーには影響しない
  }
}; 