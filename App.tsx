
import React, { useState, useEffect, useReducer } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Spinner from './components/Spinner';
import Statistics from './components/Statistics';
import AdvancedStatistics from './components/AdvancedStatistics';
import SchoolTemplates from './components/SchoolTemplates';
import CheckinManager from './components/CheckinManager';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon, ArrowLeftIcon } from './components/Icon';
import { QuestionType } from './types';
import type { User, Form, Question, Submission } from './types';
import { formsApi, submissionsApi } from './services/apiService';
import { sendNotificationEmail, generateAndDownloadReceipt, sendAdminNotification } from './utils/notificationUtils';

// --- MOCK DATA & CONSTANTS ---
const ADMIN_EMAIL = 'g-igasaki@shinko.ed.jp';
const ADMIN_PASSWORD = '20130101Aa';
const USER_EMAIL = 'user@example.com';

const initialForms: Form[] = [
  {
    id: 'form-1',
    title: '学校説明会参加申込フォーム',
    description: '本校の学校説明会への参加をお申し込みください。ご不明な点がございましたら、お気軽にお問い合わせください。',
    createdBy: ADMIN_EMAIL,
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
    id: 'form-2',
    title: '学校説明会アンケート',
    description: '学校説明会にご参加いただき、ありがとうございました。今後の改善のため、アンケートにご協力ください。',
    createdBy: ADMIN_EMAIL,
    questions: [
      { id: 'q10', text: '参加者氏名', type: QuestionType.TEXT, required: true },
      { id: 'q11', text: '説明会の満足度', type: QuestionType.RADIO, options: ['非常に満足', '満足', '普通', '不満', '非常に不満'], required: true },
      { id: 'q12', text: '最も印象に残った内容', type: QuestionType.TEXTAREA, required: false },
      { id: 'q13', text: '本校への志望度の変化', type: QuestionType.RADIO, options: ['非常に高くなった', '高くなった', '変わらない', '低くなった', '非常に低くなった'], required: true },
      { id: 'q14', text: '今後の説明会で聞きたい内容', type: QuestionType.TEXTAREA, required: false },
      { id: 'q15', text: 'その他のご意見・ご感想', type: QuestionType.TEXTAREA, required: false },
    ],
  },
  {
    id: 'form-3',
    title: '体験授業参加申込',
    description: '本校の体験授業にご参加いただけます。実際の授業を体験して、本校の教育内容をご理解ください。',
    createdBy: ADMIN_EMAIL,
    questions: [
      { id: 'q16', text: '保護者氏名', type: QuestionType.TEXT, required: true },
      { id: 'q17', text: 'お子様氏名', type: QuestionType.TEXT, required: true },
      { id: 'q18', text: 'お子様の学年', type: QuestionType.RADIO, options: ['小学5年生', '小学6年生', '中学1年生', '中学2年生'], required: true },
      { id: 'q19', text: '希望体験授業', type: QuestionType.RADIO, options: ['英語', '数学', '理科実験', '体育', '音楽', '美術'], required: true },
      { id: 'q20', text: '希望日時', type: QuestionType.RADIO, options: ['8月5日(土) 9:00-11:00', '8月12日(土) 9:00-11:00', '8月19日(土) 9:00-11:00'], required: true },
      { id: 'q21', text: '連絡先メールアドレス', type: QuestionType.TEXT, required: true },
      { id: 'q22', text: '連絡先電話番号', type: QuestionType.TEXT, required: true },
      { id: 'q23', text: 'お子様の特技・興味', type: QuestionType.TEXTAREA, required: false },
    ],
  }
];

// --- APP STATE & REDUCER ---

