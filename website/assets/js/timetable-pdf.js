import '../fonts/Oswald-Regular-normal.js?v=2';
import '../fonts/Oswald-Bold-bold.js?v=2';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Blockbuster Theatre brand palette (matches assets/stylesheets/main.css custom properties).
const PDF_COLORS = {
    accentRed: '#ff334b',
    accentRedDark: '#B31E35',
    accentGold: '#fbbf24',
    ink: '#181a24',
    textMuted: '#6b7280',
    rowAlt: '#fdeef0',
    rowBase: '#ffffff',
    headerFill: '#181a24',
    border: '#e7c8cd'
};

async function loadPdfLogoDataUrl() {
    try {
        const response = await fetch('assets/images/logo/png/logo-180.png');
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

// Builds a { title, genre, rows: [[times...], ...], columnCount } model for a movie
// spanning every day of the week, falling back to DOM scraping (current day only)
// if the full week data isn't available in this scope.
function buildMovieWeekModel(movie) {
    const title = movie.title || 'Untitled movie';
    const genre = (Array.isArray(movie.genres) && movie.genres.length)
        ? movie.genres.join(' / ')
        : (movie.genre || 'General');

    const dayTimes = DAYS.map((day) => {
        const times = (movie.showtimes && movie.showtimes[day]) || [];
        return [...new Set(times)];
    });

    const columnCount = Math.max(1, ...dayTimes.map((times) => times.length));
    return { title, genre, dayTimes, columnCount };
}

function buildModelsFromDom() {
    return [...document.querySelectorAll('.movie-card')].map((card) => {
        const title = card.querySelector('.movie-title')?.textContent?.trim() || 'Untitled movie';
        const genre = card.querySelector('.badge-genre')?.textContent?.trim() || 'General';
        const times = [...card.querySelectorAll('.showtime-btn')].map((btn) =>
            btn.textContent.replace(/\s+/g, ' ').trim().split('Screen')[0].trim()
        );

        const dayTimes = DAYS.map((day) => (day === selectedDay ? times : []));
        const columnCount = Math.max(1, times.length);
        return { title, genre, dayTimes, columnCount };
    });
}

function getMovieWeekModels() {
    if (typeof timetableMovies !== 'undefined' && Array.isArray(timetableMovies) && timetableMovies.length) {
        return timetableMovies
            .filter((movie) => movie.visible !== false && movie.isComingSoon !== true)
            .map(buildMovieWeekModel)
            .filter((model) => model.dayTimes.some((times) => times.length))
            .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    }

    return buildModelsFromDom();
}

function addFooter(pdf, pageWidth, pageHeight, margin, pageNumber, totalPages) {
    pdf.setDrawColor(PDF_COLORS.border);
    pdf.setLineWidth(0.75);
    pdf.line(margin, pageHeight - 46, pageWidth - margin, pageHeight - 46);

    pdf.setFont('Oswald-Regular', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(PDF_COLORS.textMuted);
    pdf.text('Blockbuster Theatre  •  Box Office: 028 7147 2869', margin, pageHeight - 30);
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 30, { align: 'right' });
}

// Draws a single movie's title bar + week table, returning the new y cursor.
// Handles pagination mid-table by re-drawing the header row on the next page.
function drawMovieTable(pdf, model, y, layout) {
    const { margin, pageWidth, pageHeight, dayColWidth, contentWidth } = layout;
    const tableWidth = contentWidth;
    const showingColWidth = (tableWidth - dayColWidth) / model.columnCount;
    const rowHeight = 20;
    const headerHeight = 22;
    const titleBarHeight = 26;

    // Treat the whole movie block (title bar + header row + 7 day rows) as one
    // atomic unit so a table never gets split across a page boundary — if it
    // doesn't fully fit in the remaining space, start it on a fresh page instead.
    const tableTotalHeight = titleBarHeight + headerHeight + (DAYS.length * rowHeight);
    const bottomLimit = pageHeight - 60;

    if (y + tableTotalHeight > bottomLimit) {
        if (y > 90) {
            pdf.addPage();
        }
        y = 56;
    }

    const drawHeaderRow = () => {
        pdf.setFillColor(PDF_COLORS.headerFill);
        pdf.rect(margin, y, tableWidth, headerHeight, 'F');

        pdf.setFont('Oswald-Bold', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor('#ffffff');
        pdf.text('DAY', margin + 10, y + headerHeight / 2 + 3);

        for (let col = 0; col < model.columnCount; col += 1) {
            const colX = margin + dayColWidth + col * showingColWidth;
            pdf.text(`SHOWING ${col + 1}`, colX + showingColWidth / 2, y + headerHeight / 2 + 3, { align: 'center' });
        }

        y += headerHeight;
    };

    // Movie title bar
    pdf.setFillColor(PDF_COLORS.accentRedDark);
    pdf.rect(margin, y, tableWidth, titleBarHeight, 'F');
    pdf.setFont('Oswald-Bold', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor('#ffffff');
    const titleLines = pdf.splitTextToSize(model.title.toUpperCase(), tableWidth - 200);
    pdf.text(titleLines[0], margin + 10, y + titleBarHeight / 2 + 4.5);

    pdf.setFont('Oswald-Regular', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor('#ffd7dc');
    pdf.text(model.genre, margin + tableWidth - 10, y + titleBarHeight / 2 + 4.5, { align: 'right' });
    y += titleBarHeight;

    drawHeaderRow();

    DAYS.forEach((day, rowIndex) => {
        const isAlt = rowIndex % 2 === 1;
        pdf.setFillColor(isAlt ? PDF_COLORS.rowAlt : PDF_COLORS.rowBase);
        pdf.rect(margin, y, tableWidth, rowHeight, 'F');
        pdf.setDrawColor(PDF_COLORS.border);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, y, tableWidth, rowHeight);

        pdf.setFont('Oswald-Bold', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(PDF_COLORS.accentRedDark);
        pdf.text(day.toUpperCase(), margin + 10, y + rowHeight / 2 + 3);

        const times = model.dayTimes[rowIndex];
        pdf.setFont('Oswald-Regular', 'normal');
        pdf.setFontSize(9.5);

        for (let col = 0; col < model.columnCount; col += 1) {
            const colX = margin + dayColWidth + col * showingColWidth;
            pdf.setDrawColor(PDF_COLORS.border);
            pdf.line(colX, y, colX, y + rowHeight);

            const time = times[col];
            pdf.setTextColor(time ? PDF_COLORS.ink : PDF_COLORS.textMuted);
            pdf.text(time || '—', colX + showingColWidth / 2, y + rowHeight / 2 + 3, { align: 'center' });
        }

        y += rowHeight;
    });

    pdf.setDrawColor(PDF_COLORS.accentRedDark);
    pdf.setLineWidth(1.1);
    pdf.line(margin, y, margin + tableWidth, y);

    return y + 22;
}

window.generateTimetablePdf = async function () {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        window.print();
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    const layout = { margin, pageWidth, pageHeight, dayColWidth: 88, contentWidth };

    const logoDataUrl = await loadPdfLogoDataUrl();
    let y = 58;

    if (logoDataUrl) {
        pdf.addImage(logoDataUrl, 'PNG', margin, 24, 40, 40);
    }

    const textX = margin + (logoDataUrl ? 52 : 0);
    pdf.setFont('Oswald-Bold', 'bold');
    pdf.setFontSize(19);
    pdf.setTextColor(PDF_COLORS.ink);
    pdf.text('BLOCKBUSTER THEATRE', textX, y);

    pdf.setFont('Oswald-Regular', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(PDF_COLORS.accentRed);
    pdf.text('MOVIE TIMETABLE', textX, y + 16);
    y += 34;

    pdf.setDrawColor(PDF_COLORS.accentGold);
    pdf.setLineWidth(2);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 20;

    const weekText = document.getElementById('weekCommencingLabel')?.textContent || 'Schedule for Week Commencing';
    pdf.setFont('Oswald-Regular', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(PDF_COLORS.textMuted);
    pdf.text(weekText, margin, y);
    y += 24;

    const models = getMovieWeekModels();
    if (!models.length) {
        pdf.text('No timetable entries available.', margin, y);
        pdf.save('blockbuster-timetable.pdf');
        return;
    }

    models.forEach((model) => {
        y = drawMovieTable(pdf, model, y, layout);
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        addFooter(pdf, pageWidth, pageHeight, margin, page, totalPages);
    }

    const fileSuffix = typeof selectedDay !== 'undefined' ? `-${selectedDay.toLowerCase()}` : '';
    pdf.save(`blockbuster-timetable${fileSuffix}.pdf`);
};
