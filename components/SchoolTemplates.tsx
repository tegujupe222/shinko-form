import React from 'react';
import { QuestionType } from '../types';
import type { Form } from '../types';

interface SchoolTemplatesProps {
  onSelectTemplate: (template: Form) => void;
}

const SchoolTemplates: React.FC<SchoolTemplatesProps> = ({ onSelectTemplate }) => {
  const templates: Form[] = [
    {
      id: 'template-open-house',
      title: '学校説明会参加申込',
      description: '学校説明会への参加申込用フォームです。保護者とお子様の情報、参加希望日時などを収集します。',
      createdBy: 'admin',
      questions: [
        { id: 'q1', text: '保護者氏名', type: QuestionType.TEXT, required: true },
        { id: 'q2', text: 'お子様氏名', type: QuestionType.TEXT, required: true },
        { id: 'q3', text: 'お子様の学年', type: QuestionType.RADIO, options: ['小学5年生', '小学6年生', '中学1年生', '中学2年生', '中学3年生'], required: true },
        { id: 'q4', text: 'メールアドレス', type: QuestionType.TEXT, required: true },
        { id: 'q5', text: '電話番号', type: QuestionType.TEXT, required: true },
        { id: 'q6', text: '参加希望日時', type: QuestionType.RADIO, options: ['第1回: 6月15日(土) 10:00-12:00', '第2回: 7月20日(土) 14:00-16:00', '第3回: 9月14日(土) 10:00-12:00'], required: true },
        { id: 'q7', text: '参加人数', type: QuestionType.RADIO, options: ['1名（保護者のみ）', '2名（保護者+お子様）', '3名以上'], required: true },
        { id: 'q8', text: '本校への志望度', type: QuestionType.RADIO, options: ['非常に高い', '高い', '普通', '低い', '未定'], required: true },
        { id: 'q9', text: 'ご質問・ご要望', type: QuestionType.TEXTAREA, required: false },
      ],
    },
    {
      id: 'template-experience-class',
      title: '体験授業参加申込',
      description: '体験授業への参加申込用フォームです。実際の授業を体験していただけます。',
      createdBy: 'admin',
      questions: [
        { id: 'q1', text: '保護者氏名', type: QuestionType.TEXT, required: true },
        { id: 'q2', text: 'お子様氏名', type: QuestionType.TEXT, required: true },
        { id: 'q3', text: 'お子様の学年', type: QuestionType.RADIO, options: ['小学5年生', '小学6年生', '中学1年生', '中学2年生'], required: true },
        { id: 'q4', text: '希望体験授業', type: QuestionType.RADIO, options: ['英語', '数学', '理科実験', '体育', '音楽', '美術'], required: true },
        { id: 'q5', text: '希望日時', type: QuestionType.RADIO, options: ['8月5日(土) 9:00-11:00', '8月12日(土) 9:00-11:00', '8月19日(土) 9:00-11:00'], required: true },
        { id: 'q6', text: '連絡先メールアドレス', type: QuestionType.TEXT, required: true },
        { id: 'q7', text: '連絡先電話番号', type: QuestionType.TEXT, required: true },
        { id: 'q8', text: 'お子様の特技・興味', type: QuestionType.TEXTAREA, required: false },
      ],
    },
    {
      id: 'template-feedback',
      title: '説明会アンケート',
      description: '説明会後のアンケート用フォームです。参加者の満足度や志望度の変化を調査します。',
      createdBy: 'admin',
      questions: [
        { id: 'q1', text: '参加者氏名', type: QuestionType.TEXT, required: true },
        { id: 'q2', text: '説明会の満足度', type: QuestionType.RADIO, options: ['非常に満足', '満足', '普通', '不満', '非常に不満'], required: true },
        { id: 'q3', text: '最も印象に残った内容', type: QuestionType.TEXTAREA, required: false },
        { id: 'q4', text: '本校への志望度の変化', type: QuestionType.RADIO, options: ['非常に高くなった', '高くなった', '変わらない', '低くなった', '非常に低くなった'], required: true },
        { id: 'q5', text: '今後の説明会で聞きたい内容', type: QuestionType.TEXTAREA, required: false },
        { id: 'q6', text: 'その他のご意見・ご感想', type: QuestionType.TEXTAREA, required: false },
      ],
    },
    {
      id: 'template-counseling',
      title: '個別相談申込',
      description: '個別相談の申込用フォームです。より詳しい情報をお聞かせください。',
      createdBy: 'admin',
      questions: [
        { id: 'q1', text: '保護者氏名', type: QuestionType.TEXT, required: true },
        { id: 'q2', text: 'お子様氏名', type: QuestionType.TEXT, required: true },
        { id: 'q3', text: 'お子様の学年', type: QuestionType.RADIO, options: ['小学5年生', '小学6年生', '中学1年生', '中学2年生', '中学3年生'], required: true },
        { id: 'q4', text: '相談内容', type: QuestionType.RADIO, options: ['入試について', '学校生活について', '学習内容について', '進路について', 'その他'], required: true },
        { id: 'q5', text: '希望相談日時', type: QuestionType.RADIO, options: ['平日午前', '平日午後', '土曜日午前', '土曜日午後'], required: true },
        { id: 'q6', text: '連絡先メールアドレス', type: QuestionType.TEXT, required: true },
        { id: 'q7', text: '連絡先電話番号', type: QuestionType.TEXT, required: true },
        { id: 'q8', text: '相談したい具体的な内容', type: QuestionType.TEXTAREA, required: false },
      ],
    },
    {
      id: 'template-campus-tour',
      title: 'キャンパス見学申込',
      description: 'キャンパス見学の申込用フォームです。実際の学校施設をご見学いただけます。',
      createdBy: 'admin',
      questions: [
        { id: 'q1', text: '保護者氏名', type: QuestionType.TEXT, required: true },
        { id: 'q2', text: 'お子様氏名', type: QuestionType.TEXT, required: true },
        { id: 'q3', text: 'お子様の学年', type: QuestionType.RADIO, options: ['小学5年生', '小学6年生', '中学1年生', '中学2年生', '中学3年生'], required: true },
        { id: 'q4', text: '希望見学日時', type: QuestionType.RADIO, options: ['平日午前', '平日午後', '土曜日午前', '土曜日午後'], required: true },
        { id: 'q5', text: '見学希望施設', type: QuestionType.RADIO, options: ['教室', '図書館', '体育館', '実験室', '音楽室', '美術室', '全施設'], required: true },
        { id: 'q6', text: '参加人数', type: QuestionType.RADIO, options: ['1名（保護者のみ）', '2名（保護者+お子様）', '3名以上'], required: true },
        { id: 'q7', text: '連絡先メールアドレス', type: QuestionType.TEXT, required: true },
        { id: 'q8', text: '連絡先電話番号', type: QuestionType.TEXT, required: true },
        { id: 'q9', text: 'その他のご要望', type: QuestionType.TEXTAREA, required: false },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">学校説明会用テンプレート</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">よく使用されるフォームのテンプレートです。選択してカスタマイズしてください。</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{template.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{template.description}</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {template.questions.length} 個の質問項目
            </div>
            <button
              onClick={() => onSelectTemplate(template)}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition duration-300"
            >
              このテンプレートを使用
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolTemplates; 