type AppState = {
  user: User | null;
  forms: Form[];
  submissions: Submission[];
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_FORM'; payload: Form }
  | { type: 'UPDATE_FORM'; payload: Form }
  | { type: 'DELETE_FORM'; payload: string } // formId
  | { type: 'ADD_SUBMISSION'; payload: Submission }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATE'; payload: Omit<AppState, 'loading'|'error'> }
  | { type: 'SET_FORMS'; payload: Form[] }
  | { type: 'SET_SUBMISSIONS'; payload: Submission[] };

const initialState: AppState = {
  user: null,
  forms: [],
  submissions: [],
  loading: true,
  error: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, forms: state.forms, submissions: state.submissions };
    case 'ADD_FORM':
      return { ...state, forms: [...state.forms, action.payload] };
    case 'UPDATE_FORM':
        return {
            ...state,
            forms: state.forms.map(form =>
                form.id === action.payload.id ? action.payload : form
            ),
        };
    case 'DELETE_FORM':
      return {
          ...state,
          forms: state.forms.filter(form => form.id !== action.payload),
          submissions: state.submissions.filter(sub => sub.formId !== action.payload)
      };
    case 'ADD_SUBMISSION':
      return { ...state, submissions: [...state.submissions, action.payload] };
    case 'SET_LOADING':
        return { ...state, loading: action.payload };
    case 'SET_ERROR':
        return { ...state, error: action.payload, loading: false };
    case 'SET_STATE':
        return { ...state, ...action.payload };
    case 'SET_FORMS':
        return { ...state, forms: action.payload };
    case 'SET_SUBMISSIONS':
        return { ...state, submissions: action.payload };
    default:
      return state;
  }
};


// --- UI COMPONENTS (Defined outside main component) ---

const LoginScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAdminLogin = () => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            onLogin({ email: ADMIN_EMAIL, role: 'admin' });
            setError('');
        } else {
            setError('メールアドレスまたはパスワードが正しくありません。');
        }
    };

    const handleUserLogin = () => {
        onLogin({ email: USER_EMAIL, role: 'user' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">SGformer</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">教育現場のフォーム管理システム</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">ログイン</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">アカウントにアクセスしてください</p>
                    </div>
                    
                    <div className="space-y-5 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">メールアドレス</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">パスワード</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                                />
                            </div>
                        </div>
                        
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleAdminLogin} 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                        >
                            管理者としてログイン
                        </button>
                        <button 
                            onClick={handleUserLogin} 
                            className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                        >
                            ユーザーとしてログイン
                        </button>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            デモ用: {ADMIN_EMAIL}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardCard: React.FC<{ form: Form; submissionCount: number; isAdmin: boolean }> = ({ form, submissionCount, isAdmin }) => {
    // Calculate form status based on submissions
    const getFormStatus = () => {
        if (submissionCount === 0) return { text: '未回答', color: 'text-gray-500', bgColor: 'bg-gray-100' };
        if (submissionCount < 5) return { text: '少数回答', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (submissionCount < 20) return { text: '中程度', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        return { text: '多数回答', color: 'text-green-600', bgColor: 'bg-green-100' };
    };

    const status = getFormStatus();

    return (
        <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02]">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{form.title}</h3>
                    {isAdmin && (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color} ${status.bgColor} shadow-sm`}>
                            {status.text}
                        </span>
                    )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{form.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{form.questions.length} 質問</span>
                    </span>
                    {isAdmin && (
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{submissionCount} 回答</span>
                            </span>
                            {submissionCount > 0 && (
                                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" 
                                        style={{ width: `${Math.min((submissionCount / 50) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 px-6 py-4 border-t border-gray-100 dark:border-gray-600">
                 {isAdmin ? (
                    <div className="flex justify-end space-x-3">
                         <Link to={`/submissions/${form.id}`} className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                            <EyeIcon className="w-4 h-4" />
                            <span>回答を表示</span>
                        </Link>
                        <Link to={`/edit/${form.id}`} className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                            <PencilIcon className="w-4 h-4" />
                            <span>編集</span>
                        </Link>
                    </div>
                ) : (
                    <Link to={`/form/${form.id}`} className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        フォームに回答
                    </Link>
                )}
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<{ forms: Form[]; submissions: Submission[] }> = ({ forms, submissions }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">SGformer 管理ダッシュボード</h2>
                    <p className="text-gray-600 dark:text-gray-300">フォームと回答を効率的に管理</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link to="/checkin" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        <EyeIcon className="w-5 h-5" />
                        <span>受付管理</span>
                    </Link>
                    <Link to="/new" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>フォーム作成</span>
                    </Link>
                </div>
            </div>
            
            {/* 統計情報 */}
            <Statistics forms={forms} submissions={submissions} />
            
            {/* 詳細統計分析 */}
            <AdvancedStatistics forms={forms} submissions={submissions} />
            
            {forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <DashboardCard key={form.id} form={form} submissionCount={submissions.filter(s => s.formId === form.id).length} isAdmin={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">まだフォームがありません！</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">「フォーム作成」をクリックして始めましょう。</p>
                    <Link to="/new" className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>フォームを作成</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

const UserDashboard: React.FC<{ forms: Form[] }> = ({ forms }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 min-h-screen">
            <div className="mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">利用可能なフォーム</h2>
                <p className="text-gray-600 dark:text-gray-300">回答可能なフォームを選択してください</p>
            </div>
            {forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <DashboardCard key={form.id} form={form} submissionCount={0} isAdmin={false} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">現在利用可能なフォームはありません</h3>
                    <p className="text-gray-600 dark:text-gray-300">後でまた確認してください。</p>
                </div>
            )}
        </div>
    );
};

const ViewSubmissions: React.FC<{ forms: Form[]; submissions: Submission[] }> = ({ forms, submissions }) => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const form = forms.find(f => f.id === formId);
    const formSubmissions = submissions.filter(s => s.formId === formId);

    if (!form) return <div className="p-8 text-center text-red-500">フォームが見つかりません。</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>ダッシュボードに戻る</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{form.title} の回答</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{formSubmissions.length} 件の回答</p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                {formSubmissions.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">回答者</th>
                                {form.questions.map(q => <th key={q.id} scope="col" className="px-6 py-3">{q.text}</th>)}
                                <th scope="col" className="px-6 py-3">回答日時</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formSubmissions.map(sub => (
                                <tr key={sub.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sub.submittedBy}</td>
                                    {form.questions.map(q => (
                                        <td key={q.id} className="px-6 py-4">
                                            {Array.isArray(sub.answers[q.id]) ? (sub.answers[q.id] as string[]).join(', ') : sub.answers[q.id]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4">{new Date(sub.submittedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="p-8 text-center text-gray-500 dark:text-gray-400">このフォームにはまだ回答がありません。</p>
                )}
            </div>
        </div>
    );
};

const FillForm: React.FC<{ forms: Form[]; user: User; dispatch: React.Dispatch<Action> }> = ({ forms, user, dispatch }) => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const form = forms.find(f => f.id === formId);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [submitted, setSubmitted] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (form) {
            const initialAnswers: Record<string, string | string[]> = {};
            form.questions.forEach(q => {
                initialAnswers[q.id] = q.type === QuestionType.CHECKBOX ? [] : '';
            });
            setAnswers(initialAnswers);
        }
    }, [form]);

    if (!form) return <div className="p-8 text-center text-red-500">フォームが見つかりません。</div>;
    
    const handleInputChange = (questionId: string, value: string) => {
        setAnswers(prev => ({...prev, [questionId]: value}));
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        setAnswers(prev => {
            const current = (prev[questionId] as string[]) || [];
            if (checked) {
                return {...prev, [questionId]: [...current, option]};
            } else {
                return {...prev, [questionId]: current.filter(item => item !== option)};
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        // Basic validation
        for (const q of form.questions) {
            if (q.required) {
                const answer = answers[q.id];
                if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                    alert(`質問「${q.text}」は必須です。`);
                    setProcessing(false);
                    return;
                }
            }
        }

        try {
            const submissionData = {
                formId: form.id,
                submittedBy: user.email,
                answers,
            };

            const newSubmission = await submissionsApi.create(submissionData);
            dispatch({ type: 'ADD_SUBMISSION', payload: newSubmission });
            
            // メール通知を送信
            try {
                await sendNotificationEmail(form, newSubmission, user.email);
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
                // メール送信の失敗はユーザーに通知しない
            }
            
            // 管理者に通知
            try {
                await sendAdminNotification(form, newSubmission);
            } catch (adminEmailError) {
                console.error('Admin notification failed:', adminEmailError);
            }
            
            // PDF受付表を生成・ダウンロード
            try {
                await generateAndDownloadReceipt(form, newSubmission);
            } catch (pdfError) {
                console.error('PDF generation failed:', pdfError);
                // PDF生成の失敗はユーザーに通知しない
            }
            
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit form:', error);
            alert('フォームの送信に失敗しました。');
        } finally {
            setProcessing(false);
        }
    };

    if (submitted) {
        return (
             <div className="max-w-2xl mx-auto p-8 text-center">
                 <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">ありがとうございます！</h2>
                 <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                     回答が記録されました。<br />
                     確認メールをお送りしましたので、ご確認ください。<br />
                     受付表のPDFも自動的にダウンロードされました。
                 </p>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                     <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">次のステップ</h3>
                     <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                         <li>• メールボックスで確認メールをご確認ください</li>
                         <li>• ダウンロードされた受付表を大切に保管してください</li>
                         <li>• 受付表のQRコードには個人情報が含まれています</li>
                     </ul>
                 </div>
                 <Link to="/" className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                     フォーム一覧に戻る
                 </Link>
             </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
             <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>一覧に戻る</span>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{form.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">{form.description}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {form.questions.map(q => (
                        <div key={q.id}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                {q.text}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {q.type === QuestionType.TEXT && <input type="text" required={q.required} value={answers[q.id] as string || ''} onChange={(e) => handleInputChange(q.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>}
                            {q.type === QuestionType.TEXTAREA && <textarea required={q.required} value={answers[q.id] as string || ''} onChange={(e) => handleInputChange(q.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={4}/>}
                            {q.type === QuestionType.RADIO && q.options?.map(opt => (
                                <div key={opt} className="flex items-center">
                                    <input type="radio" id={`${q.id}-${opt}`} name={q.id} value={opt} checked={answers[q.id] === opt} onChange={(e) => handleInputChange(q.id, e.target.value)} required={q.required} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                    <label htmlFor={`${q.id}-${opt}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">{opt}</label>
                                </div>
                            ))}
                        </div>
                    ))}
                    <button 
                        type="submit" 
                        disabled={processing}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
                            processing 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <Spinner size="sm" />
                                <span className="ml-2">送信中...</span>
                            </div>
                        ) : (
                            '送信'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const FormBuilder: React.FC<{ user: User; dispatch: React.Dispatch<Action>; forms: Form[] }> = ({ user, dispatch, forms }) => {
    const navigate = useNavigate();
    const { formId } = useParams();
    const existingForm = formId ? forms.find(f => f.id === formId) : undefined;
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showTemplates, setShowTemplates] = useState(!existingForm);

    useEffect(() => {
        if (existingForm) {
            setTitle(existingForm.title);
            setDescription(existingForm.description);
            setQuestions(existingForm.questions);
            setShowTemplates(false);
        }
    }, [existingForm]);

    const handleTemplateSelect = (template: Form) => {
        setTitle(template.title);
        setDescription(template.description);
        setQuestions(template.questions);
        setShowTemplates(false);
    };

    const addQuestion = () => {
        setQuestions([...questions, { id: `q-${Date.now()}`, text: '', type: QuestionType.TEXT, required: false }]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        if (field === 'type' && value !== QuestionType.RADIO && value !== QuestionType.CHECKBOX) {
            newQuestions[index].options = [];
        }
        setQuestions(newQuestions);
    };

    const updateQuestionOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options![oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestionOption = (qIndex: number) => {
        const newQuestions = [...questions];
        if (!newQuestions[qIndex].options) {
            newQuestions[qIndex].options = [];
        }
        newQuestions[qIndex].options!.push('');
        setQuestions(newQuestions);
    };

    const removeQuestionOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options!.splice(oIndex, 1);
        setQuestions(newQuestions);
    };
    
    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };
    
    const saveForm = async () => {
        if (!title) {
            alert('フォームのタイトルは必須です。');
            return;
        }
        
        try {
            const formData = {
                title,
                description,
                questions,
                createdBy: user.email,
            };
            
            if (existingForm) {
                const updatedForm = await formsApi.update(existingForm.id, formData);
                dispatch({ type: 'UPDATE_FORM', payload: updatedForm });
            } else {
                const newForm = await formsApi.create(formData);
                dispatch({ type: 'ADD_FORM', payload: newForm });
            }
            
            navigate('/');
        } catch (error) {
            console.error('Failed to save form:', error);
            alert('フォームの保存に失敗しました。');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>ダッシュボードに戻る</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{existingForm ? 'フォーム編集' : '新しいフォーム作成'}</h2>
            
            {showTemplates && !existingForm && (
                <SchoolTemplates onSelectTemplate={handleTemplateSelect} />
            )}
            
            {!showTemplates && (
                <div className="mb-4">
                    <button 
                        onClick={() => setShowTemplates(true)} 
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                        ← テンプレートから選択
                    </button>
                </div>
            )}
            
            <div className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">フォームタイトル</label>
                        <input id="form-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                    </div>
                    <div>
                        <label htmlFor="form-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-200">説明</label>
                        <textarea id="form-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3}/>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">質問</h3>
                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-start space-x-4">
                                    <div className="flex-grow space-y-3">
                                        <input type="text" placeholder="質問文" value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                        <div className="flex items-center space-x-4">
                                            <select value={q.type} onChange={(e) => updateQuestion(qIndex, 'type', e.target.value as QuestionType)} className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                <option value={QuestionType.TEXT}>テキスト</option>
                                                <option value={QuestionType.TEXTAREA}>テキストエリア</option>
                                                <option value={QuestionType.RADIO}>ラジオボタン</option>
                                            </select>
                                             <div className="flex items-center">
                                                <input id={`required-${q.id}`} type="checkbox" checked={q.required} onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                                <label htmlFor={`required-${q.id}`} className="ml-2 text-sm text-gray-600 dark:text-gray-300">必須</label>
                                            </div>
                                        </div>
                                         {q.type === QuestionType.RADIO && (
                                            <div className="pl-4 space-y-2">
                                                {q.options?.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center space-x-2">
                                                        <input type="text" value={opt} placeholder={`選択肢 ${oIndex + 1}`} onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)} className="flex-grow p-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                                        <button onClick={() => removeQuestionOption(qIndex, oIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addQuestionOption(qIndex)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">選択肢を追加</button>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-6 h-6"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={addQuestion} className="mt-6 flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold py-2 px-4 border-2 border-dashed border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition">
                        <PlusIcon className="w-5 h-5"/>
                        <span>質問を追加</span>
                    </button>
                </div>
                
                 <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={saveForm} className="bg-green-600 text-white py-2 px-8 rounded-lg font-semibold hover:bg-green-700 transition duration-300">フォームを保存</button>
                </div>
            </div>
        </div>
    );
};

// --- ROUTING COMPONENTS ---
const AdminRoutes: React.FC<Omit<AppState, 'loading'|'error'> & { dispatch: React.Dispatch<Action> }> = ({ user, forms, submissions, dispatch }) => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard forms={forms} submissions={submissions} />} />
            <Route path="/new" element={<FormBuilder user={user!} dispatch={dispatch} forms={forms} />} />
            <Route path="/edit/:formId" element={<FormBuilder user={user!} dispatch={dispatch} forms={forms} />} />
            <Route path="/submissions/:formId" element={<ViewSubmissions forms={forms} submissions={submissions} />} />
            <Route path="/checkin" element={<CheckinManager forms={forms} submissions={submissions} />} />
        </Routes>
    );
}

const UserRoutes: React.FC<Omit<AppState, 'loading'|'error'> & { dispatch: React.Dispatch<Action> }> = ({ user, forms, dispatch }) => {
    return (
        <Routes>
            <Route path="/" element={<UserDashboard forms={forms} />} />
            <Route path="/form/:formId" element={<FillForm forms={forms} user={user!} dispatch={dispatch} />} />
        </Routes>
    );
};


// --- MAIN APP COMPONENT ---

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load user from localStorage
        const storedStateJSON = localStorage.getItem('form-builder-state');
        let user = null;
        if (storedStateJSON) {
          try {
            const storedState = JSON.parse(storedStateJSON);
            user = storedState.user || null;
          } catch (error) {
            console.error("Failed to parse localStorage:", error);
          }
        }
        
        // Load forms and submissions from API
        const [forms, submissions] = await Promise.all([
          formsApi.getAll().catch(() => initialForms), // Fallback to initial forms if API fails
          submissionsApi.getAll().catch(() => [])
        ]);
        
        dispatch({ type: 'SET_STATE', payload: { user, forms, submissions } });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Failed to load initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'データの読み込みに失敗しました。' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    // Persist state to localStorage on change
    if (!state.loading) {
      const stateToSave = { user: state.user, forms: state.forms, submissions: state.submissions };
      localStorage.setItem('form-builder-state', JSON.stringify(stateToSave));
    }
  }, [state.user, state.forms, state.submissions, state.loading]);

  const handleLogin = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    const navigate = useNavigate();
    navigate('/');
  };
  
  if (state.loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner size="lg" />
        </div>
    );
  }

  const AppContent = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };
    
    return (
       <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {state.user ? (
                <>
                    <Header user={state.user} onLogout={handleLogout} title="SGformer" />
                    <main>
                        {state.user.role === 'admin' ? 
                            <AdminRoutes {...state} dispatch={dispatch} /> : 
                            <UserRoutes {...state} dispatch={dispatch} />
                        }
                    </main>
                </>
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </div>
    );
  }

  return (
    <HashRouter>
        <AppContent />
    </HashRouter>
  );
}

export default App;
