// =============================================
// LOGO BRIEF — SCRIPT.JS
// =============================================

let currentPage = 1;
const uploadedImages = [null, null, null, null, null]; // store base64 per slot

// ---- PAGE NAVIGATION ----
function goToPage(num) {
  const current = document.getElementById(`page${currentPage}`);
  const next = document.getElementById(`page${num}`);

  current.classList.add('exit');
  setTimeout(() => {
    current.classList.remove('active', 'exit');
    current.style.display = 'none';
    currentPage = num;

    next.style.display = 'flex';
    // Force reflow
    void next.offsetWidth;
    next.classList.add('active');

    updateStepIndicator(num);
    window.scrollTo(0, 0);

    if (num === 4) buildSummary();
  }, 350);
}

function updateStepIndicator(active) {
  const dots = document.querySelectorAll('.step-dot');
  const lines = document.querySelectorAll('.step-line');

  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 < active) dot.classList.add('done');
    if (i + 1 === active) dot.classList.add('active');
  });

  lines.forEach((line, i) => {
    line.classList.remove('done');
    if (i + 1 < active) line.classList.add('done');
  });
}

// ---- VALIDATION ----
function validateAndNext(fromPage, toPage) {
  if (fromPage === 2) {
    const required = [
      { id: 'clientName', label: 'Client Name' },
      { id: 'phone', label: 'Phone Number' },
      { id: 'email', label: 'Email' },
      { id: 'projectName', label: 'Project Name' },
      { id: 'projectType', label: 'Project Type' },
    ];

    for (const field of required) {
      const el = document.getElementById(field.id);
      if (!el.value.trim()) {
        showToast(`Please fill in: ${field.label}`);
        el.focus();
        el.style.borderColor = '#c0392b';
        setTimeout(() => el.style.borderColor = '', 2000);
        return;
      }
    }

    // Email validation
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address');
      return;
    }
  }

  if (fromPage === 3) {
    const deadline = document.getElementById('deadline').value;
    if (!deadline) {
      showToast('Please set a Final Deadline');
      return;
    }
    const budget = document.querySelector('input[name="budget"]:checked');
    if (!budget) {
      showToast('Please select a Project Budget');
      return;
    }
  }

  goToPage(toPage);
}

// ---- UPLOAD HANDLERS ----
function triggerUpload(index) {
  const box = document.querySelector(`.upload-box[data-index="${index}"]`);
  const input = box.querySelector('input[type="file"]');
  input.click();
}

function handleUpload(input, index) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    uploadedImages[index] = dataUrl;

    const box = document.querySelector(`.upload-box[data-index="${index}"]`);
    const preview = box.querySelector('.upload-preview');
    const placeholder = box.querySelector('.upload-placeholder');
    const removeBtn = box.querySelector('.upload-remove');

    preview.src = dataUrl;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'flex';
    box.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

function removeUpload(event, index) {
  event.stopPropagation();
  uploadedImages[index] = null;

  const box = document.querySelector(`.upload-box[data-index="${index}"]`);
  const preview = box.querySelector('.upload-preview');
  const placeholder = box.querySelector('.upload-placeholder');
  const removeBtn = box.querySelector('.upload-remove');
  const input = box.querySelector('input[type="file"]');

  preview.src = '';
  preview.style.display = 'none';
  placeholder.style.display = 'flex';
  removeBtn.style.display = 'none';
  box.classList.remove('has-image');
  input.value = '';
}

// ---- DRAG & DROP ----
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.upload-box').forEach((box) => {
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.style.borderColor = 'var(--gold)';
      box.style.background = 'var(--gold-dim)';
    });
    box.addEventListener('dragleave', () => {
      box.style.borderColor = '';
      box.style.background = '';
    });
    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.style.borderColor = '';
      box.style.background = '';
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const index = parseInt(box.dataset.index);
      const input = box.querySelector('input[type="file"]');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleUpload(input, index);
    });
  });
});

// ---- BUILD SUMMARY ----
function getChecked(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(el => el.value).join(', ') || '—';
}

function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '—';
}

