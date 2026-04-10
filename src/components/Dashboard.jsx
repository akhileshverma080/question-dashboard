import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Loader2, LayoutGrid, List } from 'lucide-react';
import { fetchQuestions } from '../utils/csvParser';
import QuestionCard from './QuestionCard';

const EXAM_OPTIONS = [
    { label: 'Prelims', url: '/master_prelims.csv', type: 'Prelims' },
    { label: 'GS Paper 1', url: '/master_mains_paper1.csv', type: 'GS Paper 1' },
    { label: 'GS Paper 2', url: '/master_mains_paper2.csv', type: 'GS Paper 2' },
    { label: 'GS Paper 3', url: '/master_mains_paper3.csv', type: 'GS Paper 3' },
    { label: 'Essay', url: '/upsc_cse_mains_essay_questions.csv', type: 'Essay' },
];

const Dashboard = () => {
    const [selectedExam, setSelectedExam] = useState(EXAM_OPTIONS[0]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isGridView, setIsGridView] = useState(false);
    
    // Practice Mode State
    const [randomModeActive, setRandomModeActive] = useState(false);
    const [randomN, setRandomN] = useState('');
    const [randomBank, setRandomBank] = useState(EXAM_OPTIONS[0]);
    const [randomizedQuestions, setRandomizedQuestions] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchQuestions(selectedExam.url, selectedExam.type);
            setQuestions(data);
            setLoading(false);
        };
        loadData();
    }, [selectedExam]);

    const handleExamChange = (exam) => {
        setSelectedExam(exam);
        setSearchTerm('');
        setSelectedYear('All');
        setSelectedCategory('All');
        setRandomModeActive(false);
    };

    const handleRandomize = async () => {
        const n = parseInt(randomN);
        if (!n || n <= 0) {
            alert("Please enter a valid number of questions greater than 0");
            return;
        }
        
        setLoading(true);
        const rawData = await fetchQuestions(randomBank.url, randomBank.type);
        
        let pool = [...rawData];
        let selected = [];
        
        if (n >= pool.length) {
            selected = pool;
            alert(`Only ${pool.length} questions available in ${randomBank.label}.`);
        } else {
            for (let i = 0; i < n; i++) {
                const randIdx = Math.floor(Math.random() * pool.length);
                selected.push(pool[randIdx]);
                pool.splice(randIdx, 1);
            }
        }
        
        setRandomizedQuestions(selected);
        setRandomModeActive(true);
        setLoading(false);
    };

    // Extract unique filter options
    const years = useMemo(() => ['All', ...new Set(questions.map(q => q.year).filter(Boolean))].sort().reverse(), [questions]);
    const categories = useMemo(() => ['All', ...new Set(questions.map(q => q.question_category).filter(Boolean))].sort(), [questions]);

    // Filter logic
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = (
                q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.question_number?.toString().includes(searchTerm)
            );
            const matchesYear = selectedYear === 'All' || q.year === selectedYear;
            const matchesCategory = selectedCategory === 'All' || q.question_category === selectedCategory;

            return matchesSearch && matchesYear && matchesCategory;
        });
    }, [questions, searchTerm, selectedYear, selectedCategory]);

    const displayedQuestions = randomModeActive ? randomizedQuestions : filteredQuestions;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        {randomModeActive ? `${randomBank.label} Random Practice` : `${selectedExam.label} Question Bank`}
                    </h1>
                    <p className="mt-2 text-gray-600 mb-6">
                        Search and analyze previous year questions.
                    </p>
                    
                    {/* Exam Selector */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {EXAM_OPTIONS.map((exam) => (
                            <button
                                key={exam.label}
                                onClick={() => handleExamChange(exam)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedExam.label === exam.label ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {exam.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Practice Mode UI */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-purple-50">
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto overflow-x-auto">
                        <span className="font-semibold text-purple-900 whitespace-nowrap">Practice Mode:</span>
                        <input 
                            type="number" 
                            min="1"
                            placeholder="No. of questions" 
                            className="block w-40 px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            value={randomN}
                            onChange={(e) => setRandomN(e.target.value)}
                        />
                        <select
                            className="block w-40 px-3 py-2 border border-purple-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            value={randomBank.label}
                            onChange={(e) => setRandomBank(EXAM_OPTIONS.find(o => o.label === e.target.value))}
                        >
                            {EXAM_OPTIONS.map(exam => <option key={exam.label} value={exam.label}>{exam.label}</option>)}
                        </select>
                        <button 
                            onClick={handleRandomize}
                            className="whitespace-nowrap px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
                        >
                            Select Random Questions
                        </button>
                    </div>
                    {randomModeActive && (
                        <button 
                            onClick={() => setRandomModeActive(false)}
                            className="whitespace-nowrap text-sm font-medium text-purple-600 hover:text-purple-800 underline mt-2 md:mt-0"
                        >
                            Clear Practice Mode
                        </button>
                    )}
                </div>

                {/* Controls */}
                <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-10 backdrop-blur-md bg-opacity-90 ${randomModeActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-1/2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Search by keyword or question number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                                ))}
                            </select>

                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat === 'All' ? 'All Subjects' : cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {displayedQuestions.length} questions
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 mr-2">Layout:</span>
                            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => setIsGridView(false)}
                                    className={`p-1.5 rounded-md transition-all ${!isGridView ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="List View"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsGridView(true)}
                                    className={`p-1.5 rounded-md transition-all ${isGridView ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>

                            {(selectedYear !== 'All' || selectedCategory !== 'All' || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedYear('All');
                                        setSelectedCategory('All');
                                        setRandomModeActive(false);
                                    }}
                                    className="ml-4 text-blue-600 hover:text-blue-800 font-medium text-xs uppercase"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div >

                {/* Content */}
                {
                    loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                            <span className="ml-3 text-lg text-gray-600">Loading questions...</span>
                        </div>
                    ) : displayedQuestions.length > 0 ? (
                        <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 gap-6"}>
                            {displayedQuestions.map((q, idx) => (
                                <QuestionCard key={idx} question={q} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                            <Filter className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default Dashboard;
