import Papa from 'papaparse';

export const fetchQuestions = async () => {
    try {
        const response = await fetch('/master_prelims.csv');
        const reader = response.body.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value);

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
