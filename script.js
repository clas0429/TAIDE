document.addEventListener('DOMContentLoaded', () => {
    // 導航連結
    const batchUploadLink = document.getElementById('batchUploadLink');
    const dataAnalysisLink = document.getElementById('dataAnalysisLink');
    const studentManagementLink = document.getElementById('studentManagementLink'); // 新增學生管理連結
    const auditLogLink = document.getElementById('auditLogLink'); // NEW: Audit Log Link
    const accountSettingsLink = document.getElementById('accountSettingsLink');
    const logoutLink = document.getElementById('logoutLink');
    const loginLink = document.getElementById('loginLink');

    // 導航菜單
    const mainNav = document.getElementById('mainNav'); // 主導航 (批閱、分析、設定、登出)
    const authNav = document.getElementById('authNav'); // 登入/註冊導航 (只包含登入按鈕)

    // 區塊
    const batchUploadSection = document.getElementById('batchUploadSection');
    const dataAnalysisSection = document.getElementById('dataAnalysisSection');
    const studentManagementSection = document.getElementById('studentManagementSection'); // 新增學生管理區塊
    const auditLogSection = document.getElementById('auditLogSection'); // NEW: Audit Log Section
    const accountSettingsSection = document.getElementById('accountSettingsSection');
    const loginSection = document.getElementById('loginSection'); // 登入區塊

    // 登入相關元素
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    // 上傳相關元素
    const essayUpload = document.getElementById('essayUpload');
    const imageUploadBtn = document.getElementById('imageUpload');
    const fileList = document.getElementById('fileList');
    const startCorrectionBtn = document.getElementById('startCorrection');
    const essayTableBody = document.querySelector('#essayTable tbody');
    const exportFeedbackBtn = document.getElementById('exportFeedback');

    // AI 評分詳情開關
    const toggleAiDetails = document.getElementById('toggleAiDetails');
    const aiDetailHeaders = document.querySelectorAll('#essayTable th.ai-detail');
    // Note: aiDetailCells 不需要預先獲取，因為表格內容是動態生成的，需要每次重新獲取
    // const aiDetailCells = document.querySelectorAll('#essayTable td.ai-detail');

    // 模態視窗相關元素
    const feedbackModal = document.getElementById('feedbackModal');

    const originalFeedbackTextarea = document.getElementById('originalFeedback');
    const correctedFeedbackTextarea = document.getElementById('correctedFeedback');
    const correctedGradeSelect = document.getElementById('correctedGrade');
    const correctedScoreInput = document.getElementById('correctedScore');
    const abilityScoreInputs = document.querySelectorAll('.ability-input');
    const saveCorrectionBtn = document.getElementById('saveCorrection');

    // 數據分析相關元素
    const classSelect = document.getElementById('classSelect');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilter');
    const gradeDistributionChartCtx = document.getElementById('gradeDistributionChart').getContext('2d');
    const scoreTrendChartCtx = document.getElementById('scoreTrendChart').getContext('2d');
    const abilityScoreChartCtx = document.getElementById('abilityScoreChart').getContext('2d');
    //const historyTableBody = document.querySelector('#historyTable tbody');
    const exportDataReportBtn = document.getElementById('exportDataReport');

    // NEW: Audit Log Elements
    const auditDateInput = document.getElementById('auditDate');
    const teacherAccountInput = document.getElementById('teacherAccount');
    const operationTypeSelect = document.getElementById('operationType');
    const queryAuditLogBtn = document.getElementById('queryAuditLog');
    const exportAuditLogBtn = document.getElementById('exportAuditLog');
    const auditLogTableBody = document.querySelector('#auditLogTable tbody');

    // 學生管理相關元素
    const manageClassSelect = document.getElementById('manageClassSelect');
    const showAddStudentFormBtn = document.getElementById('showAddStudentFormBtn');
    const addStudentForm = document.getElementById('addStudentForm');
    const newStudentNameInput = document.getElementById('newStudentName');
    const newStudentNumberInput = document.getElementById('newStudentNumber');
    const saveNewStudentBtn = document.getElementById('saveNewStudentBtn');
    const cancelAddStudentBtn = document.getElementById('cancelAddStudentBtn');
    const studentTableBody = document.querySelector('#studentTable tbody');
    const currentClassNameSpan = document.getElementById('currentClassName');
    // **將以下 DOM 元素變數的宣告移動到這裡**
    const reviewHistoryTableBody = document.querySelector('#reviewHistoryTable tbody');
    const reviewDetailModal = document.getElementById('reviewDetailModal');

    const closeReviewDetailModal = document.querySelector('#reviewDetailModal .close-button');
    const closeFeedbackModal = document.querySelector('#feedbackModal .close-button');

    const menuToggle = document.getElementById('menuToggle');
    // NEW: Menu Toggle for mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
        });
    }
        // Close the menu when a nav link is clicked (for mobile)
    document.querySelectorAll('#mainNav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
            }
        });
    });

    // Also, handle cases where user clicks outside the menu to close it
    document.addEventListener('click', (event) => {
        // Check if the clicked element is not inside mainNav and not the menuToggle button
        if (mainNav.classList.contains('open') &&
            !mainNav.contains(event.target) &&
            !menuToggle.contains(event.target)) {
            mainNav.classList.remove('open');
        }
    });


    let currentEditingRow = null;
    let isLoggedIn = false; // 模擬登入狀態

    // 模擬學生資料（實際應用中會從後端獲取）
    const mockStudents = {
        '高一忠班': [
            { id: 'S001', studentId: '2024001', name: '王小明' },
            { id: 'S002', studentId: '2024002', name: '李華' }
        ],
        '高一孝班': [
            { id: 'S003', studentId: '2024003', name: '陳美玲' },
            { id: 'S004', studentId: '2024004', name: '張志豪' }
        ],
        '高二仁班': [
            { id: 'S005', studentId: '2023001', name: '林宜靜' },
            { id: 'S006', studentId: '2023002', name: '黃俊傑' }
        ]
    };
    let currentSelectedClass = ''; // 當前選中的學生管理班級

    // **將 hideAllSections 函式放在這裡，或者更早的地方**
    function hideAllSections() {
        batchUploadSection.style.display = 'none';
        dataAnalysisSection.style.display = 'none';
        studentManagementSection.style.display = 'none';
        auditLogSection.style.display = 'none';
        accountSettingsSection.style.display = 'none';
        loginSection.style.display = 'none';
    }

    // --- 輔助函數：顯示/隱藏區塊 ---
    function showSection(sectionToShow) {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden-section'); // 隱藏所有區塊
            section.classList.remove('active-section');
        });
        sectionToShow.classList.remove('hidden-section'); // 顯示目標區塊
        sectionToShow.classList.add('active-section');
    }

    // --- 登入邏輯 ---
    function checkLoginStatus() {
        // 在實際應用中，這裡會檢查 localStorage 中的 token 或呼叫後端 API
        // 為了演示，我們模擬未登入狀態
        if (isLoggedIn) {
            mainNav.classList.remove('hidden'); // 顯示主導航
            authNav.classList.add('hidden');    // 隱藏登入導航
            showSection(batchUploadSection);    // 登入後預設顯示批閱頁面
        } else {
            mainNav.classList.add('hidden');    // 隱藏主導航
            authNav.classList.remove('hidden'); // 顯示登入導航
            showSection(loginSection);          // 未登入預設顯示登入頁面
        }
    }

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;

        // 模擬登入驗證
        if (username === 'a' && password === 'a') {
            isLoggedIn = true;
            alert('登入成功！歡迎使用翰墨雲評系統。');
            checkLoginStatus();
            // 清空密碼欄位
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            alert('帳號或密碼錯誤，請重新輸入。');
        }
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        // 如果已經在登入頁，不需要再次操作
        if (!loginSection.classList.contains('active-section')) {
            showSection(loginSection);
        }
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoggedIn = false;
        alert('您已安全登出系統。');
        checkLoginStatus();
        // 實際應用中會導向登入頁面或清除 session
        // window.location.href = '/login';
    });

    // --- 導航功能 (只有登入後才能使用) ---
    batchUploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        showSection(batchUploadSection);
    });

    dataAnalysisLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
   
        //hideAllSections();
        //dataAnalysisSection.style.display = 'block';
        displayReviewHistory(); // 加載歷史評閱記錄
        loadClasses(); // 加載班級篩選
        showSection(dataAnalysisSection);
        renderCharts();
        //loadHistoryData();
    });

    studentManagementLink.addEventListener('click', (e) => { // 新增學生管理連結事件
        e.preventDefault();
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        showSection(studentManagementSection);
        loadManageClasses(); // 載入學生管理頁面的班級列表
        loadStudentsByClass(''); // 預設清空學生列表
        currentClassNameSpan.textContent = '請選擇班級';
        addStudentForm.classList.add('hidden-form'); // 隱藏新增學生表單
    });


    // NEW: Audit Log Navigation
    auditLogLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(auditLogSection);
        loadAuditLogData(); // Load audit log data when switching to this page
    });

    accountSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        showSection(accountSettingsSection);
    });

    // --- 檔案上傳與顯示 ---
    let uploadedFiles = [];

    if (imageUploadBtn && essayUpload) {
        imageUploadBtn.addEventListener('click', () => {
            essayUpload.click();
        });
    }

    essayUpload.addEventListener('change', (event) => {
        fileList.innerHTML = '';
        uploadedFiles = [];
        const files = Array.from(event.target.files);

        if (files.length > 0) {
            files.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.textContent = file.name;
                fileList.appendChild(fileDiv);

                if (file.type.startsWith('image/')) {
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
                            studentName: studentName,
                            essayTitle: essayTitle
                        };
                        uploadedFiles.push(ocrResult);
                        fileDiv.textContent = `[辨識完成] ${ocrResult.name} (原圖: ${file.name})`;
                    }, 2500);
                } else {
                    uploadedFiles.push(file);
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
        uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        essayUpload.files = e.dataTransfer.files;
        essayUpload.dispatchEvent(new Event('change'));
    });

    // --- 模擬批改與評分 (實際會呼叫後端 API) ---
    startCorrectionBtn.addEventListener('click', () => {
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        if (uploadedFiles.length === 0) {
            alert('請先上傳作文稿件！');
            return;
        }

        essayTableBody.innerHTML = '';

        const mockResults = uploadedFiles.map((file, index) => {
            let studentName, essayTitle, essayContent;

            if (file.isOcrResult) {
                studentName = file.studentName || `圖片學生 ${index + 1}`;
                essayTitle = file.essayTitle || file.name.replace(/\.txt$/i, '').replace(/^ocr_result_for_/i, '');
                essayContent = file.mockText;
            } else {
                studentName = `同學 ${index + 1}`;
                const nameParts = file.name.split('.');
                nameParts.pop();
                essayTitle = nameParts.join('.') || `作文 ${index + 1}`;
                essayContent = `模擬的 '${file.name}' 文件內容。`;
            }

            const grade = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
            const score = Math.floor(Math.random() * 41) + 60;
            const feedback = `這篇作文《${essayTitle}》立意新穎，結構完整，值得肯定。但在遣詞造句方面可再推敲，避免重複。建議多閱讀名家作品，提升語言表達力。\nOCR內容參考:\n${file.isOcrResult ? essayContent.substring(0, 100) + '...' : '(非圖片辨識文件)'}`;
            const abilityScores = {
                topic: Math.floor(Math.random() * 5) + 1,
                structure: Math.floor(Math.random() * 5) + 1,
                vocabulary: Math.floor(Math.random() * 5) + 1,
                mechanics: Math.floor(Math.random() * 5) + 1,
            };
            return { studentName, essayTitle, grade, score, feedback, abilityScores, fullContent: essayContent, isOcr: !!file.isOcrResult, originalFileName: file.originalFileName };
        });

        mockResults.forEach(result => {
            const row = essayTableBody.insertRow();
            row.dataset.originalFeedback = result.feedback;
            row.dataset.originalGrade = result.grade;
            row.dataset.originalScore = result.score;
            row.dataset.originalAbilityScores = JSON.stringify(result.abilityScores);
            row.dataset.fullContent = result.fullContent;
            row.dataset.isOcr = result.isOcr;
            if (result.isOcr) row.dataset.originalFileName = result.originalFileName;

            let titleDisplay = result.isOcr ? `《${result.essayTitle}》 (原圖: ${result.originalFileName})` : `《${result.essayTitle}》`;

            row.innerHTML = `
                <td>${result.studentName}</td>
                <td>${titleDisplay}</td>
                <td class="grade ai-detail">${result.grade}</td>
                <td class="score ai-detail">${result.score}</td>
                <td class="feedback ai-detail">${result.feedback.substring(0, 40)}...</td>
                <td class="action-buttons">
                    <button class="edit-feedback-btn" title="補充/校正批閱意見"><i class="fas fa-marker"></i></button>
                    <button class="delete-btn" title="刪除評閱記錄"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        });

        // 模擬評改完成後，根據開關狀態隱藏/顯示 AI 詳細資訊
        toggleAiDetailsDisplay();

        bindCorrectionTableEvents();
        alert(`已完成 ${uploadedFiles.length} 篇作文的智慧評閱！`);
    });

    function bindCorrectionTableEvents() {
        document.querySelectorAll('.edit-feedback-btn').forEach(button => {
            button.onclick = (e) => {
                currentEditingRow = e.target.closest('tr');
                const originalFeedback = currentEditingRow.dataset.originalFeedback;
                // Note: currentFeedback 應該從實際顯示的單元格獲取，但更精確的應該從 dataset.correctedFeedback 獲取如果存在
                const currentFeedback = currentEditingRow.dataset.correctedFeedback || originalFeedback; // 優先使用已校正的
                const currentGrade = currentEditingRow.dataset.correctedGrade || currentEditingRow.dataset.originalGrade; // 優先使用已校正的
                const currentScore = currentEditingRow.dataset.correctedScore || currentEditingRow.dataset.originalScore; // 優先使用已校正的
                const currentAbilityScores = JSON.parse(currentEditingRow.dataset.correctedAbilityScores || currentEditingRow.dataset.originalAbilityScores || '{}');

                originalFeedbackTextarea.value = originalFeedback;
                correctedFeedbackTextarea.value = currentFeedback;
                correctedGradeSelect.value = currentGrade;
                correctedScoreInput.value = currentScore;

                // 填充能力分數
                abilityScoreInputs.forEach(input => {
                    const ability = input.dataset.ability;
                    input.value = currentAbilityScores[ability] || ''; // 修正：使用 currentAbilityScores
                });

                // 將模態視窗的 display 設置為 flex 以顯示
                feedbackModal.style.display = 'flex';
            };
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (e) => {
                if (confirm('確定要刪除這筆評閱記錄嗎？此操作不可逆。')) {
                    e.target.closest('tr').remove();
                    alert('評閱記錄已刪除。');
                }
            };
        });
    }

    // --- 模態視窗操作 ---
    closeReviewDetailModal.addEventListener('click', () => {
        reviewDetailModal.style.display = 'none';
    });

    closeFeedbackModal.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
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

            // 更新表格顯示的內容
            currentEditingRow.querySelector('.feedback').textContent = correctedFeedback.substring(0, 40) + '...';
            currentEditingRow.querySelector('.grade').textContent = correctedGrade;
            currentEditingRow.querySelector('.score').textContent = correctedScore;

            // 將校正後的數據存儲到 dataset 中
            currentEditingRow.dataset.correctedFeedback = correctedFeedback;
            currentEditingRow.dataset.correctedGrade = correctedGrade;
            currentEditingRow.dataset.correctedScore = correctedScore;
            currentEditingRow.dataset.correctedAbilityScores = JSON.stringify(updatedAbilityScores);

            alert('批閱意見與評分已成功校正並更新記錄！');
            feedbackModal.style.display = 'none';
            currentEditingRow = null;

            // 重新應用 AI 評分詳情顯示狀態，確保隱藏/顯示正確
            toggleAiDetailsDisplay();
        }
    });

    // --- AI 評分詳情開關 ---

    let aiVisible = false; // 初始為隱藏
    
    toggleAiDetails.addEventListener('click', () => {
        aiVisible = !aiVisible;
        toggleAiDetailsDisplay(aiVisible);
    });
    
    function toggleAiDetailsDisplay(isVisible) {
        // 修改這裡，選取 <th> 的 ai-detail 標題
        const aiDetailHeaders = document.querySelectorAll('#essayTable thead .ai-detail');
        aiDetailHeaders.forEach(header => {
            header.classList.toggle('hidden-ai-detail', !isVisible);
        });
    
        // 處理 <td>
        document.querySelectorAll('#essayTable tbody tr').forEach(row => {
            const cells = row.querySelectorAll('.ai-detail');
            cells.forEach(cell => {
                cell.classList.toggle('hidden-ai-detail', !isVisible);
            });
        });
    
        // 更新按鈕圖示與文字
        toggleAiDetails.innerHTML = isVisible
            ? '<i class="fas fa-eye-slash"></i> 隱藏 AI 評析'
            : '<i class="fas fa-eye"></i> 顯示 AI 評析';
    }
    

    // --- 匯出評分評語 ---
    exportFeedbackBtn.addEventListener('click', () => {
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        const data = [];
        data.push(['學生姓名', '作文題目', 'AI 評等', 'AI 分數', '教師調整評等', '教師調整分數', 'AI 評語概要', '教師補充/校正評語', '審題立意分數', '內容組織分數', '遣詞造句分數', '錯別字標點分數']);

        document.querySelectorAll('#essayTable tbody tr').forEach(row => {
            const studentName = row.children[0].textContent;
            const essayTitle = row.children[1].textContent;
            const aiGrade = row.dataset.originalGrade;
            const aiScore = row.dataset.originalScore;
            const correctedGrade = row.dataset.correctedGrade || aiGrade;
            const correctedScore = row.dataset.correctedScore || aiScore;
            const aiFeedbackSummary = row.dataset.originalFeedback.substring(0, 40);
            const correctedFeedback = row.dataset.correctedFeedback || row.dataset.originalFeedback;
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
    let abilityChart;

    function renderCharts() {
        const mockGradeData = {
            labels: ['特優 (A)', '優等 (B)', '佳作 (C)', '待加強 (D)'],
            datasets: [{
                label: '綜合評等分佈',
                data: [25, 50, 18, 7],
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                    getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                    getComputedStyle(document.documentElement).getPropertyValue('--secondary-color'),
                    getComputedStyle(document.documentElement).getPropertyValue('--danger-color')
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        };

        const mockScoreTrendData = {
            labels: ['9月', '10月', '11月', '12月', '1月'],
            datasets: [{
                label: '平均分數趨勢',
                data: [78, 82, 80, 86, 83],
                fill: false,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                tension: 0.2,
                pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color')
            }]
        };

        const mockAbilityData = {
            labels: ['審題立意', '內容組織', '遣詞造句', '錯別字/標點'],
            datasets: [{
                label: '班級平均能力分數 (1-5)',
                data: [4.2, 3.8, 3.5, 4.5],
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

        if (gradeChart) gradeChart.destroy();
        if (scoreChart) scoreChart.destroy();
        if (abilityChart) abilityChart.destroy();

        gradeChart = new Chart(gradeDistributionChartCtx, {
            type: 'doughnut',
            data: mockGradeData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14,
                                family: getComputedStyle(document.documentElement).getPropertyValue('--font-family-body')
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
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
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        abilityChart = new Chart(abilityScoreChartCtx, {
            type: 'bar',
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

    /* --- 評分歷程記錄 (實際從後端獲取) ---
    function loadHistoryData() {
        historyTableBody.innerHTML = '';
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
    */
    // 篩選功能
    applyFilterBtn.addEventListener('click', () => {
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        const selectedClass = classSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        alert(`已根據條件篩選數據：班級 - ${selectedClass}, 日期範圍 - ${startDate} 至 ${endDate}`);
        renderCharts();
        //loadHistoryData();
    });

    // 匯出數據報表
    exportDataReportBtn.addEventListener('click', () => {
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        const data = [];
        data.push(['評閱日期', '學生姓名', '作文題目', '最終分數', '最終評等', '教師是否調整']);

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

    // --- NEW: Audit Log Functions ---
    function loadAuditLogData() {
        auditLogTableBody.innerHTML = '';
        // Mock audit log data based on the provided image
        const mockAuditLogs = [
            { time: '2024-05-20 09:12', account: 'teacher1', action: '登入', description: '教師登入系統' },
            { time: '2024-05-20 10:20', account: 'teacher1', action: '批改', description: '上傳3份作文批改' },
            { time: '2024-05-21 14:18', account: 'admin', action: '下載', description: '匯出統計報表' },
            { time: '2025-05-22 08:30', account: 'teacher2', action: '上傳', description: '上傳5份作文稿件' },
            { time: '2025-05-22 09:00', account: 'teacher2', action: '批改', description: '完成2份作文批改與調整' },
            { time: '2025-05-22 10:15', account: 'admin', action: '設定', description: '更新系統配置' },
            { time: '2025-05-22 11:00', account: 'teacher1', action: '登出', description: '教師安全登出' },
        ];

        // Apply filters if any are set
        const filterDate = auditDateInput.value;
        const filterAccount = teacherAccountInput.value.toLowerCase();
        const filterType = operationTypeSelect.value;

        const filteredLogs = mockAuditLogs.filter(log => {
            const matchesDate = !filterDate || log.time.startsWith(filterDate);
            const matchesAccount = !filterAccount || log.account.toLowerCase().includes(filterAccount);
            const matchesType = filterType === 'all' || log.action === filterType;
            return matchesDate && matchesAccount && matchesType;
        });


        filteredLogs.forEach(log => {
            const row = auditLogTableBody.insertRow();
            row.innerHTML = `
                <td>${log.time}</td>
                <td>${log.account}</td>
                <td>${log.action}</td>
                <td>${log.description}</td>
            `;
        });
    }

    queryAuditLogBtn.addEventListener('click', () => {
        loadAuditLogData();
        alert('操作記錄已篩選。');
    });

    exportAuditLogBtn.addEventListener('click', () => {
        const data = [];
        data.push(['時間', '帳號', '動作', '說明']);

        // Collect current displayed data from the table
        document.querySelectorAll('#auditLogTable tbody tr').forEach(row => {
            const time = row.children[0].textContent;
            const account = row.children[1].textContent;
            const action = row.children[2].textContent;
            const description = row.children[3].textContent;
            data.push([time, account, action, description]);
        });

        if (data.length <= 1) {
            alert('沒有可匯出的操作記錄。');
            return;
        }

        const csvContent = data.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', '翰墨雲評_操作記錄與稽核.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('操作記錄已匯出為 CSV 檔案。');
    });

    // --- 帳號設定 ---
    const accountSettingsForm = document.querySelector('#accountSettingsSection .settings-form');
    accountSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isLoggedIn) { alert('請先登入系統。'); return; }
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            alert('新設密碼與確認密碼不一致，請重新輸入！');
            return;
        }
        if (newPassword.length < 8) {
            alert('新設密碼長度至少為 8 位。');
            return;
        }

        alert('密碼修改請求已提交，請稍候。');
        accountSettingsForm.reset();
    });


    // 模擬歷史評閱記錄數據
    const mockReviewRecords = [
        {
            id: 'R001',
            studentName: '王小明',
            className: '高一甲班',
            essayTitle: '我的高中生活',
            aiGrade: 'B',
            aiScore: 82,
            teacherGrade: 'A',
            teacherScore: 85,
            aiComments: '文章流暢，結構清晰，但在個人情感表達上可以再深入。',
            teacherComments: '內容豐富，語句通順，論點明確。若能在開頭引人入勝，結尾深化主題，則更臻完善。',
            aiAbilityScores: { topic: 4, structure: 4, vocabulary: 3, mechanics: 5 },
            teacherAbilityScores: { topic: 5, structure: 4, vocabulary: 4, mechanics: 5 },
            reviewDate: '2023-10-26'
        },
        {
            id: 'R002',
            studentName: '林曉華',
            className: '高一乙班',
            essayTitle: '我的夢想',
            aiGrade: 'C',
            aiScore: 70,
            teacherGrade: 'B',
            teacherScore: 75,
            aiComments: '想法不錯，但組織稍嫌鬆散，詞彙使用可以更精準。',
            teacherComments: '立意良好，但段落銜接不夠自然，部分用詞有待加強。請多閱讀優秀範文。',
            aiAbilityScores: { topic: 3, structure: 3, vocabulary: 3, mechanics: 4 },
            teacherAbilityScores: { topic: 4, structure: 3, vocabulary: 3, mechanics: 4 },
            reviewDate: '2023-11-01'
        },
        {
            id: 'R003',
            studentName: '陳大華',
            className: '高一甲班',
            essayTitle: '環境保護的重要性',
            aiGrade: 'A',
            aiScore: 90,
            teacherGrade: 'A',
            teacherScore: 92,
            aiComments: '論證有力，數據引用恰當，邏輯思維嚴謹。',
            teacherComments: '觀點獨到，資料翔實，語言表達富有說服力。是一篇非常出色的議論文。',
            aiAbilityScores: { topic: 5, structure: 5, vocabulary: 5, mechanics: 5 },
            teacherAbilityScores: { topic: 5, structure: 5, vocabulary: 5, mechanics: 5 },
            reviewDate: '2023-11-15'
        }
    ];
/*
    if (dataAnalysisSection) { // 確保元素存在
        dataAnalysisLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            dataAnalysisSection.style.display = 'block';
            displayReviewHistory(); // 加載歷史評閱記錄
            loadClasses(); // 加載班級篩選
            // 其他數據分析頁面相關的初始化函數
            // initGradeDistributionChart(); // 假設你有這個函式
            // initAbilityScoresChart();
            // initScoreComparisonChart();
        });
    }
*/

    // 顯示歷史評閱記錄
    function displayReviewHistory() {
        reviewHistoryTableBody.innerHTML = ''; // 清空現有內容

        mockReviewRecords.forEach(record => {
            const row = reviewHistoryTableBody.insertRow();
            row.insertCell().textContent = record.reviewDate;
            row.insertCell().textContent = record.className;
            row.insertCell().textContent = record.studentName;
            row.insertCell().textContent = record.essayTitle;
            row.insertCell().textContent = record.aiGrade;
            row.insertCell().textContent = record.aiScore;
            row.insertCell().textContent = record.teacherGrade;
            row.insertCell().textContent = record.teacherScore;

            const detailCell = row.insertCell();
            const detailButton = document.createElement('button');
            detailButton.textContent = '查看詳情';
            detailButton.classList.add('btn', 'primary-btn', 'btn-small');
            detailButton.onclick = () => showReviewDetail(record.id); // 傳遞記錄 ID
            detailCell.appendChild(detailButton);
        });
    }

    // 顯示評閱詳情模態視窗
    function showReviewDetail(recordId) {
        const record = mockReviewRecords.find(r => r.id === recordId);
        if (!record) {
            alert('找不到該評閱記錄。');
            return;
        }

        document.getElementById('detailStudentName').textContent = record.studentName;
        document.getElementById('detailClassName').textContent = record.className;
        document.getElementById('detailEssayTitle').textContent = record.essayTitle;
        document.getElementById('detailReviewDate').textContent = record.reviewDate;

        // AI 評閱詳情
        document.getElementById('detailAiGrade').textContent = record.aiGrade;
        document.getElementById('detailAiScore').textContent = record.aiScore;
        document.getElementById('detailAiComments').textContent = record.aiComments;
        document.getElementById('detailAiTopic').textContent = record.aiAbilityScores.topic;
        document.getElementById('detailAiStructure').textContent = record.aiAbilityScores.structure;
        document.getElementById('detailAiVocabulary').textContent = record.aiAbilityScores.vocabulary;
        document.getElementById('detailAiMechanics').textContent = record.aiAbilityScores.mechanics;

        // 教師評閱詳情
        document.getElementById('detailTeacherGrade').textContent = record.teacherGrade;
        document.getElementById('detailTeacherScore').textContent = record.teacherScore;
        document.getElementById('detailTeacherComments').textContent = record.teacherComments;
        document.getElementById('detailTeacherTopic').textContent = record.teacherAbilityScores.topic;
        document.getElementById('detailTeacherStructure').textContent = record.teacherAbilityScores.structure;
        document.getElementById('detailTeacherVocabulary').textContent = record.teacherAbilityScores.vocabulary;
        document.getElementById('detailTeacherMechanics').textContent = record.teacherAbilityScores.mechanics;


        reviewDetailModal.style.display = 'block';
    }

    /* 關閉評閱詳情模態視窗
    closeReviewDetailModal.onclick = () => {
        reviewDetailModal.style.display = 'none';
    };
    */
    window.onclick = (event) => {
        if (event.target == reviewDetailModal) {
            event.stopPropagation(); // 阻止事件傳播，不關閉
        }
        if (event.target === feedbackModal) {
            event.stopPropagation(); // 阻止事件傳播，不關閉
        }
    };

    // --- 學生管理功能 ---
    function loadManageClasses() {
        const availableClasses = Object.keys(mockStudents);
        manageClassSelect.innerHTML = '<option value="">請選擇班級</option>'; // 清空並添加預設選項
        availableClasses.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            manageClassSelect.appendChild(option);
        });
    }

    function loadStudentsByClass(className) {
        studentTableBody.innerHTML = '';
        currentClassNameSpan.textContent = className || '請選擇班級';
        const students = mockStudents[className] || [];

        students.forEach(student => {
            const row = studentTableBody.insertRow();
            row.dataset.id = student.id; // 用於編輯或刪除時識別學生
            row.innerHTML = `
                <td>${student.studentId || ''}</td>
                <td>${student.name}</td>
                <td class="action-buttons">
                    <button class="edit-student-btn" title="編輯學生資料"><i class="fas fa-user-edit"></i></button>
                    <button class="delete-student-btn" title="刪除學生"><i class="fas fa-user-times"></i></button>
                </td>
            `;
        });
        bindStudentTableEvents();
    }

    function bindStudentTableEvents() {
        document.querySelectorAll('.edit-student-btn').forEach(button => {
            button.onclick = (e) => {
                const row = e.target.closest('tr');
                const studentId = row.dataset.id;
                // 模擬獲取學生資料並填充表單 (實際會從後端獲取)
                const student = mockStudents[currentSelectedClass].find(s => s.id === studentId);
                if (student) {
                    newStudentNameInput.value = student.name;
                    newStudentNumberInput.value = student.studentId;
                    addStudentForm.dataset.editingId = student.id; // 標記為編輯模式
                    showAddStudentForm();
                }
            };
        });

        document.querySelectorAll('.delete-student-btn').forEach(button => {
            button.onclick = (e) => {
                const row = e.target.closest('tr');
                const studentId = row.dataset.id;
                if (confirm(`確定要從 ${currentSelectedClass} 班刪除此學生嗎？此操作不可逆。`)) {
                    // 模擬刪除學生 (實際會呼叫後端 API)
                    mockStudents[currentSelectedClass] = mockStudents[currentSelectedClass].filter(s => s.id !== studentId);
                    row.remove();
                    alert('學生已刪除。');
                }
            };
        });
    }

    function showAddStudentForm() {
        addStudentForm.classList.remove('hidden-form');
        newStudentNameInput.focus();
    }

    function hideAddStudentForm() {
        addStudentForm.classList.add('hidden-form');
        addStudentForm.removeAttribute('data-editing-id');
        newStudentNameInput.value = '';
        newStudentNumberInput.value = '';
    }

    manageClassSelect.addEventListener('change', (e) => {
        currentSelectedClass = e.target.value;
        loadStudentsByClass(currentSelectedClass);
        hideAddStudentForm(); // 切換班級時隱藏表單
    });

    showAddStudentFormBtn.addEventListener('click', () => {
        if (!currentSelectedClass) {
            alert('請先選擇一個班級才能新增學生。');
            return;
        }
        hideAddStudentForm(); // 確保表單是清空的
        showAddStudentForm();
    });

    cancelAddStudentBtn.addEventListener('click', hideAddStudentForm);

    saveNewStudentBtn.addEventListener('click', () => {
        const name = newStudentNameInput.value.trim();
        const studentNumber = newStudentNumberInput.value.trim();
        const editingId = addStudentForm.dataset.editingId;

        if (!name) {
            alert('學生姓名不能為空！');
            return;
        }
        if (!currentSelectedClass) {
            alert('請選擇一個班級。');
            return;
        }

        if (editingId) {
            // 編輯現有學生
            const studentIndex = mockStudents[currentSelectedClass].findIndex(s => s.id === editingId);
            if (studentIndex !== -1) {
                mockStudents[currentSelectedClass][studentIndex].name = name;
                mockStudents[currentSelectedClass][studentIndex].studentId = studentNumber;
                alert('學生資料已更新。');
            }
        } else {
            // 新增學生
            const newId = 'S' + (Math.random() * 100000).toFixed(0); // 簡單生成一個 ID
            const newStudent = { id: newId, studentId: studentNumber, name: name };
            if (!mockStudents[currentSelectedClass]) {
                mockStudents[currentSelectedClass] = [];
            }
            mockStudents[currentSelectedClass].push(newStudent);
            alert('新學生已新增。');
        }

        loadStudentsByClass(currentSelectedClass); // 重新載入列表
        hideAddStudentForm(); // 隱藏表單
    });


    // 頁面載入時檢查登入狀態並顯示相應區塊
    checkLoginStatus();

    // 模擬加載班級列表 (用於數據分析頁面)
    function loadClasses() {
        const allClassNames = Object.keys(mockStudents);
        classSelect.innerHTML = '<option value="all">所有班級</option>';
        allClassNames.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }
    loadClasses(); // 在 DOMContentLoaded 時載入一次
});