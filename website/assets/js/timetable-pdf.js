async function loadPdfLogoDataUrl() {
    try {
        const response = await fetch('assets/Images/logo.png');
        if (!response.ok) return null;

        const blob = await response.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('Unable to load PDF logo:', error);
        return null;
    }
}

window.generateTimetablePdf = async function () {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        window.print();
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const logoDataUrl = await loadPdfLogoDataUrl();
    let y = 52;

    if (logoDataUrl) {
        pdf.addImage(logoDataUrl, 'PNG', margin, 18, 42, 42);
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Blockbuster Theatre Timetable', margin + (logoDataUrl ? 54 : 0), y);
    y += 26;

    const weekText = document.getElementById('weekCommencingLabel')?.textContent || 'Schedule for Week Commencing';
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(weekText, margin + (logoDataUrl ? 54 : 0), y);
    y += 26;

    const cards = [...document.querySelectorAll('.movie-card')];
    if (!cards.length) {
        pdf.text('No timetable entries available.', margin, y);
        pdf.save('blockbuster-timetable.pdf');
        return;
    }

    cards.forEach((card) => {
        const title = card.querySelector('.movie-title')?.textContent?.trim() || 'Untitled movie';
        const genre = card.querySelector('.badge-genre')?.textContent?.trim() || '';
        const showtimes = [...card.querySelectorAll('.showtime-btn')].map((btn) => {
            const fullText = btn.textContent.replace(/\s+/g, ' ').trim();
            const time = fullText.split('Screen')[0].trim();
            const screen = btn.querySelector('span')?.textContent?.trim() || 'Screen';
            return { time, screen };
        });

        const titleLines = pdf.splitTextToSize(title, 360);
        const meta = genre ? `${genre} • 2D / 4K Laser` : '2D / 4K Laser';
        const blockHeight = 26 + (titleLines.length * 16) + 18 + 14 + (showtimes.length * 13) + (showtimes.length * 4) + 10;

        if (y + blockHeight > 760) {
            pdf.addPage();
            y = 50;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.text(titleLines, margin, y);
        y += titleLines.length * 16;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(meta, margin, y);
        y += 18;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.text('Showtimes', margin, y);
        y += 14;

        showtimes.forEach(({ time, screen }) => {
            const line = `• ${time}  ${screen}`;
            const timeLines = pdf.splitTextToSize(line, 360);

            if (y + (timeLines.length * 13) > 790) {
                pdf.addPage();
                y = 50;
            }

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(timeLines, margin + 12, y);
            y += timeLines.length * 13 + 4;
        });

        y += 10;
    });

    pdf.save(`blockbuster-timetable-${selectedDay.toLowerCase()}.pdf`);
};
