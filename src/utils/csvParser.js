import Papa from 'papaparse';

export const fetchQuestions = async (fileUrl = '/master_prelims.csv', examType = 'Prelims') => {
    try {
        const response = await fetch(fileUrl);
        const csv = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    let parsedData = results.data;
                    
                    if (examType === 'Essay') {
                        parsedData = parsedData.map(row => ({
                            year: row.Year,
                            question_number: row['Topic No.'],
                            question_text: row['Essay Topic'],
                            question_category: 'Essay',
                            sub_category: row.Section,
                            source: '',
                        }));
                    } else if (examType.startsWith('GS Paper')) {
                        parsedData = parsedData.map(row => ({
                            year: row.year,
                            question_number: row.question_number,
                            question_text: row.question_text,
                            question_category: row.question_category,
                            sub_category: row.sub_category,
                            source: row.marks ? `${row.marks} Marks` : '',
                        }));
                    }
                    
                    resolve(parsedData);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching CSV:', error);
        return [];
    }
};
