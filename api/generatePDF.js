const jsPDF = require('jspdf');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData, submissionData, qrCodeData } = req.body;

    if (!formData || !submissionData) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // QRコードを生成
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData || submissionData));

    // PDFを生成
    const doc = new jsPDF();
    
    // 日本語フォント設定（簡易版）
    doc.setFont('helvetica');
    doc.setFontSize(16);
    
    // ヘッダー
    doc.text('学校説明会 受付表', 105, 20, { align: 'center' });
    
    // 受付番号
    doc.setFontSize(12);
    doc.text(`受付番号: ${submissionData.id}`, 20, 40);
    doc.text(`受付日時: ${new Date(submissionData.submittedAt).toLocaleString('ja-JP')}`, 20, 50);
    
    // フォーム情報
    doc.text('フォーム情報', 20, 70);
    doc.setFontSize(10);
    doc.text(`タイトル: ${formData.title}`, 20, 80);
    doc.text(`説明: ${formData.description}`, 20, 90);
    
    // 回答内容
    doc.setFontSize(12);
    doc.text('回答内容', 20, 110);
    doc.setFontSize(10);
    
    let yPosition = 120;
    Object.entries(submissionData.answers).forEach(([questionId, answer]) => {
      const question = formData.questions.find(q => q.id === questionId);
      if (question) {
        const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
        const text = `${question.text}: ${answerText}`;
        
        // 長いテキストの場合は改行処理
        if (text.length > 50) {
          const lines = doc.splitTextToSize(text, 170);
          lines.forEach(line => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 20, yPosition);
            yPosition += 7;
          });
        } else {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(text, 20, yPosition);
          yPosition += 10;
        }
      }
    });
    
    // QRコードを配置
    doc.addImage(qrCodeDataUrl, 'PNG', 150, 20, 40, 40);
    doc.setFontSize(8);
    doc.text('個人情報QRコード', 150, 65);
    
    // フッター
    doc.setFontSize(10);
    doc.text('この受付表は大切に保管してください。', 20, 280);
    
    // PDFをBase64エンコードして返す
    const pdfBase64 = doc.output('datauristring');
    
    res.status(200).json({ 
      success: true, 
      pdfData: pdfBase64,
      filename: `受付表_${submissionData.id}_${new Date().toISOString().split('T')[0]}.pdf`
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}; 