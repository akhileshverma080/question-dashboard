import Papa from 'papaparse';

export const fetchQuestions = async () => {
    try {
        const response = await fetch('/master_prelims.csv');
        const csv = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
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
