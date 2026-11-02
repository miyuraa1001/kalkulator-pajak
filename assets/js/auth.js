/**
 * ACCUTAX - Auth & User Session Management
 * Sistem autentikasi aman:
 * - Kredensial Administrator diverifikasi melalui Serverless API Endpoint (/api/auth) pada Vercel.
 * - Password admin TIDAK disimpan dalam kode sumber frontend sehingga tidak bocor ke publik.
 * - Sesi pengguna tersimpan aman di browser (localStorage) dengan role admin / user.
 */

window.AuthModule = (function () {
  function getSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const activeName = localStorage.getItem('activeName') || '';
    const activeRole = localStorage.getItem('activeRole') || 'guest';
    return { isLoggedIn, name: activeName, role: activeRole };
  }

  async function login(usernameOrEmail, password) {
    const userVal = (usernameOrEmail || '').trim().toLowerCase();
    const passVal = (password || '').trim();

    if (!userVal || !passVal) {
      return { success: false, message: 'Username/Email dan Password wajib diisi.' };
    }

    // 1. Coba verifikasi ke Serverless Endpoint Vercel (/api/auth) jika tersedia
    if (window.location.protocol.startsWith('http')) {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userVal, password: passVal })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.user) {
            setSession(data.user.name, data.user.role || 'admin');
            return { success: true, user: data.user };
          }
        }
      } catch (err) {
        console.warn('[ACCUTAX] Backend /api/auth offline atau running pada mode statis.');
      }
    }

    // 2. Cek Pengguna Terdaftar Lokal (localStorage)
    let userDB = [];
    try {
      userDB = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      if (!Array.isArray(userDB)) userDB = [];
    } catch (e) {
      userDB = [];
    }

    const foundUser = userDB.find(
      u => ((u.email && u.email.toLowerCase() === userVal) || (u.name && u.name.toLowerCase() === userVal)) && u.password === passVal
    );

    if (foundUser) {
      setSession(foundUser.name, foundUser.role || 'user');
      return { success: true, user: foundUser };
    }

    return { success: false, message: 'Username/Email atau Password salah.' };
  }

  function register(name, email, password) {
    const nameVal = (name || '').trim();
    const emailVal = (email || '').trim().toLowerCase();
    const passVal = (password || '').trim();

    if (!nameVal || !emailVal || !passVal) {
      return { success: false, message: 'Harap isi semua kolom dengan lengkap.' };
    }

    if (passVal.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter.' };
    }

    let userDB = [];
    try {
      userDB = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      if (!Array.isArray(userDB)) userDB = [];
    } catch (e) {
      userDB = [];
    }

    if (userDB.some(u => u.email && u.email.toLowerCase() === emailVal)) {
      return { success: false, message: 'Email sudah terdaftar. Silakan masuk.' };
    }

    userDB.push({ name: nameVal, email: emailVal, password: passVal, role: 'user' });
    localStorage.setItem('registeredUsers', JSON.stringify(userDB));

    return { success: true, message: 'Pendaftaran berhasil! Silakan masuk.' };
  }

  function setSession(name, role) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('activeName', name);
    localStorage.setItem('activeRole', role);
    updateUI();
    if (typeof ForumModule !== 'undefined' && ForumModule.render) {
      ForumModule.render();
    }
  }

  function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('activeName');
    localStorage.removeItem('activeRole');
    updateUI();
    if (typeof ForumModule !== 'undefined' && ForumModule.render) {
      ForumModule.render();
    }
  }

  function updateUI() {
    const session = getSession();
    const navLoginBtn = document.getElementById('nav-login-btn');
    const mobileAuthBtn = document.getElementById('mobile-action-btn');
    const authStatusBadge = document.getElementById('auth-status-badge');

    if (session.isLoggedIn) {
      const shortName = session.name.length > 12 ? session.name.substring(0, 12) + '...' : session.name;
      const roleBadge = session.role === 'admin' ? ' (Admin)' : '';

      if (navLoginBtn) {
        navLoginBtn.innerHTML = `<span>👤 ${shortName}${roleBadge}</span> <span class="text-xs text-rose-300 ml-1 hover:underline">Keluar</span>`;
        navLoginBtn.className = "hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-all cursor-pointer";
        navLoginBtn.onclick = () => showLogoutModal();
      }

      if (mobileAuthBtn) {
        mobileAuthBtn.textContent = `Keluar (${session.name})`;
        mobileAuthBtn.className = "w-full py-3 px-4 rounded-xl font-bold text-white bg-rose-700 hover:bg-rose-800 text-center";
        mobileAuthBtn.onclick = () => showLogoutModal();
      }

      if (authStatusBadge) {
        authStatusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">🟢 Terhubung: ${session.name}</span>`;
      }
    } else {
      if (navLoginBtn) {
        navLoginBtn.textContent = "Masuk / Profil";
        navLoginBtn.className = "hidden md:inline-block px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm";
        navLoginBtn.onclick = () => openAuthModal();
      }

      if (mobileAuthBtn) {
        mobileAuthBtn.textContent = "Masuk / Daftar Akun";
        mobileAuthBtn.className = "w-full py-3 px-4 rounded-xl font-bold text-white bg-rose-900 hover:bg-rose-950 text-center";
        mobileAuthBtn.onclick = () => openAuthModal();
      }

      if (authStatusBadge) {
        authStatusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">Mode Tamu (Dapat Menghitung Bebas)</span>`;
      }
    }
  }

  function openAuthModal(view = 'login') {
    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      switchAuthTab(view);
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    const errorEl = document.getElementById('login-error');
    if (errorEl) errorEl.classList.add('hidden');
  }

  function switchAuthTab(tab) {
    const viewLogin = document.getElementById('form-login');
    const viewReg = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    const errorLog = document.getElementById('login-error');
    const errorReg = document.getElementById('reg-error');
    const successReg = document.getElementById('reg-success');

    if (errorLog) errorLog.classList.add('hidden');
    if (errorReg) errorReg.classList.add('hidden');
    if (successReg) successReg.classList.add('hidden');

    if (tab === 'login') {
      if (viewLogin) viewLogin.classList.remove('hidden');
      if (viewReg) viewReg.classList.add('hidden');
      if (tabLogin) tabLogin.className = "flex-1 py-3.5 text-center font-bold text-rose-900 border-b-2 border-rose-900 bg-rose-50/50";
      if (tabReg) tabReg.className = "flex-1 py-3.5 text-center font-semibold text-slate-500 hover:text-rose-900";
    } else {
      if (viewLogin) viewLogin.classList.add('hidden');
      if (viewReg) viewReg.classList.remove('hidden');
      if (tabLogin) tabLogin.className = "flex-1 py-3.5 text-center font-semibold text-slate-500 hover:text-rose-900";
      if (tabReg) tabReg.className = "flex-1 py-3.5 text-center font-bold text-rose-900 border-b-2 border-rose-900 bg-rose-50/50";
    }
  }

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userInput = document.getElementById('auth-user');
    const passInput = document.getElementById('auth-pass');
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.querySelector('#form-login button[type="submit"]');

    if (errorEl) errorEl.classList.add('hidden');

    const username = userInput ? userInput.value : '';
    const password = passInput ? passInput.value : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Memverifikasi...</span>';
    }

    try {
      const res = await login(username, password);
      if (res.success) {
        if (passInput) passInput.value = '';
        closeAuthModal();
      } else {
        if (errorEl) {
          errorEl.textContent = res.message || 'Username/Email atau Password salah.';
          errorEl.classList.remove('hidden');
        } else {
          alert(res.message);
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Terjadi kesalahan sistem saat proses masuk.';
        errorEl.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Masuk ke Akun</span>';
      }
    }
    return false;
  }

  function handleRegister(e) {
    if (e && e.preventDefault) e.preventDefault();
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-pass');
    const errorEl = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    const name = nameInput ? nameInput.value : '';
    const email = emailInput ? emailInput.value : '';
    const pass = passInput ? passInput.value : '';

    const res = register(name, email, pass);
    if (res.success) {
      if (passInput) passInput.value = '';
      if (successEl) {
        successEl.textContent = res.message;
        successEl.classList.remove('hidden');
        setTimeout(() => {
          switchAuthTab('login');
          if (successEl) successEl.classList.add('hidden');
        }, 1200);
      } else {
        alert(res.message);
        switchAuthTab('login');
      }
    } else {
      if (errorEl) {
        errorEl.textContent = res.message;
        errorEl.classList.remove('hidden');
      } else {
        alert(res.message);
      }
    }
    return false;
  }

  function showLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function confirmLogout() {
    logout();
    closeLogoutModal();
  }

  return {
    getSession,
    login,
    register,
    logout,
    updateUI,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    handleLogin,
    handleRegister,
    showLogoutModal,
    closeLogoutModal,
    confirmLogout
  };
})();
