
import React, { useState, useEffect, useReducer } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon, ArrowLeftIcon } from './components/Icon';
import { QuestionType } from './types';
import type { User, Form, Question, Submission } from './types';

// --- MOCK DATA & CONSTANTS ---
const ADMIN_EMAIL = 'g-igasaki@shinko.ed.jp';
const ADMIN_PASSWORD = '20130101Aa';
const USER_EMAIL = 'user@example.com';

const initialForms: Form[] = [
  {
    id: 'form-1',
    title: 'コミュニティミートアップ参加確認',
    description: '四半期ごとのコミュニティミートアップにご参加ください。参加可能かどうかお知らせください！',
    createdBy: ADMIN_EMAIL,
    questions: [
      { id: 'q1', text: 'お名前', type: QuestionType.TEXT, required: true },
      { id: 'q2', text: 'メールアドレス', type: QuestionType.TEXT, required: true },
      { id: 'q3', text: '食事制限', type: QuestionType.TEXTAREA, required: false },
      { id: 'q4', text: 'Tシャツサイズ', type: QuestionType.RADIO, options: ['S', 'M', 'L', 'XL'], required: true },
    ],
  },
  {
    id: 'form-2',
    title: 'ワークショップフィードバック',
    description: 'ワークショップにご参加いただき、ありがとうございます。フィードバックをお聞かせください。',
    createdBy: ADMIN_EMAIL,
    questions: [
      { id: 'q5', text: 'どのワークショップに参加されましたか？', type: QuestionType.TEXT, required: true },
      { id: 'q6', text: '全体的な満足度', type: QuestionType.RADIO, options: ['非常に満足', '満足', '普通', '不満', '非常に不満'], required: true },
      { id: 'q7', text: '最も良かった点は？', type: QuestionType.TEXTAREA, required: false },
      { id: 'q8', text: '改善提案があれば教えてください', type: QuestionType.TEXTAREA, required: false },
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
  | { type: 'SET_STATE'; payload: Omit<AppState, 'loading'|'error'> };

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center w-full max-w-sm">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">AI フォームビルダー</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">ログインしてください</p>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <input
                            type="email"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={handleAdminLogin} 
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                        管理者としてログイン
                    </button>
                    <button 
                        onClick={handleUserLogin} 
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                    >
                        ユーザーとしてログイン
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">管理者: {ADMIN_EMAIL}</p>
            </div>
        </div>
    );
};

const DashboardCard: React.FC<{ form: Form; submissionCount: number; isAdmin: boolean }> = ({ form, submissionCount, isAdmin }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{form.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{form.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{form.questions.length} 質問</span>
                {isAdmin && <span>{submissionCount} 回答</span>}
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
             {isAdmin ? (
                <div className="flex justify-end space-x-3">
                     <Link to={`/submissions/${form.id}`} className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <EyeIcon className="w-4 h-4" />
                        <span>回答を表示</span>
                    </Link>
                    <Link to={`/edit/${form.id}`} className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <PencilIcon className="w-4 h-4" />
                        <span>編集</span>
                    </Link>
                </div>
            ) : (
                <Link to={`/form/${form.id}`} className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300">
                    フォームに回答
                </Link>
            )}
        </div>
    </div>
);

const AdminDashboard: React.FC<{ forms: Form[]; submissions: Submission[] }> = ({ forms, submissions }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">マイフォーム</h2>
                <Link to="/new" className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                    <PlusIcon className="w-5 h-5" />
                    <span>フォーム作成</span>
                </Link>
            </div>
            {forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <DashboardCard key={form.id} form={form} submissionCount={submissions.filter(s => s.formId === form.id).length} isAdmin={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">まだフォームがありません！</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">「フォーム作成」をクリックして始めましょう。</p>
                </div>
            )}
        </div>
    );
};

const UserDashboard: React.FC<{ forms: Form[] }> = ({ forms }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">利用可能なフォーム</h2>
            {forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <DashboardCard key={form.id} form={form} submissionCount={0} isAdmin={false} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">現在利用可能なフォームはありません。</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">後でまた確認してください。</p>
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        for (const q of form.questions) {
            if (q.required) {
                const answer = answers[q.id];
                if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                    alert(`質問「${q.text}」は必須です。`);
                    return;
                }
            }
        }

        dispatch({
            type: 'ADD_SUBMISSION',
            payload: {
                id: `sub-${Date.now()}`,
                formId: form.id,
                submittedBy: user.email,
                answers,
                submittedAt: new Date().toISOString(),
            }
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
             <div className="max-w-2xl mx-auto p-8 text-center">
                 <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">ありがとうございます！</h2>
                 <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">回答が記録されました。</p>
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
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">送信</button>
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

    useEffect(() => {
        if (existingForm) {
            setTitle(existingForm.title);
            setDescription(existingForm.description);
            setQuestions(existingForm.questions);
        }
    }, [existingForm]);

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
    
    const saveForm = () => {
        if (!title) {
            alert('フォームのタイトルは必須です。');
            return;
        }
        
        const form: Form = {
            id: existingForm?.id || `form-${Date.now()}`,
            title,
            description,
            questions,
            createdBy: user.email,
        };
        
        if (existingForm) {
            dispatch({ type: 'UPDATE_FORM', payload: form });
        } else {
            dispatch({ type: 'ADD_FORM', payload: form });
        }
        
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>ダッシュボードに戻る</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{existingForm ? 'フォーム編集' : '新しいフォーム作成'}</h2>
            
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
    // Simulate loading initial data
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
        const storedStateJSON = localStorage.getItem('form-builder-state');
        if (storedStateJSON) {
            const storedState = JSON.parse(storedStateJSON);
            const loadedState = {
                user: storedState.user || null,
                forms: storedState.forms && storedState.forms.length > 0 ? storedState.forms : initialForms,
                submissions: storedState.submissions || [],
            };
            dispatch({ type: 'SET_STATE', payload: loadedState });
        } else {
             dispatch({ type: 'SET_STATE', payload: { user: null, forms: initialForms, submissions: [] } });
        }
    } catch (error) {
        console.error("Failed to parse localStorage:", error);
        dispatch({ type: 'SET_STATE', payload: { user: null, forms: initialForms, submissions: [] } });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <Header user={state.user} onLogout={handleLogout} />
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
