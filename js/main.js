document.addEventListener('DOMContentLoaded', () => {
  let editMode = false;
  const editBtn = document.getElementById('edit-btn');
  const downloadBtn = document.getElementById('download-btn');
  const editableElements = document.querySelectorAll('[contenteditable]');
  const profileContainer = document.getElementById('profile-img-container');
  const buttons = document.querySelectorAll('.ripple');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  buttons.forEach((button) => {
    button.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      profileContainer.style.backgroundImage = `url('${dataUrl}')`;
      localStorage.setItem('profileImage', dataUrl);
    };
    reader.readAsDataURL(file);
  });

  function loadFromLocalStorage() {
    editableElements.forEach((el) => {
      const key = el.dataset.key;
      if (!key) return;
      const saved = localStorage.getItem(key);
      if (saved !== null) el.innerHTML = saved;
    });

    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      profileContainer.style.backgroundImage = `url('${savedImage}')`;
    }
  }

  let saveTimeout;
  function saveToLocalStorage() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      editableElements.forEach((el) => {
        const key = el.dataset.key;
        if (!key) return;
        const val = el.innerHTML.trim();
        if (val) {
          localStorage.setItem(key, val);
        }
      });

      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        localStorage.setItem('profileImage', savedImage);
      }
    }, 1000);
  }

  function toggleEditMode() {
    editMode = !editMode;
    editBtn.textContent = editMode ? 'Save Changes' : 'Edit Mode';

    editableElements.forEach((el) => {
      el.contentEditable = editMode;
      if (editMode) {
        el.classList.add('editing');
      } else {
        el.classList.remove('editing');
        saveToLocalStorage();
      }
    });

    if (!editMode) {
      document.querySelectorAll('.editing').forEach((el) => {
        el.style.animation = 'pulse 0.5s';
        setTimeout(() => (el.style.animation = ''), 500);
      });
    }
  }

  profileContainer.addEventListener('click', () => {
    if (!editMode) return;
    fileInput.click();
  });

  function downloadPDF() {
    downloadBtn.innerHTML = 'Generating...';
    downloadBtn.disabled = true;

    saveToLocalStorage();

    const element = document.getElementById('resume-container');
    const opt = {
      margin: 10,
      filename: 'resume_karthik.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        downloadBtn.innerHTML = 'Download PDF';
        downloadBtn.disabled = false;
      });
  }

  function init() {
    editableElements.forEach((el) => {
      el.dataset.original = el.innerHTML;
    });

    loadFromLocalStorage();

    toggleEditMode();

    editBtn.addEventListener('click', toggleEditMode);
    downloadBtn.addEventListener('click', downloadPDF);
    editableElements.forEach((el) => {
      el.addEventListener('input', () => {
        if (editMode) {
          el.classList.add('changed');
        }
      });
    });

    window.addEventListener('beforeunload', saveToLocalStorage);

    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menu-toggle');
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  init();
});
