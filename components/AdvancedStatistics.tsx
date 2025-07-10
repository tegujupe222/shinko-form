import React, { useState } from 'react';
import type { Form, Submission } from '../types';

interface AdvancedStatisticsProps {
  forms: Form[];
  submissions: Submission[];
}

const AdvancedStatistics: React.FC<AdvancedStatisticsProps> = ({ forms, submissions }) => {
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // 日付範囲でフィルタリング
  const getFilteredSubmissions = () => {
    let filtered = submissions;
    
    if (selectedForm !== 'all') {
      filtered = filtered.filter(sub => sub.formId === selectedForm);
    }
    
    if (dateRange !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(sub => new Date(sub.submittedAt) >= cutoffDate);
    }
    
    return filtered;
  };

  const filteredSubmissions = getFilteredSubmissions();

  // 回答傾向分析
  const getAnswerTrends = () => {
    const trends: Record<string, Record<string, number>> = {};
    
    filteredSubmissions.forEach(sub => {
      const form = forms.find(f => f.id === sub.formId);
      if (!form) return;
      
      Object.entries(sub.answers).forEach(([questionId, answer]) => {
        const question = form.questions.find(q => q.id === questionId);
        if (!question) return;
        
        if (!trends[question.text]) {
          trends[question.text] = {};
        }
        
        const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
        trends[question.text][answerText] = (trends[question.text][answerText] || 0) + 1;
      });
    });
    
    return trends;
  };

  // 時間帯分析
  const getTimeAnalysis = () => {
    const timeSlots: Record<string, number> = {
      '9:00-12:00': 0,
      '12:00-15:00': 0,
      '15:00-18:00': 0,
      '18:00-21:00': 0,
      '21:00-24:00': 0,
      '0:00-9:00': 0
    };
    
    filteredSubmissions.forEach(sub => {
      const hour = new Date(sub.submittedAt).getHours();
      if (hour >= 9 && hour < 12) timeSlots['9:00-12:00']++;
      else if (hour >= 12 && hour < 15) timeSlots['12:00-15:00']++;
      else if (hour >= 15 && hour < 18) timeSlots['15:00-18:00']++;
      else if (hour >= 18 && hour < 21) timeSlots['18:00-21:00']++;
      else if (hour >= 21) timeSlots['21:00-24:00']++;
      else timeSlots['0:00-9:00']++;
    });
    
    return timeSlots;
  };

  // 週間分析
  const getWeeklyAnalysis = () => {
    const weekDays: Record<string, number> = {
      '日曜日': 0, '月曜日': 0, '火曜日': 0, '水曜日': 0,
      '木曜日': 0, '金曜日': 0, '土曜日': 0
    };
    
    filteredSubmissions.forEach(sub => {
      const day = new Date(sub.submittedAt).getDay();
      const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
      weekDays[dayNames[day]]++;
    });
    
    return weekDays;
  };

  // 志望度変化分析
  const getInterestChangeAnalysis = () => {
    const interestChanges: Record<string, number> = {
      '非常に高くなった': 0,
      '高くなった': 0,
      '変わらない': 0,
      '低くなった': 0,
      '非常に低くなった': 0
    };
    
    filteredSubmissions.forEach(sub => {
      const form = forms.find(f => f.id === sub.formId);
      if (!form) return;
      
      Object.entries(sub.answers).forEach(([questionId, answer]) => {
        const question = form.questions.find(q => q.id === questionId);
        if (question && question.text.includes('志望度の変化')) {
          const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
          if (interestChanges.hasOwnProperty(answerText)) {
            interestChanges[answerText]++;
          }
        }
      });
    });
    
    return interestChanges;
  };

  const answerTrends = getAnswerTrends();
  const timeAnalysis = getTimeAnalysis();
  const weeklyAnalysis = getWeeklyAnalysis();
  const interestChanges = getInterestChangeAnalysis();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">詳細統計分析</h3>
      
      {/* フィルター */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            フォーム選択
          </label>
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">すべてのフォーム</option>
            {forms.map(form => (
              <option key={form.id} value={form.id}>{form.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            期間選択
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">すべての期間</option>
            <option value="7">過去7日間</option>
            <option value="30">過去30日間</option>
            <option value="90">過去90日間</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 回答傾向分析 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">回答傾向分析</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {Object.entries(answerTrends).map(([question, answers]) => (
              <div key={question} className="border-b border-gray-200 dark:border-gray-600 pb-2">
                <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">{question}</h5>
                <div className="space-y-1">
                  {Object.entries(answers)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([answer, count]) => (
                      <div key={answer} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400 truncate">{answer}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{count}件</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 時間帯分析 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">時間帯別回答数</h4>
          <div className="space-y-2">
            {Object.entries(timeAnalysis).map(([timeSlot, count]) => (
              <div key={timeSlot} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">{timeSlot}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(timeAnalysis))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 曜日別分析 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">曜日別回答数</h4>
          <div className="space-y-2">
            {Object.entries(weeklyAnalysis).map(([day, count]) => (
              <div key={day} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">{day}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(weeklyAnalysis))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 志望度変化分析 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">志望度変化分析</h4>
          <div className="space-y-2">
            {Object.entries(interestChanges).map(([change, count]) => (
              <div key={change} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">{change}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(interestChanges))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">分析サマリー</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">総回答数:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">{filteredSubmissions.length}件</span>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">対象フォーム:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {selectedForm === 'all' ? forms.length : 1}個
            </span>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">最多回答時間:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {Object.entries(timeAnalysis).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
            </span>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">最多回答曜日:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {Object.entries(weeklyAnalysis).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStatistics; 