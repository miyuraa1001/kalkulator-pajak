/**
 * ACCUTAX - Modul Forum Komunitas Diskusi Perpajakan
 */

window.ForumModule = (function () {
  const STORAGE_KEY = 'accutax_forum_data';

  const DEFAULT_POSTS = [
    {
      id: 'post-init-1',
      username: "DEVELOPER Syafira",
      role: "admin",
      content: "Selamat datang di Forum ACCUTAX! Anda dapat mendiskusikan implementasi PP 58/2023 (TER PPh 21), UU HPP (PPN 11%), PPh 23 Jasa, Angsuran PPh 25, maupun insentif PPh Final UMKM PP 55/2022 di sini.",
      likes: 5,
      likedBy: [],
      comments: [
        {
          id: 'comm-1',
          username: "Admin pajak Arinia",
          role: "admin",
          text: "Silakan tanyakan kendala perhitungan PPh 21 dan bukti potong teman-teman ya!",
          timestamp: "28/10/2026, 10.15.00"
        }
      ],
      timestamp: "28/10/2026, 09.00.00"
    }
  ];

  let posts = [];
  let deleteTarget = { type: null, postId: null, commentId: null };

  function init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      posts = stored ? JSON.parse(stored) : DEFAULT_POSTS;
    } catch (e) {
      console.warn("Failed to read forum from localStorage:", e);
      posts = DEFAULT_POSTS;
    }
    render();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn("Failed to save forum data:", e);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createPost() {
    const session = AuthModule.getSession();
    if (!session.isLoggedIn) {
      AuthModule.openAuthModal('login');
      alert("Silakan masuk atau buat akun terlebih dahulu untuk berdiskusi di forum.");
      return;
    }

    const input = document.getElementById('forum-post-input');
    if (!input) return;
    const content = input.value.trim();
    if (!content) {
      alert("Tuliskan pertanyaan atau topik diskusi Anda.");
      return;
    }

    const newPost = {
      id: 'post-' + Date.now(),
      username: session.name,
      role: session.role,
      content: content,
      likes: 0,
      likedBy: [],
      comments: [],
      timestamp: new Date().toLocaleString('id-ID')
    };

    posts.unshift(newPost);
    save();
    render();
    input.value = '';
  }

  function toggleLike(postId) {
    const session = AuthModule.getSession();
    if (!session.isLoggedIn) {
      AuthModule.openAuthModal('login');
      alert("Silakan masuk terlebih dahulu untuk menyukai postingan.");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!Array.isArray(post.likedBy)) post.likedBy = [];
    const idx = post.likedBy.indexOf(session.name);

    if (idx === -1) {
      post.likedBy.push(session.name);
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
    }

    save();
    render();
  }

  function addComment(postId) {
    const session = AuthModule.getSession();
    if (!session.isLoggedIn) {
      AuthModule.openAuthModal('login');
      alert("Silakan masuk terlebih dahulu untuk membalas diskusi.");
      return;
    }

    const input = document.getElementById(`input-${postId}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!Array.isArray(post.comments)) post.comments = [];
    post.comments.push({
      id: 'c-' + Date.now(),
      username: session.name,
      role: session.role,
      text: text,
      timestamp: new Date().toLocaleString('id-ID')
    });

    save();
    render();

    setTimeout(() => {
      const box = document.getElementById(`comment-box-${postId}`);
      if (box) box.classList.remove('hidden');
    }, 50);
  }

  function toggleCommentBox(postId) {
    const box = document.getElementById(`comment-box-${postId}`);
    if (box) box.classList.toggle('hidden');
  }

  function openDeleteModal(type, postId, commentId = null) {
    deleteTarget = { type, postId, commentId };
    const modal = document.getElementById('delete-modal');
    const title = document.getElementById('delete-title');
    const desc = document.getElementById('delete-desc');

    if (title) title.textContent = type === 'post' ? 'Hapus Diskusi?' : 'Hapus Komentar?';
    if (desc) desc.textContent = type === 'post' ? 'Postingan ini beserta tanggapannya akan dihapus secara permanen.' : 'Komentar ini akan dihapus dari diskusi.';

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    deleteTarget = { type: null, postId: null, commentId: null };
  }

  function confirmDelete() {
    if (deleteTarget.type === 'post') {
      posts = posts.filter(p => p.id !== deleteTarget.postId);
      save();
      render();
    } else if (deleteTarget.type === 'comment') {
      const post = posts.find(p => p.id === deleteTarget.postId);
      if (post && Array.isArray(post.comments)) {
        post.comments = post.comments.filter(c => c.id !== deleteTarget.commentId);
        save();
        render();
      }
    }
    closeDeleteModal();
  }

  function render() {
    const feed = document.getElementById('forum-feed');
    if (!feed) return;

    const session = AuthModule.getSession();

    if (posts.length === 0) {
      feed.innerHTML = `
        <div class="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <p class="text-3xl mb-2">💬</p>
          <p class="font-medium">Belum ada diskusi. Jadilah yang pertama memulai percakapan!</p>
        </div>
      `;
      return;
    }

    feed.innerHTML = posts.map(post => {
      const isLiked = session.isLoggedIn && Array.isArray(post.likedBy) && post.likedBy.includes(session.name);
      const isAdmin = post.role === 'admin';
      const canDelete = session.isLoggedIn && (session.name === post.username || session.role === 'admin');

      const roleBadge = isAdmin
        ? '<span class="bg-rose-900 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">ADMIN OFFICIAL</span>'
        : '<span class="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase">Wajib Pajak</span>';

      const cardBg = isAdmin ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 bg-white';

      const deleteBtn = canDelete
        ? `<button onclick="ForumModule.openDeleteModal('post', '${post.id}')" class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Hapus">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
           </button>`
        : '';

      const comments = Array.isArray(post.comments) ? post.comments : [];
      const commentsHtml = comments.map(c => {
        const isCommentAdmin = c.role === 'admin';
        const canDeleteComment = session.isLoggedIn && (session.name === c.username || session.role === 'admin');
        const cDeleteBtn = canDeleteComment
          ? `<button onclick="ForumModule.openDeleteModal('comment', '${post.id}', '${c.id}')" class="text-slate-400 hover:text-rose-600 ml-2 font-bold text-xs" title="Hapus">✕</button>`
          : '';

        return `
          <div class="p-3.5 rounded-xl border ${isCommentAdmin ? 'bg-rose-50/60 border-rose-100' : 'bg-slate-50 border-slate-200'} text-xs flex justify-between items-start">
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="font-bold ${isCommentAdmin ? 'text-rose-900' : 'text-slate-900'}">${escapeHTML(c.username)}</span>
                ${isCommentAdmin ? '<span class="text-[9px] bg-rose-800 text-white px-1.5 py-0.2 rounded font-semibold">DJP Expert</span>' : ''}
              </div>
              <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">${escapeHTML(c.text)}</p>
              <span class="text-[10px] text-slate-400 block mt-1.5">${c.timestamp}</span>
            </div>
            ${cDeleteBtn}
          </div>
        `;
      }).join('');

      return `
        <div class="card-elevated p-6 mb-6 ${cardBg}">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${isAdmin ? 'bg-rose-900' : 'bg-slate-700'}">
                ${(post.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">${escapeHTML(post.username)}</span>
                  ${roleBadge}
                </div>
                <span class="text-[11px] text-slate-400">🕒 ${post.timestamp}</span>
              </div>
            </div>
            ${deleteBtn}
          </div>

          <p class="text-slate-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">${escapeHTML(post.content)}</p>

          <div class="flex items-center gap-6 pt-3 border-t border-slate-100 text-xs font-semibold">
            <button onclick="ForumModule.toggleLike('${post.id}')" class="flex items-center gap-1.5 transition-colors ${isLiked ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-rose-600'}">
              <span>${isLiked ? '❤️' : '🤍'}</span>
              <span>Suka (${post.likes || 0})</span>
            </button>
            <button onclick="ForumModule.toggleCommentBox('${post.id}')" class="flex items-center gap-1.5 text-slate-500 hover:text-rose-900 transition-colors">
              <span>💬</span>
              <span>Tanggapan (${comments.length})</span>
            </button>
          </div>

          <div id="comment-box-${post.id}" class="hidden mt-4 pt-4 border-t border-slate-100">
            <div class="space-y-2 mb-3 max-h-64 overflow-y-auto pr-1">
              ${commentsHtml}
            </div>
            <div class="flex gap-2">
              <input type="text" id="input-${post.id}" class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-rose-900 outline-none" placeholder="Tulis tanggapan atau analisis..." onkeypress="if(event.key === 'Enter') ForumModule.addComment('${post.id}')">
              <button onclick="ForumModule.addComment('${post.id}')" class="px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm">Kirim</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  return {
    init,
    createPost,
    toggleLike,
    addComment,
    toggleCommentBox,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    render
  };
})();
