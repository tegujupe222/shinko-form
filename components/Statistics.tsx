import React from 'react';
import type { Form, Submission } from '../types';

interface StatisticsProps {
  forms: Form[];
  submissions: Submission[];
}

const Statistics: React.FC<StatisticsProps> = ({ forms, submissions }) => {
  // 統計データの計算
  const totalForms = forms.length;
  const totalSubmissions = submissions.length;
  
  // 学校説明会関連のフォームを抽出
  const schoolForms = forms.filter(form => 
    form.title.includes('説明会') || 
    form.title.includes('体験授業') || 
    form.title.includes('アンケート')
  );
  
  const schoolSubmissions = submissions.filter(sub => 
    schoolForms.some(form => form.id === sub.formId)
  );

  // 志望度の分析
  const getInterestLevel = () => {
    const interestAnswers = submissions
      .filter(sub => {
        const form = forms.find(f => f.id === sub.formId);
        return form?.title.includes('説明会') || form?.title.includes('体験授業');
      })
      .flatMap(sub => {
        const form = forms.find(f => f.id === sub.formId);
        return form?.questions
          .filter(q => q.text.includes('志望度'))
          .map(q => sub.answers[q.id])
          .filter(Boolean) || [];
      });

    const highInterest = interestAnswers.filter(answer => 
      typeof answer === 'string' && (answer.includes('高い') || answer.includes('非常に'))
    ).length;

    return {
      high: highInterest,
      total: interestAnswers.length,
      percentage: interestAnswers.length > 0 ? Math.round((highInterest / interestAnswers.length) * 100) : 0
    };
  };

  // 参加希望日時の分析
  const getPopularDates = () => {
    const dateAnswers = submissions
      .filter(sub => {
        const form = forms.find(f => f.id === sub.formId);
        return form?.title.includes('説明会') || form?.title.includes('体験授業');
      })
      .flatMap(sub => {
        const form = forms.find(f => f.id === sub.formId);
        return form?.questions
          .filter(q => q.text.includes('日時') || q.text.includes('希望日時'))
          .map(q => sub.answers[q.id])
          .filter(Boolean) || [];
      });

    const dateCounts: Record<string, number> = {};
    dateAnswers.forEach(answer => {
      if (typeof answer === 'string') {
        dateCounts[answer] = (dateCounts[answer] || 0) + 1;
      }
    });

    return Object.entries(dateCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const interestData = getInterestLevel();
  const popularDates = getPopularDates();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">学校説明会統計</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalForms}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">総フォーム数</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSubmissions}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">総回答数</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{schoolForms.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">説明会関連フォーム</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{schoolSubmissions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">説明会回答数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 志望度分析 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">志望度分析</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">高志望度</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {interestData.high} / {interestData.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${interestData.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {interestData.percentage}% が高志望度
            </div>
          </div>
        </div>

        {/* 人気日時 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">人気日時 TOP3</h4>
          <div className="space-y-2">
            {popularDates.map(([date, count], index) => (
              <div key={date} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {index + 1}. {date}
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {count}名
                </span>
              </div>
            ))}
            {popularDates.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                まだ回答がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 