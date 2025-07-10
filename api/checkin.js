// 受付記録を保存するためのインメモリストレージ
let checkins = [];

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // 受付記録の取得
    const { formId, date } = req.query;
    
    let filteredCheckins = checkins;
    
    if (formId) {
      filteredCheckins = filteredCheckins.filter(checkin => checkin.formId === formId);
    }
    
    if (date) {
      const targetDate = new Date(date);
      filteredCheckins = filteredCheckins.filter(checkin => {
        const checkinDate = new Date(checkin.checkinTime);
        return checkinDate.toDateString() === targetDate.toDateString();
      });
    }
    
    return res.status(200).json(filteredCheckins);
  }
  
  if (req.method === 'POST') {
    // 新しい受付記録の作成
    try {
      const { submissionId, formId, participantName, checkinTime, notes } = req.body;
      
      if (!submissionId || !formId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // 重複チェック
      const existingCheckin = checkins.find(c => c.submissionId === submissionId);
      if (existingCheckin) {
        return res.status(409).json({ 
          error: 'Already checked in',
          checkin: existingCheckin 
        });
      }
      
      const newCheckin = {
        id: `checkin-${Date.now()}`,
        submissionId,
        formId,
        participantName: participantName || 'Unknown',
        checkinTime: checkinTime || new Date().toISOString(),
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      
      checkins.push(newCheckin);
      
      res.status(201).json(newCheckin);
    } catch (error) {
      console.error('Checkin creation error:', error);
      res.status(500).json({ error: 'Failed to create checkin' });
    }
  }
  
  if (req.method === 'PUT') {
    // 受付記録の更新
    try {
      const { id } = req.query;
      const { notes } = req.body;
      
      const checkinIndex = checkins.findIndex(c => c.id === id);
      if (checkinIndex === -1) {
        return res.status(404).json({ error: 'Checkin not found' });
      }
      
      checkins[checkinIndex] = {
        ...checkins[checkinIndex],
        notes: notes || checkins[checkinIndex].notes,
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json(checkins[checkinIndex]);
    } catch (error) {
      console.error('Checkin update error:', error);
      res.status(500).json({ error: 'Failed to update checkin' });
    }
  }
  
  if (req.method === 'DELETE') {
    // 受付記録の削除
    try {
      const { id } = req.query;
      
      const checkinIndex = checkins.findIndex(c => c.id === id);
      if (checkinIndex === -1) {
        return res.status(404).json({ error: 'Checkin not found' });
      }
      
      const deletedCheckin = checkins.splice(checkinIndex, 1)[0];
      res.status(200).json(deletedCheckin);
    } catch (error) {
      console.error('Checkin deletion error:', error);
      res.status(500).json({ error: 'Failed to delete checkin' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}; 