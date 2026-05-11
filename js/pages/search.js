// js/pages/search.js — Bénin Bizi
const SearchPage = (() => {
  let allProfiles = [];
  let filtered = [];
  let currentFilters = { q: '', country_code: '', age_min: 18, age_max: 70, gender: '' };

  function onlineStatus(last_active_at) {
    if (!last_active_at) return { color: '#C4865A', label: 'Hors ligne' };
    const diff = Date.now() - new Date(last_active_at);
    if (diff < 600000)  return { color: '#16A34A', label: 'En ligne' };
    if (diff < 3600000) return { color: '#F59E0B', label: 'Absent' };
    return { color: '#C4865A', label: 'Hors ligne' };
  }

  function FLAG(code) {
    if (!code || code.length !== 2) return '🌍';
    try { return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)); }
    catch { return '🌍'; }
  }

  function renderCard(p) {
    const status = onlineStatus(p.last_active_at);
    const age = p.age || '?';
    const flag = FLAG(p.country_code);
    const photo = p.main_photo
      ? '<img src="' + p.main_photo + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">'
      : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(135deg,#8B1A00,#D4380D);">👤</div>';

    return '<div onclick="SearchPage.openProfile(\'' + p.uuid + '\')" style="background:#FFFFFF;border-radius:16px;overflow:hidden;cursor:pointer;border:1.5px solid #FFE4C4;position:relative;box-shadow:0 2px 12px rgba(212,56,13,0.06);">' +
      '<div style="position:relative;aspect-ratio:3/4;background:linear-gradient(135deg,#8B1A00,#D4380D);">' +
        photo +
        '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(61,26,0,0.85) 0%,transparent 50%);"></div>' +
        '<div style="position:absolute;top:8px;right:8px;width:12px;height:12px;border-radius:50%;background:' + status.color + ';border:2px solid white;"></div>' +
        (p.is_verified ? '<div style="position:absolute;top:8px;left:8px;background:rgba(34,197,94,0.9);color:white;font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;">✅</div>' : '') +
        '<div style="position:absolute;bottom:0;left:0;right:0;padding:10px;">' +
          '<div style="font-family:Playfair Display,serif;font-size:15px;font-weight:700;color:#FFE5B4;">' + p.first_name + ', ' + age + '</div>' +
          '<div style="font-size:11px;color:rgba(255,229,180,0.8);">' + flag + ' ' + (p.city || p.country_name || '') + '</div>' +
          '<div style="font-size:10px;color:' + status.color + ';margin-top:2px;">● ' + status.label + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;padding:8px;background:#FFFFFF;">' +
        '<button onclick="event.stopPropagation();SearchPage.quickLike(\'' + p.uuid + '\',this)" style="flex:1;background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:8px;border-radius:50px;font-size:13px;cursor:pointer;font-weight:700;">♥</button>' +
        '<button onclick="event.stopPropagation();SearchPage.quickChat(\'' + p.uuid + '\')" style="flex:1;background:#FFF0E0;border:1.5px solid #FFD4A0;color:#8B1A00;padding:8px;border-radius:50px;font-size:13px;cursor:pointer;">💬</button>' +
      '</div>' +
    '</div>';
  }

  function applyFilters() {
    filtered = allProfiles.filter(function(p) {
      if (currentFilters.q) {
        const q = currentFilters.q.toLowerCase();
        if (!(p.first_name||'').toLowerCase().includes(q) &&
            !(p.city||'').toLowerCase().includes(q) &&
            !(p.profession||'').toLowerCase().includes(q)) return false;
      }
      if (currentFilters.gender && p.gender !== currentFilters.gender) return false;
      if (currentFilters.country_code && p.country_code !== currentFilters.country_code) return false;
      if (p.age && p.age < currentFilters.age_min) return false;
      if (p.age && p.age > currentFilters.age_max) return false;
      return true;
    });
    renderGrid();
  }

  function renderGrid() {
    const grid = document.getElementById('search-grid');
    const count = document.getElementById('search-count');
    if (!grid) return;
    if (count) count.textContent = filtered.length + ' membre' + (filtered.length > 1 ? 's' : '');
    if (!filtered.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">🔍</div><p style="color:#C4865A;">Aucun profil ne correspond à votre recherche</p></div>';
      return;
    }
    grid.innerHTML = filtered.map(renderCard).join('');
  }

  function setActiveBtn(btn) {
    document.querySelectorAll('.search-filter-btn').forEach(b => {
      b.style.background = '#FFF0E0';
      b.style.color = '#8B1A00';
      b.style.border = '1.5px solid #FFD4A0';
    });
    if (btn) {
      btn.style.background = 'linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00)';
      btn.style.color = '#FFE5B4';
      btn.style.border = 'none';
    }
  }

  async function render() {
    const page = document.getElementById('page-search');
    if (!page) return;

    page.innerHTML =
      '<div class="page-header" style="padding:12px 16px 8px;background:rgba(255,248,240,0.97);border-bottom:1px solid #FFE4C4;">' +
        '<div style="font-family:Playfair Display,serif;font-size:18px;font-weight:900;color:#8B1A00;">Recherche 🔍</div>' +
      '</div>' +
      '<div style="padding:12px 16px;display:flex;gap:8px;">' +
        '<div style="flex:1;position:relative;">' +
          '<input id="search-input" type="text" placeholder="Prénom, ville..." style="width:100%;background:#FFF0E0;border:1.5px solid #FFD4A0;border-radius:50px;padding:10px 16px 10px 40px;color:#3D1A00;font-size:14px;outline:none;box-sizing:border-box;" oninput="SearchPage.doSearch(this.value)">' +
          '<span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#C4865A;font-size:16px;">🔍</span>' +
        '</div>' +
      '</div>' +
      '<div style="padding:0 16px 10px;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;">' +
        '<button class="search-filter-btn" onclick="SearchPage.filterGender(\'\',this)" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);color:#FFE5B4;border:none;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;">Tous</button>' +
        '<button class="search-filter-btn" onclick="SearchPage.filterGender(\'woman\',this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">👩 Femmes</button>' +
        '<button class="search-filter-btn" onclick="SearchPage.filterGender(\'man\',this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">👨 Hommes</button>' +
        '<button class="search-filter-btn" onclick="SearchPage.filterByCountry(\'TG\',this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">🇹🇬 Togo</button>' +
        '<button class="search-filter-btn" onclick="SearchPage.filterByCountry(\'BJ\',this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">🇧🇯 Bénin</button>' +
      '</div>' +
      '<div style="padding:0 16px 6px;display:flex;align-items:center;justify-content:space-between;">' +
        '<span id="search-count" style="font-size:13px;color:#C4865A;font-family:Plus Jakarta Sans,sans-serif;"></span>' +
        '<span style="font-size:12px;color:#C4865A;">🟢 En ligne &nbsp; 🟡 Absent</span>' +
      '</div>' +
      '<div id="search-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 80px;overflow-y:auto;"></div>';

    try {
      const data = await API.get('/feed?limit=50');
      allProfiles = data?.data || [];
      applyFilters();
    } catch(e) {
      document.getElementById('search-grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><div style="font-size:40px;">⚠️</div><p style="color:#C4865A;">Erreur de chargement</p></div>';
    }
  }

  return {
    render,

    doSearch(q) {
      currentFilters.q = q;
      applyFilters();
    },

    filterGender(gender, btn) {
      setActiveBtn(btn);
      currentFilters.gender = gender;
      currentFilters.country_code = '';
      applyFilters();
    },

    filterByCountry(code, btn) {
      setActiveBtn(btn);
      currentFilters.country_code = code;
      currentFilters.gender = '';
      applyFilters();
    },

    filterContinent(continent, btn) {
      setActiveBtn(btn);
      currentFilters.country_code = '';
      applyFilters();
    },

    async quickLike(uuid, btn) {
      if (btn) { btn.style.background = '#FFB347'; btn.textContent = '✓'; }
      try { await API.post('/swipe', { uuid, action: 'like' }); Toast.success('Like envoyé ♥'); }
      catch(e) { Toast.error('Erreur'); }
    },

    quickChat(uuid) {
      const profile = allProfiles.find(p => p.uuid === uuid);
      if (profile) ChatPage.open(profile);
    },

    openProfile(uuid) {
      const profile = allProfiles.find(p => p.uuid === uuid);
      if (profile) {
        Modal.show(
          '<div style="text-align:center;padding:8px;">' +
            (profile.main_photo ? '<img src="' + profile.main_photo + '" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #D4380D;margin-bottom:12px;">' : '<div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#8B1A00,#D4380D);display:flex;align-items:center;justify-content:center;font-size:48px;margin:0 auto 12px;">👤</div>') +
            '<div style="font-family:Playfair Display,serif;font-size:22px;font-weight:900;color:#3D1A00;">' + profile.first_name + ', ' + (profile.age||'?') + '</div>' +
            '<div style="font-size:13px;color:#C4865A;margin:4px 0 12px;">' + FLAG(profile.country_code) + ' ' + (profile.city||profile.country_name||'') + '</div>' +
            (profile.bio ? '<p style="font-size:13px;color:#57534E;line-height:1.5;margin-bottom:16px;">' + profile.bio + '</p>' : '') +
            '<div style="display:flex;gap:10px;justify-content:center;">' +
              '<button onclick="SearchPage.quickLike(\'' + profile.uuid + '\',this);Modal.close()" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:12px 24px;border-radius:50px;font-weight:700;cursor:pointer;font-family:Playfair Display,serif;">♥ Liker</button>' +
              '<button onclick="SearchPage.quickChat(\'' + profile.uuid + '\');Modal.close()" style="background:#FFF0E0;border:1.5px solid #FFD4A0;color:#8B1A00;padding:12px 24px;border-radius:50px;cursor:pointer;">💬 Chat</button>' +
            '</div>' +
          '</div>', profile.first_name
        );
      }
    },

    showFilters() {
      Toast.info('Utilisez les filtres en haut 👆');
    },
  };
})();

