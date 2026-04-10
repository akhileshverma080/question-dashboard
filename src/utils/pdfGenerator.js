import { jsPDF } from "jspdf";

export const generatePDF = async (questions) => {
    return new Promise((resolve) => {
        try {
            const doc = new jsPDF();
            const margin = 15;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const textWidth = pageWidth - margin * 2;
            
            let y = margin;
            
            // Header
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Practice Question Set", margin, y);
            y += 10;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(150, 150, 150);
            doc.text(`Total Questions: ${questions.length}  |  Generated directly from Dashboard`, margin, y);
            y += 15;

            questions.forEach((q, idx) => {
                // Formatting metadata
                const metaParts = [];
                if (q.year) metaParts.push(`Year: ${q.year}`);
                if (q.question_category) metaParts.push(q.question_category);
                if (q.sub_category) metaParts.push(q.sub_category);
                if (q.source) metaParts.push(`(${q.source})`);
                
                const metaText = metaParts.join(' • ');
                
                const qNum = `Q${idx + 1}. `;
                // Preserve formatting logic similar to QuestionCard for inline options
                let formattedText = (q.question_text || "").replace(/(\s)(\([a-d]\)(?=\s))/g, '\n$2');
                const fullText = qNum + formattedText;
                
                const questionTextLines = doc.splitTextToSize(fullText, textWidth);
                
                // Determine height needed: 5mm for meta, ~6mm per text line, 10mm padding.
                const requiredHeight = 5 + (questionTextLines.length * 6) + 10;
                
                // Keep together: ensure question fits on the remainder of the page
                if (y + requiredHeight >= pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                
                // Print meta
                doc.setFontSize(9);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(130, 130, 130);
                doc.text(metaText, margin, y);
                y += 6;
                
                // Print question body
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(20, 20, 20); // Dark gray
                doc.text(questionTextLines, margin, y);
                
                // 5mm per line spacing + 10mm bottom margin
                y += (questionTextLines.length * 5) + 10; 
            });
            
            doc.save("Practice_Questions.pdf");
            resolve(true);
        } catch (error) {
            console.error("PDF generation failed:", error);
            resolve(false);
        }
    });
};
