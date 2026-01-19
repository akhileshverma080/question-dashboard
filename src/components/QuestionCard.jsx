import React from 'react';

const QuestionCard = ({ question }) => {
    // Function to preserve line breaks in question text
    const formatText = (text) => {
        if (!text) return null;

        // Insert newlines before options (a), (b), (c), (d) if they are inline
        // Pattern: Space + (letter)
        const formattedMeta = text.replace(/(\s)(\([a-d]\)(?=\s))/g, '\n$2');

        return formattedMeta.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Year: {question.year}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {question.question_category}
                </span>
            </div>

            <div className="mb-4 text-gray-800 text-base leading-relaxed flex-grow font-serif">
                <span className="font-bold mr-2 text-gray-500">Q{question.question_number}.</span>
                {formatText(question.question_text)}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                <span className="italic">{question.sub_category || 'General'}</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{question.source}</span>
            </div>
        </div>
    );
};

export default QuestionCard;
