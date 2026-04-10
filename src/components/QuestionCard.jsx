import React from 'react';

const QuestionCard = ({ question, isZenMode }) => {
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
        <div className={`bg-theme-card rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 ring-1 ring-theme-text/10 flex flex-col h-full ${isZenMode ? 'py-8' : ''}`}>
            {!isZenMode && (
                <div className="flex justify-between items-start mb-4 gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-tag-bg text-theme-tag ring-1 ring-theme-tag border-transparent">
                        Year: {question.year}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-tag-bg text-theme-tag ring-1 ring-theme-tag border-transparent">
                        {question.question_category}
                    </span>
                </div>
            )}

            <div className={`mb-4 text-theme-text leading-relaxed flex-grow font-serif transition-colors duration-200 ${isZenMode ? 'text-lg md:text-xl' : 'text-base'}`}>
                <span className="font-bold mr-2 opacity-60">Q{question.question_number}.</span>
                {formatText(question.question_text)}
            </div>

            <div className={`mt-4 pt-4 flex items-center text-theme-text opacity-70 transition-colors duration-200 ${isZenMode ? 'border-none justify-end' : 'justify-between border-t border-theme-text/10 text-sm'}`}>
                {!isZenMode && (
                    <span className="italic">{question.sub_category || 'General'}</span>
                )}
                {question.source && (
                    <span className={`bg-theme-text/5 px-2 py-1 rounded transition-colors duration-200 ${isZenMode ? 'text-sm font-medium opacity-100' : 'text-xs'}`}>{question.source}</span>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
