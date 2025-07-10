import React, { useState, useEffect } from 'react';
import type { Form, Submission, Checkin } from '../types';
import { checkinApi } from '../services/apiService';
import BarcodeScanner from './BarcodeScanner';
import { EyeIcon, TrashIcon, PencilIcon } from './Icon';

interface CheckinManagerProps {
  forms: Form[];
  submissions: Submission[];
}

const CheckinManager: React.FC<CheckinManagerProps> = ({ forms, submissions }) => {
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
  const [editNotes, setEditNotes] = useState('');

  // 今日の日付を取得
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (selectedForm) {
      loadCheckins();
    }
  }, [selectedForm]);

  const loadCheckins = async () => {
    try {
      setLoading(true);
      const data = await checkinApi.getAll({ 
        formId: selectedForm, 
        date: today 
      });
      setCheckins(data);
    } catch (error) {
      setError('受付データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (barcodeData: string) => {
    try {
      setLoading(true);
      setError('');
      
      // バーコードデータを解析（JSON形式を想定）
      let parsedData;
      try {
        parsedData = JSON.parse(barcodeData);
      } catch {
        setError('無効なバーコードです');
        return;
      }

      // 対応する申込データを検索
      const submission = submissions.find(sub => sub.id === parsedData.submissionId);
      if (!submission) {
        setError('対応する申込データが見つかりません');
        return;
      }

      // 既に受付済みかチェック
      const existingCheckin = checkins.find(c => c.submissionId === submission.id);
      if (existingCheckin) {
        setError('既に受付済みです');
        setScannedData({ submission, existingCheckin });
        return;
      }

      // 参加者名を取得
      const participantName = getParticipantName(submission);
      
      // 受付記録を作成
      const newCheckin = await checkinApi.create({
        submissionId: submission.id,
        formId: submission.formId,
        participantName,
        checkinTime: new Date().toISOString(),
        notes: ''
      });

      setCheckins(prev => [...prev, newCheckin]);
      setSuccess(`${participantName}さんの受付が完了しました`);
      setScannedData({ submission, checkin: newCheckin });
      
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setSuccess('');
        setScannedData(null);
      }, 3000);

    } catch (error: any) {
      if (error.message?.includes('Already checked in')) {
        setError('既に受付済みです');
      } else {
        setError('受付処理に失敗しました');
      }
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const getParticipantName = (submission: Submission): string => {
    // 保護者氏名または参加者氏名を取得
    const parentName = submission.answers['q1'] || submission.answers['q10'] || submission.answers['q16'];
    const childName = submission.answers['q2'] || submission.answers['q17'];
    
    if (parentName && childName) {
      return `${parentName}（${childName}）`;
    } else if (parentName) {
      return parentName as string;
    } else if (childName) {
      return childName as string;
    }
    
    return '名前不明';
  };

  const handleDeleteCheckin = async (checkinId: string) => {
    if (!confirm('この受付記録を削除しますか？')) return;
    
    try {
      await checkinApi.delete(checkinId);
      setCheckins(prev => prev.filter(c => c.id !== checkinId));
      setSuccess('受付記録を削除しました');
    } catch (error) {
      setError('削除に失敗しました');
    }
  };

  const handleEditCheckin = async () => {
    if (!editingCheckin) return;
    
    try {
      const updatedCheckin = await checkinApi.update(editingCheckin.id, {
        notes: editNotes
      });
      setCheckins(prev => prev.map(c => c.id === editingCheckin.id ? updatedCheckin : c));
      setEditingCheckin(null);
      setEditNotes('');
      setSuccess('メモを更新しました');
    } catch (error) {
      setError('更新に失敗しました');
    }
  };

  const selectedFormData = forms.find(f => f.id === selectedForm);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">受付管理</h2>
      
      {/* フォーム選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          説明会を選択
        </label>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">説明会を選択してください</option>
          {forms.map(form => (
            <option key={form.id} value={form.id}>{form.title}</option>
          ))}
        </select>
      </div>

      {selectedForm && (
        <>
          {/* バーコードスキャナー */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">バーコードスキャン</h3>
            
                         {!isScanning ? (
               <button
                 onClick={() => setIsScanning(true)}
                 className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
               >
                 バーコードリーダーを起動
               </button>
             ) : (
              <div className="space-y-4">
                <BarcodeScanner
                  onScan={handleScan}
                  onError={setError}
                  isActive={isScanning}
                />
                                 <button
                   onClick={() => setIsScanning(false)}
                   className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
                 >
                   バーコードリーダー停止
                 </button>
              </div>
            )}

            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">処理中...</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {scannedData && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">スキャン結果</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  参加者: {getParticipantName(scannedData.submission)}
                </p>
                {scannedData.existingCheckin && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    受付時刻: {new Date(scannedData.existingCheckin.checkinTime).toLocaleString('ja-JP')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 今日の受付一覧 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedFormData?.title} - 今日の受付一覧 ({checkins.length}名)
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">読み込み中...</p>
              </div>
            ) : checkins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">受付番号</th>
                      <th className="px-6 py-3">参加者名</th>
                      <th className="px-6 py-3">受付時刻</th>
                      <th className="px-6 py-3">メモ</th>
                      <th className="px-6 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkins.map((checkin) => (
                      <tr key={checkin.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {checkin.id}
                        </td>
                        <td className="px-6 py-4">{checkin.participantName}</td>
                        <td className="px-6 py-4">
                          {new Date(checkin.checkinTime).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4">
                          {editingCheckin?.id === checkin.id ? (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="flex-1 p-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="メモを入力"
                              />
                              <button
                                onClick={handleEditCheckin}
                                className="text-green-600 hover:text-green-800"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCheckin(null);
                                  setEditNotes('');
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>{checkin.notes || '-'}</span>
                              <button
                                onClick={() => {
                                  setEditingCheckin(checkin);
                                  setEditNotes(checkin.notes);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteCheckin(checkin.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                今日の受付はまだありません
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CheckinManager; 