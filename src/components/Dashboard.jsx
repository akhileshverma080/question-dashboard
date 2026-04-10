import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Loader2, LayoutGrid, List, Moon, Sun, Download } from 'lucide-react';
import { fetchQuestions } from '../utils/csvParser';
import { generatePDF } from '../utils/pdfGenerator';
import QuestionCard from './QuestionCard';

const EXAM_OPTIONS = [
    { label: 'Prelims', url: '/master_prelims.csv', type: 'Prelims' },
    { label: 'GS Paper 1', url: '/master_mains_paper1.csv', type: 'GS Paper 1' },
    { label: 'GS Paper 2', url: '/master_mains_paper2.csv', type: 'GS Paper 2' },
    { label: 'GS Paper 3', url: '/master_mains_paper3.csv', type: 'GS Paper 3' },
    { label: 'Essay', url: '/upsc_cse_mains_essay_questions.csv', type: 'Essay' },
];

const Dashboard = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

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
    const [isExporting, setIsExporting] = useState(false);

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

    const handleExportPDF = () => {
        if (displayedQuestions.length === 0) {
            alert("No questions to export!");
            return;
        }
        setIsExporting(true);
        setTimeout(async () => {
            await generatePDF(displayedQuestions);
            setIsExporting(false);
        }, 50); // Delay to allow spinner to paint
    };

    return (
        <div className="min-h-screen bg-theme-bg p-4 md:p-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-theme-text tracking-tight transition-colors duration-200">
                            {randomModeActive ? `${randomBank.label} Random Practice` : `${selectedExam.label} Question Bank`}
                        </h1>
                        <p className="mt-2 text-theme-text opacity-70 mb-6 transition-colors duration-200">
                            Search and analyze previous year questions.
                        </p>
                        
                        {/* Exam Selector */}
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {EXAM_OPTIONS.map((exam) => (
                                <button
                                    key={exam.label}
                                    onClick={() => handleExamChange(exam)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${selectedExam.label === exam.label ? 'bg-theme-accent text-theme-btn-text shadow-md' : 'bg-theme-card text-theme-text ring-1 ring-theme-text/10 opacity-80 hover:opacity-100'}`}
                                >
                                    {exam.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full bg-theme-card text-theme-text ring-1 ring-theme-text/10 shadow-sm hover:opacity-80 transition-colors duration-200"
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </header>

                {/* Practice Mode UI */}
                <div className="bg-theme-card p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors duration-200 ring-1 ring-theme-text/10">
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto overflow-x-auto">
                        <span className="font-semibold text-theme-text whitespace-nowrap">Practice Mode:</span>
                        <input 
                            type="number" 
                            min="1"
                            placeholder="No. of questions" 
                            className="block w-40 px-3 py-2 bg-theme-bg text-theme-text rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent transition-colors duration-200"
                            value={randomN}
                            onChange={(e) => setRandomN(e.target.value)}
                        />
                        <select
                            className="block w-40 px-3 py-2 bg-theme-bg text-theme-text rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent transition-colors duration-200"
                            value={randomBank.label}
                            onChange={(e) => setRandomBank(EXAM_OPTIONS.find(o => o.label === e.target.value))}
                        >
                            {EXAM_OPTIONS.map(exam => <option key={exam.label} value={exam.label}>{exam.label}</option>)}
                        </select>
                        <button 
                            onClick={handleRandomize}
                            className="whitespace-nowrap px-4 py-2 bg-theme-btn text-theme-btn-text text-sm font-medium rounded-lg hover:opacity-90 transition-colors duration-200"
                        >
                            Select Random Questions
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        {randomModeActive && (
                            <button 
                                onClick={() => setRandomModeActive(false)}
                                className="whitespace-nowrap text-sm font-medium text-theme-accent hover:opacity-80 underline transition-colors duration-200"
                            >
                                Clear Practice Mode
                            </button>
                        )}
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting || displayedQuestions.length === 0}
                            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-theme-accent text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors duration-200"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {isExporting ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className={`bg-theme-card p-4 rounded-xl shadow-sm mb-8 sticky top-4 z-10 backdrop-blur-md ring-1 ring-theme-text/10 transition-colors duration-200 ${randomModeActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-1/2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-theme-text opacity-50" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 bg-theme-bg text-theme-text rounded-lg leading-5 focus:outline-none focus:ring-2 focus:ring-theme-accent sm:text-sm transition-colors duration-200"
                                placeholder="Search by keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent sm:text-sm rounded-lg transition-colors duration-200"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                                ))}
                            </select>

                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent sm:text-sm rounded-lg transition-colors duration-200"
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
                        <div className="text-sm text-theme-text opacity-70 transition-colors duration-200">
                            Showing {displayedQuestions.length} questions
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting || displayedQuestions.length === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-theme-accent bg-theme-accent/10 rounded-lg hover:bg-theme-accent/20 disabled:opacity-50 transition-colors duration-200 mr-2"
                                title="Export current view to PDF"
                            >
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                Export PDF
                            </button>

                            <span className="text-sm text-theme-text opacity-70 mr-2 transition-colors duration-200">Layout:</span>
                            <div className="flex bg-theme-bg p-1 rounded-lg transition-colors duration-200">
                                <button
                                    onClick={() => setIsGridView(false)}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${!isGridView ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-text opacity-50 hover:opacity-100'}`}
                                    title="List View"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsGridView(true)}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${isGridView ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-text opacity-50 hover:opacity-100'}`}
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
                                    className="ml-4 text-theme-accent hover:opacity-80 font-medium text-xs uppercase transition-colors duration-200"
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
                            <Loader2 className="h-12 w-12 text-theme-accent animate-spin" />
                            <span className="ml-3 text-lg text-theme-text opacity-70 transition-colors duration-200">Loading questions...</span>
                        </div>
                    ) : displayedQuestions.length > 0 ? (
                        <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 gap-6"}>
                            {displayedQuestions.map((q, idx) => (
                                <QuestionCard key={idx} question={q} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-theme-card rounded-xl border border-theme-text/20 border-dashed transition-colors duration-200">
                            <Filter className="mx-auto h-12 w-12 text-theme-text opacity-50" />
                            <h3 className="mt-2 text-sm font-medium text-theme-text">No questions found</h3>
                            <p className="mt-1 text-sm text-theme-text opacity-70">
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
