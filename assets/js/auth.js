/**
 * ACCUTAX - Auth & User Session Management
 * Sistem autentikasi berbasis browser (localStorage) dengan hak akses Admin & Pengguna
 */

window.AuthModule = (function () {
  const ADMIN_LIST = [
    { username: "syafira daniela nahuway", password: "23755099", name: "DEVELOPER Syafira", role: "admin" },
    { username: "arinia amanda", password: "23755039", name: "Admin pajak Arinia", role: "admin" },
    { username: "aghata syaliza", password: "23755070", name: "Admin pajak Aghata", role: "admin" },
    { username: "aisyah firnanda", password: "23755071", name: "Admin pajak Aisyah", role: "admin" },
    { username: "fatimah azzarah", password: "23755081", name: "Admin pajak Fatimah", role: "admin" }
  ];

  function getSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const activeName = localStorage.getItem('activeName') || '';
    const activeRole = localStorage.getItem('activeRole') || 'guest';
    return { isLoggedIn, name: activeName, role: activeRole };
  }

  function login(usernameOrEmail, password) {
    const userVal = (usernameOrEmail || '').trim().toLowerCase();
    const passVal = (password || '').trim();

    // 1. Cek Admin
    const foundAdmin = ADMIN_LIST.find(
      a => a.username.toLowerCase() === userVal && a.password === passVal
    );
    if (foundAdmin) {
      setSession(foundAdmin.name, foundAdmin.role);
      return { success: true, user: foundAdmin };
    }

    // 2. Cek Pengguna Terdaftar
    const userDB = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const foundUser = userDB.find(
      u => (u.email.toLowerCase() === userVal || u.name.toLowerCase() === userVal) && u.password === passVal
    );

    if (foundUser) {
      setSession(foundUser.name, 'user');
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

    const userDB = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    if (userDB.some(u => u.email.toLowerCase() === emailVal)) {
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
  }

  function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('activeName');
    localStorage.removeItem('activeRole');
    updateUI();
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
        navLoginBtn.textContent = "Masuk / Daftar";
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
  }

  function switchAuthTab(tab) {
    const viewLogin = document.getElementById('form-login');
    const viewReg = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');

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
    if (typeof ForumModule !== 'undefined') ForumModule.render();
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
    showLogoutModal,
    closeLogoutModal,
    confirmLogout
  };
})();
