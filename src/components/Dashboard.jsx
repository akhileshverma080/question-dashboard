import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { fetchQuestions } from '../utils/csvParser';
import QuestionCard from './QuestionCard';

const Dashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchQuestions();
            setQuestions(data);
            setLoading(false);
        };
        loadData();
    }, []);

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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Prelims Question Bank
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Search and analyze previous year questions.
                    </p>
                </header>

                {/* Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-10 backdrop-blur-md bg-opacity-90">
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

                    <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                        <span>Showing {filteredQuestions.length} questions</span>
                        {(selectedYear !== 'All' || selectedCategory !== 'All' || searchTerm) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedYear('All');
                                    setSelectedCategory('All');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <span className="ml-3 text-lg text-gray-600">Loading questions...</span>
                    </div>
                ) : filteredQuestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuestions.map((q, idx) => (
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
                )}
            </div>
        </div>
    );
};

export default Dashboard;
