document.addEventListener('DOMContentLoaded', () => {
    // 導航連結
    const loginBtnListItem = document.getElementById('loginBtnListItem'); // Login button LI
    const loginBtn = document.getElementById('loginBtn'); // Login button A
    const mainMenuItems = document.querySelectorAll('.main-menu-item'); // Other main menu items

    const batchUploadLink = document.getElementById('batchUploadLink');
    const dataAnalysisLink = document.getElementById('dataAnalysisLink');
    const accountSettingsLink = document.getElementById('accountSettingsLink');
    const logoutLink = document.getElementById('logoutLink'); // This is one of the mainMenuItems

    // 區塊
    const batchUploadSection = document.getElementById('batchUploadSection');
    const dataAnalysisSection = document.getElementById('dataAnalysisSection');
    const accountSettingsSection = document.getElementById('accountSettingsSection');

    // 上傳相關元素
    const essayUpload = document.getElementById('essayUpload');
    const imageUploadBtn = document.getElementById('imageUpload'); // Get reference to the new button
    const fileList = document.getElementById('fileList');
    const startCorrectionBtn = document.getElementById('startCorrection');
    const essayTableBody = document.querySelector('#essayTable tbody');
    const exportFeedbackBtn = document.getElementById('exportFeedback');
    const toggleAiFeedbackBtn = document.getElementById('toggleAiFeedbackBtn'); // Toggle button

    // 模態視窗相關元素
    const feedbackModal = document.getElementById('feedbackModal');
    const closeButton = document.querySelector('.close-button');
    const originalFeedbackTextarea = document.getElementById('originalFeedback');
    const correctedFeedbackTextarea = document.getElementById('correctedFeedback');
    const correctedGradeSelect = document.getElementById('correctedGrade');
    const correctedScoreInput = document.getElementById('correctedScore');
    const abilityScoreInputs = document.querySelectorAll('.ability-input'); // 新增能力指標輸入框
    const saveCorrectionBtn = document.getElementById('saveCorrection');

    // 數據分析相關元素
    const classSelect = document.getElementById('classSelect');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilter');
    const gradeDistributionChartCtx = document.getElementById('gradeDistributionChart').getContext('2d');
    const scoreTrendChartCtx = document.getElementById('scoreTrendChart').getContext('2d');
    const abilityScoreChartCtx = document.getElementById('abilityScoreChart').getContext('2d'); // 新增能力指標圖表
    const historyTableBody = document.querySelector('#historyTable tbody');
    const exportDataReportBtn = document.getElementById('exportDataReport');

    let currentEditingRow = null; // 用於儲存目前正在編輯的表格行
    let aiFeedbackVisible = false; // State for AI feedback visibility
    let isLoggedIn = false; // Simulate login state

    // --- Navbar Visibility Update ---
    function updateNavbarVisibility() {
        if (isLoggedIn) {
            if (loginBtnListItem) {
                loginBtnListItem.classList.add('menu-item-hidden');
                loginBtnListItem.classList.remove('menu-item-visible');
            }
            mainMenuItems.forEach(item => {
                item.classList.remove('menu-item-hidden');
                item.classList.add('menu-item-visible');
            });
        } else {
            if (loginBtnListItem) {
                loginBtnListItem.classList.remove('menu-item-hidden');
                loginBtnListItem.classList.add('menu-item-visible');
            }
            mainMenuItems.forEach(item => {
                item.classList.add('menu-item-hidden');
                item.classList.remove('menu-item-visible');
            });
            // When logged out, ensure no main section is active
            document.querySelectorAll('main section.active-section').forEach(s => s.classList.remove('active-section'));
            document.querySelectorAll('main section').forEach(s => s.classList.add('hidden-section'));
        }
    }

    // --- 導航功能 ---
    function showSection(sectionToShow) {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.remove('active-section');
            section.classList.add('hidden-section');
        });
        sectionToShow.classList.remove('hidden-section');
        sectionToShow.classList.add('active-section');
    }

    batchUploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(batchUploadSection);
    });

    dataAnalysisLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(dataAnalysisSection);
        renderCharts(); // 切換到數據分析頁面時重新渲染圖表
        loadHistoryData(); // 加載評分歷程數據
    });

    accountSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(accountSettingsSection);
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            isLoggedIn = true;
            updateNavbarVisibility();
            showSection(batchUploadSection); // Show default section after login
            alert('登入成功！'); 
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoggedIn = false;
            updateNavbarVisibility();
            alert('您已安全登出系統。');
            // Optional: Hide all main sections or show a logged-out home page
            // Already handled by updateNavbarVisibility's else block
        });
    }

    // --- 檔案上傳與顯示 ---
    let uploadedFiles = [];

    if (imageUploadBtn && essayUpload) {
        imageUploadBtn.addEventListener('click', () => {
            essayUpload.click(); // Programmatically click the hidden file input
        });
    }

    essayUpload.addEventListener('change', (event) => {
        fileList.innerHTML = ''; // 清空現有列表
        uploadedFiles = []; // Reset uploaded files array
        const files = Array.from(event.target.files);

        if (files.length > 0) {
            files.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.textContent = file.name; // Initial display
                fileList.appendChild(fileDiv);

                if (file.type.startsWith('image/')) {
                    // Handle image files
                    fileDiv.textContent = `圖片稿件 ${file.name} - 正在辨識中...`;
                    
                    setTimeout(() => {
                        const studentName = `圖片學生 ${Math.floor(Math.random() * 100) + 1}`;
                        const essayTitle = `我的圖片日記 ${Math.floor(Math.random() * 10) + 1}`;
                        const mockText = `這是從圖片 ${file.name} 辨識出的模擬文字內容。\n學生姓名：${studentName}\n作文題目：${essayTitle}\n內容：今天天氣真好，我們去了公園玩。公園裡有很多花草樹木，非常美麗。我畫了一幅畫，記錄下這美好的時刻。希望下次還能再來。`;
                        
                        const ocrResult = {
                            name: `ocr_result_for_${file.name.split('.')[0]}.txt`,
                            mockText: mockText,
                            isOcrResult: true,
                            originalFileName: file.name,
                            studentName: studentName, // Store for later use
                            essayTitle: essayTitle // Store for later use
                        };
                        uploadedFiles.push(ocrResult);
                        fileDiv.textContent = `[辨識完成] ${ocrResult.name} (原圖: ${file.name})`;
                    }, 2500); // Simulate 2.5 seconds OCR processing
                } else {
                    // Handle non-image files
                    uploadedFiles.push(file); // Add original file object
                }
            });
        } else {
            fileList.textContent = '未選擇任何作文稿件。';
        }
    });

    // 拖曳上傳功能
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color'); // 使用 getComputedStyle
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color'); // 使用 getComputedStyle
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color'); // 使用 getComputedStyle
        essayUpload.files = e.dataTransfer.files; // 將拖曳的檔案賦值給 input
        essayUpload.dispatchEvent(new Event('change')); // 觸發 change 事件
    });

    // --- 模擬批改與評分 (實際會呼叫後端 API) ---
    startCorrectionBtn.addEventListener('click', () => {
        if (uploadedFiles.length === 0) {
            alert('請先上傳作文稿件！');
            return;
        }

        essayTableBody.innerHTML = ''; // 清空舊的結果

        // 模擬後端批改結果，新增寫作能力指標
        const mockResults = uploadedFiles.map((file, index) => {
            let studentName, essayTitle, essayContent;

            if (file.isOcrResult) {
                studentName = file.studentName || `圖片學生 ${index + 1}`;
                essayTitle = file.essayTitle || file.name.replace(/\.txt$/i, '').replace(/^ocr_result_for_/i, '');
                essayContent = file.mockText;
            } else {
                studentName = `同學 ${index + 1}`;
                // Attempt to extract a more meaningful title if possible, otherwise use filename
                const nameParts = file.name.split('.');
                nameParts.pop(); // remove extension
                essayTitle = nameParts.join('.') || `作文 ${index + 1}`;
                essayContent = `模擬的 '${file.name}' 文件內容。`; // Placeholder for actual content if we were reading files
            }

            const grade = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
            const score = Math.floor(Math.random() * 41) + 60; // 60-100 分
            // Use essayContent in feedback if needed, here we just use title.
            const feedback = `這篇作文《${essayTitle}》立意新穎，結構完整，值得肯定。但在遣詞造句方面可再推敲，避免重複。建議多閱讀名家作品，提升語言表達力。\nOCR內容參考:\n${file.isOcrResult ? essayContent.substring(0,100)+'...' : '(非圖片辨識文件)'}`;
            const abilityScores = {
                topic: Math.floor(Math.random() * 5) + 1, // 審題立意 1-5
                structure: Math.floor(Math.random() * 5) + 1, // 內容組織 1-5
                vocabulary: Math.floor(Math.random() * 5) + 1, // 遣詞造句 1-5
                mechanics: Math.floor(Math.random() * 5) + 1, // 錯別字/標點 1-5
            };
            // Store the full content (mock or otherwise) for potential use in the modal
            return { studentName, essayTitle, grade, score, feedback, abilityScores, fullContent: essayContent, isOcr: !!file.isOcrResult, originalFileName: file.originalFileName };
        });

        mockResults.forEach(result => {
            const row = essayTableBody.insertRow();
            row.dataset.originalFeedback = result.feedback;
            row.dataset.originalGrade = result.grade;
            row.dataset.originalScore = result.score;
            row.dataset.originalAbilityScores = JSON.stringify(result.abilityScores);
            row.dataset.fullContent = result.fullContent; // Store full content
            row.dataset.isOcr = result.isOcr;
            if(result.isOcr) row.dataset.originalFileName = result.originalFileName;


            let titleDisplay = result.isOcr ? `《${result.essayTitle}》 (原圖: ${result.originalFileName})` : `《${result.essayTitle}》`;

            row.innerHTML = `
                <td>${result.studentName}</td>
                <td>${titleDisplay}</td>
                <td class="grade ai-generated-content">${result.grade}</td>
                <td class="score ai-generated-content">${result.score}</td>
                <td class="feedback ai-generated-content">${result.feedback.substring(0, 40)}...</td>
                <td class="action-buttons">
                    <button class="edit-feedback-btn" title="補充/校正批閱意見"><i class="fas fa-marker"></i></button>
                    <button class="delete-btn" title="刪除評閱記錄"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        });
        
        // Apply visibility state after table population
        const allAiContentCellsOnTable = document.querySelectorAll('#essayTable .ai-generated-content');
        allAiContentCellsOnTable.forEach(cell => {
            if (aiFeedbackVisible) {
                cell.classList.add('visible');
            } else {
                cell.classList.remove('visible'); // Ensure cells are hidden if state is false
            }
        });

        // 綁定動態生成的按鈕事件
        bindCorrectionTableEvents();
        alert(`已完成 ${uploadedFiles.length} 篇作文的智慧評閱！`);
    });

    if (toggleAiFeedbackBtn) {
        toggleAiFeedbackBtn.addEventListener('click', () => {
            aiFeedbackVisible = !aiFeedbackVisible; // Toggle the state
            const aiContentCells = document.querySelectorAll('#essayTable .ai-generated-content');
            
            aiContentCells.forEach(cell => {
                if (aiFeedbackVisible) {
                    cell.classList.add('visible');
                } else {
                    cell.classList.remove('visible');
                }
            });

            // Update button text and icon
            if (aiFeedbackVisible) {
                toggleAiFeedbackBtn.innerHTML = '<i class="fas fa-eye"></i> 隱藏 AI 評析'; // Icon: eye, Text: Hide
            } else {
                toggleAiFeedbackBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 顯示 AI 評析'; // Icon: eye-slash, Text: Show
            }
        });
    }

    function bindCorrectionTableEvents() {
        document.querySelectorAll('.edit-feedback-btn').forEach(button => {
            button.onclick = (e) => {
                currentEditingRow = e.target.closest('tr');
                const originalFeedback = currentEditingRow.dataset.originalFeedback;
                const currentFeedback = currentEditingRow.querySelector('.feedback').textContent.replace('...', ''); // 移除概要的點點
                const currentGrade = currentEditingRow.querySelector('.grade').textContent;
                const currentScore = currentEditingRow.querySelector('.score').textContent;
                const currentAbilityScores = JSON.parse(currentEditingRow.dataset.originalAbilityScores || '{}'); // 解析能力指標

                originalFeedbackTextarea.value = originalFeedback;
                // If correctedFeedback exists, use it, otherwise use original.
                // For OCR, the "originalFeedback" IS the AI generated one based on OCR text.
                correctedFeedbackTextarea.value = currentEditingRow.dataset.correctedFeedback || originalFeedback;
                correctedGradeSelect.value = currentGrade;
                correctedScoreInput.value = currentScore;

                // 填充能力指標
                const abilityScoresToDisplay = currentEditingRow.dataset.correctedAbilityScores ?
                    JSON.parse(currentEditingRow.dataset.correctedAbilityScores) :
                    currentAbilityScores;

                abilityScoreInputs.forEach(input => {
                    const ability = input.dataset.ability;
                    input.value = abilityScoresToDisplay[ability] || '';
                });
                
                // Potentially display full OCR content in the modal if needed
                // For now, originalFeedbackTextarea shows the AI feedback which includes a snippet of OCR.

                feedbackModal.style.display = 'flex';
            };
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (e) => {
                if (confirm('確定要刪除這筆評閱記錄嗎？此操作不可逆。')) {
                    e.target.closest('tr').remove();
                    // 實際應用中會呼叫 API 刪除後端數據，並記錄日誌
                    alert('評閱記錄已刪除。');
                }
            };
        });
    }

    // --- 模態視窗操作 ---
    closeButton.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
        }
    });

    saveCorrectionBtn.addEventListener('click', () => {
        if (currentEditingRow) {
            const correctedFeedback = correctedFeedbackTextarea.value;
            const correctedGrade = correctedGradeSelect.value;
            const correctedScore = correctedScoreInput.value;

            const updatedAbilityScores = {};
            abilityScoreInputs.forEach(input => {
                const ability = input.dataset.ability;
                updatedAbilityScores[ability] = parseInt(input.value) || 0;
            });

            // 更新表格顯示
            currentEditingRow.querySelector('.feedback').textContent = correctedFeedback.substring(0, 40) + '...';
            currentEditingRow.querySelector('.grade').textContent = correctedGrade;
            currentEditingRow.querySelector('.score').textContent = correctedScore;

            // 更新 dataset 屬性
            currentEditingRow.dataset.correctedFeedback = correctedFeedback;
            currentEditingRow.dataset.correctedGrade = correctedGrade;
            currentEditingRow.dataset.correctedScore = correctedScore;
            currentEditingRow.dataset.correctedAbilityScores = JSON.stringify(updatedAbilityScores);

            // 實際應用中，這裡會呼叫後端 API 儲存校正後的數據，並記錄教師調整日誌
            alert('批閱意見與評分已成功校正並更新記錄！');
            feedbackModal.style.display = 'none';
            currentEditingRow = null;
        }
    });

    // --- 匯出評分評語 ---
    exportFeedbackBtn.addEventListener('click', () => {
        const data = [];
        // 表頭
        data.push(['學生姓名', '作文題目', 'AI 評等', 'AI 分數', '教師調整評等', '教師調整分數', 'AI 評語概要', '教師補充/校正評語', '審題立意分數', '內容組織分數', '遣詞造句分數', '錯別字標點分數']);

        document.querySelectorAll('#essayTable tbody tr').forEach(row => {
            const studentName = row.children[0].textContent;
            const essayTitle = row.children[1].textContent;
            const aiGrade = row.dataset.originalGrade;
            const aiScore = row.dataset.originalScore;
            const correctedGrade = row.dataset.correctedGrade || aiGrade;
            const correctedScore = row.dataset.correctedScore || aiScore;
            const aiFeedbackSummary = row.dataset.originalFeedback.substring(0, 40);
            const correctedFeedback = row.dataset.correctedFeedback || row.dataset.originalFeedback; // 使用校正後的評語或原始評語
            const abilityScores = JSON.parse(row.dataset.correctedAbilityScores || row.dataset.originalAbilityScores || '{}');

            data.push([
                studentName,
                essayTitle,
                aiGrade,
                aiScore,
                correctedGrade,
                correctedScore,
                aiFeedbackSummary,
                correctedFeedback,
                abilityScores.topic || '',
                abilityScores.structure || '',
                abilityScores.vocabulary || '',
                abilityScores.mechanics || ''
            ]);
        });

        if (data.length <= 1) {
            alert('沒有可匯出的批閱結果。');
            return;
        }

        // 簡單的 CSV 匯出
        const csvContent = data.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', '翰墨雲評_作文評閱意見.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('批閱意見已匯出為 CSV 檔案。');
    });

    // --- 數據分析與圖表 (使用 Chart.js) ---
    let gradeChart;
    let scoreChart;
    let abilityChart; // 新增能力指標圖表變量

    function renderCharts() {
        // 模擬數據（實際會從後端獲取）
        const mockGradeData = {
            labels: ['特優 (A)', '優等 (B)', '佳作 (C)', '待加強 (D)'],
            datasets: [{
                label: '綜合評等分佈',
                data: [25, 50, 18, 7], // 假設 A:25%, B:50%, C:18%, D:7%
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-color'), // 淺綠
                    getComputedStyle(document.documentElement).getPropertyValue('--primary-color'), // 深藍
                    getComputedStyle(document.documentElement).getPropertyValue('--secondary-color'), // 藍灰
                    getComputedStyle(document.documentElement).getPropertyValue('--danger-color')  // 紅色
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        };

        const mockScoreTrendData = {
            labels: ['9月', '10月', '11月', '12月', '1月'], // 模擬月份
            datasets: [{
                label: '平均分數趨勢',
                data: [78, 82, 80, 86, 83], // 模擬平均分數
                fill: false,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                tension: 0.2, // 曲線更平滑
                pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color')
            }]
        };

        // 模擬寫作能力指標平均分佈
        const mockAbilityData = {
            labels: ['審題立意', '內容組織', '遣詞造句', '錯別字/標點'],
            datasets: [{
                label: '班級平均能力分數 (1-5)',
                data: [4.2, 3.8, 3.5, 4.5], // 模擬平均分
                backgroundColor: [
                    'rgba(76, 175, 80, 0.5)',
                    'rgba(33, 150, 243, 0.5)',
                    'rgba(255, 152, 0, 0.5)',
                    'rgba(156, 39, 176, 0.5)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(156, 39, 176, 1)'
                ],
                borderWidth: 1
            }]
        };


        // 銷毀舊圖表以避免重複渲染
        if (gradeChart) gradeChart.destroy();
        if (scoreChart) scoreChart.destroy();
        if (abilityChart) abilityChart.destroy(); // 銷毀新的能力圖表

        gradeChart = new Chart(gradeDistributionChartCtx, {
            type: 'doughnut', // 更優雅的環狀圖
            data: mockGradeData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right', // 圖例放在右側
                        labels: {
                            font: {
                                size: 14,
                                family: getComputedStyle(document.documentElement).getPropertyValue('--font-family-body')
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                let label = tooltipItem.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += tooltipItem.raw + '%';
                                return label;
                            }
                        }
                    }
                }
            }
        });

        scoreChart = new Chart(scoreTrendChartCtx, {
            type: 'line',
            data: mockScoreTrendData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '平均分數'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '月份'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // 線性圖通常不需要圖例
                    }
                }
            }
        });

        abilityChart = new Chart(abilityScoreChartCtx, {
            type: 'bar', // 條形圖適合能力指標
            data: mockAbilityData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: '平均分數 (1-5)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // --- 評分歷程記錄 (實際從後端獲取) ---
    function loadHistoryData() {
        historyTableBody.innerHTML = '';
        // 模擬評分歷程數據，新增教師調整記錄
        const mockHistory = [
            { date: '2025-05-20', studentName: '王小明', essayTitle: '我的高中生活', aiScore: 85, aiGrade: 'A', finalScore: 88, finalGrade: 'A', teacherAdjusted: '是' },
            { date: '2025-05-18', studentName: '李華', essayTitle: '青春的煩惱', aiScore: 78, aiGrade: 'B', finalScore: 78, finalGrade: 'B', teacherAdjusted: '否' },
            { date: '2025-05-15', studentName: '陳美玲', essayTitle: '環境保護的重要性', aiScore: 92, aiGrade: 'A', finalScore: 90, finalGrade: 'A', teacherAdjusted: '是' },
            { date: '2025-05-10', studentName: '張志豪', essayTitle: '我的夢想', aiScore: 65, aiGrade: 'C', finalScore: 70, finalGrade: 'B', teacherAdjusted: '是' },
        ];

        mockHistory.forEach(record => {
            const row = historyTableBody.insertRow();
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.studentName}</td>
                <td>《${record.essayTitle}》</td>
                <td>${record.finalScore}</td>
                <td>${record.finalGrade}</td>
                <td>${record.teacherAdjusted}</td>
                <td class="action-buttons">
                    <button class="view-details-btn" title="查看詳情"><i class="fas fa-eye"></i></button>
                </td>
            `;
        });
    }

    // 篩選功能（實際會根據選擇的班級和日期範圍調用後端 API 重新加載數據和圖表）
    applyFilterBtn.addEventListener('click', () => {
        const selectedClass = classSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        alert(`已根據條件篩選數據：班級 - ${selectedClass}, 日期範圍 - ${startDate} 至 ${endDate}`);
        // 這裡會重新調用 renderCharts() 和 loadHistoryData() 並傳入篩選條件
        renderCharts();
        loadHistoryData();
    });

    // 匯出數據報表 (CSV 或 PDF)
    exportDataReportBtn.addEventListener('click', () => {
        const data = [];
        data.push(['評閱日期', '學生姓名', '作文題目', '最終分數', '最終評等', '教師是否調整']); // 表頭

        document.querySelectorAll('#historyTable tbody tr').forEach(row => {
            const date = row.children[0].textContent;
            const studentName = row.children[1].textContent;
            const essayTitle = row.children[2].textContent;
            const finalScore = row.children[3].textContent;
            const finalGrade = row.children[4].textContent;
            const teacherAdjusted = row.children[5].textContent;
            data.push([date, studentName, essayTitle, finalScore, finalGrade, teacherAdjusted]);
        });

        if (data.length <= 1) {
            alert('沒有歷史數據可以匯出。');
            return;
        }

        const csvContent = data.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', '翰墨雲評_學習成效報告.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('學習成效報告已匯出為 CSV 檔案。');
    });

    // --- 帳號設定 (密碼修改等，實際會呼叫後端 API) ---
    const accountSettingsForm = document.querySelector('#accountSettingsSection .settings-form');
    accountSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            alert('新設密碼與確認密碼不一致，請重新輸入！');
            return;
        }
        if (newPassword.length < 8) { // 密碼長度要求更高
            alert('新設密碼長度至少為 8 位。');
            return;
        }

        // 實際應用中，會將這些數據發送到後端進行驗證和更新，並記錄日誌
        alert('密碼修改請求已提交，請稍候。');
        accountSettingsForm.reset(); // 清空表單
    });

    // 頁面載入時預設顯示批次上傳區塊
    showSection(batchUploadSection);

    // 模擬加載班級列表
    function loadClasses() {
        const mockClasses = ['高一忠班', '高一孝班', '高二仁班', '高二愛班', '高三信班', '高三義班'];
        mockClasses.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }
    loadClasses();

    // Initial UI setup based on login state
    updateNavbarVisibility();
});