function buildSummary() {
  const data = [
    { label: 'Client Name', value: document.getElementById('clientName').value || '—' },
    { label: 'Website', value: document.getElementById('website').value || '—' },
    { label: 'Phone', value: document.getElementById('phone').value || '—' },
    { label: 'Email', value: document.getElementById('email').value || '—' },
    { label: 'Project Name', value: document.getElementById('projectName').value || '—' },
    { label: 'Project Type', value: document.getElementById('projectType').value || '—' },
    { label: 'Target Audience', value: getChecked('audience') },
    { label: 'Favorite Colours', value: document.getElementById('colours').value || '—' },
    { label: 'Logo Type', value: getRadio('logoType') },
    { label: 'Logo Applications', value: getChecked('apps') },
    { label: 'Final Deadline', value: document.getElementById('deadline').value || '—' },
    { label: 'Project Budget', value: getRadio('budget') },
    { label: 'About Project', value: document.getElementById('aboutProject').value || '—', full: true },
  ];

  const container = document.getElementById('summaryData');
  container.innerHTML = '';

  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'summary-item' + (item.full ? ' full-width' : '');
    div.innerHTML = `
      <div class="summary-label">${item.label}</div>
      <div class="summary-value">${escapeHtml(item.value)}</div>
    `;
    container.appendChild(div);
  });

  // Images
  const imgs = uploadedImages.filter(Boolean);
  if (imgs.length > 0) {
    const div = document.createElement('div');
    div.className = 'summary-item full-width';
    div.innerHTML = `
      <div class="summary-label">Reference Images (${imgs.length})</div>
      <div class="summary-images">
        ${imgs.map(src => `<img src="${src}" alt="Reference" />`).join('')}
      </div>
    `;
    container.appendChild(div);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- PDF GENERATION ----
async function generatePDF() {
  const btn = document.querySelector('.btn-send');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    // --- Helpers ---
    const addPage = () => {
      doc.addPage();
      y = margin;
    };

    const checkPageBreak = (needed = 10) => {
      if (y + needed > pageH - margin) addPage();
    };

    // --- HEADER ---
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setFillColor(212, 160, 23);
    doc.rect(0, 0, 6, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(212, 160, 23);
    doc.text('LOGO', margin, 22);
    doc.setTextColor(240, 240, 240);
    doc.text(' BRIEF', margin + 28, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Design Questionnaire', margin, 32);

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(date, pageW - margin, 32, { align: 'right' });

    y = 52;

    // --- Section helper ---
    const addSection = (title) => {
      checkPageBreak(20);
      doc.setFillColor(18, 18, 18);
      doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
      doc.setFillColor(212, 160, 23);
      doc.rect(margin, y, 3, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(212, 160, 23);
      doc.text(title.toUpperCase(), margin + 7, y + 6.2);
      y += 14;
    };

    // --- Field helper ---
    const addField = (label, value, fullWidth = false) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 130, 10);
      doc.text(label.toUpperCase(), margin, y);
      y += 5;

      doc.setFillColor(26, 26, 26);
      const boxH = 9;
      doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(220, 220, 220);

      const valStr = value || '—';
      const lines = doc.splitTextToSize(valStr, contentW - 10);
      const extraH = Math.max(0, (lines.length - 1) * 5);

      if (lines.length > 1) {
        doc.setFillColor(26, 26, 26);
        doc.roundedRect(margin, y, contentW, boxH + extraH, 2, 2, 'F');
        lines.forEach((line, i) => {
          doc.text(line, margin + 4, y + 6.2 + i * 5);
        });
        y += boxH + extraH + 6;
      } else {
        doc.text(valStr, margin + 4, y + 6.2);
        y += boxH + 6;
      }
    };

    // --- Two column fields ---
    const addTwoFields = (f1, f2) => {
      checkPageBreak(18);
      const half = (contentW - 8) / 2;

      // Field 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 130, 10);
      doc.text(f1.label.toUpperCase(), margin, y);
      doc.text(f2.label.toUpperCase(), margin + half + 8, y);
      y += 5;

      doc.setFillColor(26, 26, 26);
      doc.roundedRect(margin, y, half, 9, 2, 2, 'F');
      doc.roundedRect(margin + half + 8, y, half, 9, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(220, 220, 220);
      doc.text(f1.value || '—', margin + 4, y + 6.2);
      doc.text(f2.value || '—', margin + half + 12, y + 6.2);
      y += 15;
    };

    // --- CLIENT INFO ---
    addSection('Client Information');
    addTwoFields(
      { label: 'Client Name', value: document.getElementById('clientName').value },
      { label: 'Website', value: document.getElementById('website').value }
    );
    addTwoFields(
      { label: 'Phone', value: document.getElementById('phone').value },
      { label: 'Email', value: document.getElementById('email').value }
    );

    // --- PROJECT DETAILS ---
    addSection('Project Details');
    addTwoFields(
      { label: 'Project Name', value: document.getElementById('projectName').value },
      { label: 'Project Type', value: document.getElementById('projectType').value }
    );
    addField('Target Audience', getChecked('audience'));
    addField('Favorite Colours', document.getElementById('colours').value);
    addField('Logo Type', getRadio('logoType'));

    const aboutVal = document.getElementById('aboutProject').value;
    if (aboutVal) addField('About Project', aboutVal);

    // --- FINAL INFO ---
    addSection('Applications & Final Information');
    addField('Logo Applications', getChecked('apps'));
    addTwoFields(
      { label: 'Final Deadline', value: document.getElementById('deadline').value },
      { label: 'Project Budget', value: getRadio('budget') }
    );

    // --- REFERENCE IMAGES ---
    const images = uploadedImages.filter(Boolean);
    if (images.length > 0) {
      checkPageBreak(30);
      addSection('Reference Images');
      const imgW = 40;
      const imgH = 40;
      const gap = 8;
      let ix = margin;

      for (let i = 0; i < images.length; i++) {
        if (ix + imgW > pageW - margin) {
          ix = margin;
          y += imgH + gap;
          checkPageBreak(imgH + 10);
        }
        try {
          doc.addImage(images[i], 'JPEG', ix, y, imgW, imgH, undefined, 'MEDIUM');
        } catch (e) {
          // skip if image fails
        }
        ix += imgW + gap;
      }
      y += imgH + 10;
    }

    // --- FOOTER on all pages ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(10, 10, 10);
      doc.rect(0, pageH - 14, pageW, 14, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('LOGO BRIEF — Design Questionnaire', margin, pageH - 5);
      doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
    }

    const clientName = document.getElementById('clientName').value || 'client';
    doc.save(`logo-brief-${clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    showToast('PDF downloaded successfully!');
  } catch (err) {
    console.error(err);
    showToast('Error generating PDF. Please try again.');
  } finally {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> SEND / PDF`;
    btn.disabled = false;
  }
}

// ---- TOAST ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- CLEAR VALIDATION BORDERS ----
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => { el.style.borderColor = ''; });
  });
});
