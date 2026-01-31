document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const dashboard = document.getElementById('dashboard');
    const songCountSlider = document.getElementById('song-count-slider');
    const songCountVal = document.getElementById('song-count-val');
    const nbpiScore = document.getElementById('nbpi-score');
    const resultTableBody = document.querySelector('#result-table tbody');
    const downloadBtn = document.getElementById('download-btn');
    const levelCheckboxes = document.querySelectorAll('input[type="checkbox"]');

    // State
    let rawData = [];
    let processedData = [];

    // --- Event Listeners ---

    // File Upload (Click)
    dropZone.addEventListener('click', () => fileInput.click());

    // File Upload (Change)
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // Controls
    songCountSlider.addEventListener('input', (e) => {
        songCountVal.textContent = e.target.value;
        updateUI();
    });

    levelCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateUI);
    });

    downloadBtn.addEventListener('click', downloadCSV);

    // --- Core Logic ---

    function handleFile(file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    rawData = results.data;
                    dashboard.classList.remove('hidden');
                    // Scroll to dashboard
                    setTimeout(() => {
                        dashboard.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                    updateUI();
                } else {
                    alert('無効なCSV、または空のファイルです。');
                }
            },
            error: function(err) {
                alert('CSVの解析エラー: ' + err.message);
            }
        });
    }

    function processData() {
        // Get active levels
        const activeLevels = Array.from(levelCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));
        
        // Filter and Transform
        // Python logic:
        // df = df[(df["難易度(12段階)"].isin(level))].sort_values(by="BPI", ascending=False).replace([np.inf, -np.inf], np.nan).dropna()
        // df["楽曲名"] = df.apply(diff_to_name, axis=1)

        let filtered = rawData.filter(row => {
            const level = parseInt(row['難易度(12段階)']);
            const bpi = parseFloat(row['BPI']);
            
            // Check level
            if (!activeLevels.includes(level)) return false;
            
            // Check BPI is valid number (not NaN, not Inf)
            if (isNaN(bpi) || !isFinite(bpi)) return false;
            
            return true;
        });

        // Map data (add suffix to title) and format
        let mapped = filtered.map(row => {
            return {
                title: formatTitle(row['楽曲名'], row['難易度']),
                bpi: parseFloat(row['BPI'])
            };
        });

        // Sort by BPI Descending
        mapped.sort((a, b) => b.bpi - a.bpi);

        return mapped;
    }

    function formatTitle(title, diff) {
        if (diff === 'HYPER') return title + '(H)';
        if (diff === 'ANOTHER') return title + '(A)';
        if (diff === 'LEGGENDARIA') return title + '(L)'; // Guessing key for L, Python said 'else' -> (L) but typically LEGGENDARIA
        // Fallback based on Python code:
        // else: return title + "(L)"
        // But let's be safer, maybe just check excludes
        if (diff !== 'HYPER' && diff !== 'ANOTHER') return title + '(L)';
        return title;
    }

    function calculateNBPI(data, count) {
        // Python logic:
        // n = len(l) (which is count here)
        // k = math.log2(n)
        // tmp = sum([i**k for i in l]) / n
        // return tmp**(1/k)

        const sliced = data.slice(0, count).map(d => d.bpi);
        const n = sliced.length;
        
        if (n === 0) return 0;

        const k = Math.log2(n);
        let sum = 0;
        
        for (let val of sliced) {
            sum += Math.pow(val, k);
        }
        
        const tmp = sum / n;
        return Math.pow(tmp, 1/k);
    }

    function updateUI() {
        const count = parseInt(songCountSlider.value);
        processedData = processData();
        
        const nbpi = calculateNBPI(processedData, count);
        
        // Update Score
        // Animate counter effect? For now just set it.
        nbpiScore.textContent = nbpi.toFixed(2);

        // Update Table
        renderTable(processedData.slice(0, count));
    }

    function renderTable(data) {
        resultTableBody.innerHTML = '';
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td>${row.title}</td>
                <td>${row.bpi.toFixed(2)}</td>
            `;
            // Add animation delay for stagger
            tr.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`;
            tr.style.opacity = '0'; // Start hidden for animation
            resultTableBody.appendChild(tr);
        });
    }

    function downloadCSV() {
        const count = parseInt(songCountSlider.value);
        const dataToExport = processedData.slice(0, count).map(row => {
            return {
                "楽曲名": row.title,
                "BPI": row.bpi.toFixed(4)
            };
        });
        
        // Convert to CSV using PapaParse
        const csv = Papa.unparse(dataToExport);
        
        // Create Blob and Link
        // Add BOM for Excel compatibility (Shift_JIS is tricky in JS, UTF-8 with BOM is usually better for modern Excel)
        const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'hbpi.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
