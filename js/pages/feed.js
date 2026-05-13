// js/pages/feed.js — Bénin Bizi
const FeedPage = (() => {
  let profiles = [];
  let currentIdx = 0;
  let isDragging = false;
  let startX = 0, startY = 0;
  let currentX = 0;
  let currentFilters = {};
  let photoIndexes = {};

  const FLAG = (code) => {
    if (!code || code.length !== 2) return '🌍';
    try { return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)); } catch { return '🌍'; }
  };

  function parseDate(raw) {
    if (!raw) return null;
    const s = raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z';
    return new Date(s).getTime();
  }

  async function render() {
    const page = document.getElementById('page-feed');
    if (!page) return;
    page.innerHTML = `
      <div class="page-header" style="padding:12px 16px 8px;background:rgba(255,248,240,0.97);border-bottom:1px solid #FFE4C4;">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="/icons/benin-bizi-logo.jpg" style="width:36px;height:36px;border-radius:10px;object-fit:cover;">
          <span style="font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#8B1A00;">Bénin Bizi</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="header-btn" onclick="FeedPage.showFilters()" style="background:#FFF0E0;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;">⚙️</button>
          <button class="header-btn" onclick="FeedPage.showNotifs()" style="background:#FFF0E0;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;">🔔</button>
          <button id="btn-location-toggle" onclick="FeedPage.toggleLocation()" style="background:${localStorage.getItem('locationEnabled') === 'true' ? '#D4380D' : '#FFF0E0'};border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;transition:background 0.3s;" title="Partager ma position">📍</button>
        </div>
      </div>

      <div id="stories-bar" style="padding:8px 12px;display:flex;gap:12px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;border-bottom:1px solid #FFE4C4;margin-bottom:4px;min-height:65px;"></div>

      <div style="padding:8px 12px 10px;display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
        <button class="continent-btn active" onclick="FeedPage.filterContinent('',this)" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);color:#FFE5B4;border:none;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;">🌍 Tous</button>
        <button class="continent-btn" onclick="FeedPage.filterOnline(this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">🟢 En ligne</button>
        <button class="continent-btn" onclick="FeedPage.filterByDistance(50,this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">📍 Près de moi</button>
        <button class="continent-btn" onclick="FeedPage.filterByCountry('TG',this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">🇹🇬 Togo</button>
        <button class="continent-btn" onclick="FeedPage.filterByCountry('BJ',this)" style="background:#FFF0E0;color:#8B1A00;border:1.5px solid #FFD4A0;border-radius:50px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;">🇧🇯 Bénin</button>
      </div>

      <div style="flex:1;position:relative;padding:0 16px;display:flex;flex-direction:column;">
        <div id="feed-card-area" style="position:relative;flex:1;min-height:340px;margin-bottom:16px;"></div>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:0 0 20px;">
          <button onclick="FeedPage.undoSwipe()"
            style="width:46px;height:46px;border-radius:50%;background:#FFF0E0;border:2px solid #FFD4A0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;"
            title="Annuler">↩️</button>
          <button onclick="FeedPage.swipe('dislike')"
            style="width:60px;height:60px;border-radius:50%;background:#FFF0E0;border:2px solid rgba(239,68,68,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.1);"
            title="Passer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button onclick="FeedPage.swipe('super_like')"
            style="width:50px;height:50px;border-radius:50%;background:#FFF0E0;border:2px solid rgba(245,158,11,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:22px;"
            title="Super Like">⭐</button>
          <button onclick="FeedPage.swipe('like')"
            style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(212,56,13,0.5);color:#FFE5B4;"
            title="J'aime">♥</button>
          <button onclick="FeedPage.openChat()"
            style="width:46px;height:46px;border-radius:50%;background:#FFF0E0;border:2px solid rgba(212,56,13,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;"
            title="Message">💬</button>
        </div>
      </div>
    `;
    if (typeof StoriesPage !== "undefined") StoriesPage.init();
    await loadProfiles();
  }

  async function loadProfiles(filters = {}) {
    currentFilters = filters;
    const area = document.getElementById('feed-card-area');
    if (area) area.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;"><div style="font-size:32px;">🔥</div><div style="font-size:14px;color:#C4865A;font-family:Plus Jakarta Sans,sans-serif;">Chargement...</div></div>';
    try {
      let url = '/feed';
      const params = [];
      if (filters.continent)     params.push('continent=' + filters.continent);
      if (filters.country_code)  params.push('country_code=' + filters.country_code);
      if (filters.age_min)       params.push('age_min=' + filters.age_min);
      if (filters.age_max)       params.push('age_max=' + filters.age_max);
      if (filters.distance_max)  params.push('distance_max=' + filters.distance_max);
      if (params.length) url += '?' + params.join('&');

      const data = await API.get(url);
      let profs = data?.data || [];

      // Filtres côté client
      if (filters.onlineOnly) {
        profs = profs.filter(p => {
          if (!p.last_active_at) return false;
          return Date.now() - parseDate(p.last_active_at) < 3600000;
        });
      }
      if (filters.gender) profs = profs.filter(p => p.gender === filters.gender);

      // Tri par distance si disponible
      if (filters.sort_distance) {
        profs.sort((a, b) => {
          if (a.distance_km === null || a.distance_km === undefined) return 1;
          if (b.distance_km === null || b.distance_km === undefined) return -1;
          return a.distance_km - b.distance_km;
        });
      }

      profiles = profs;
      currentIdx = 0;
      photoIndexes = {};
      if (!profiles.length) { showEmpty(); return; }
      renderStack();
    } catch(e) { showError(); }
  }

  function renderStack() {
    const area = document.getElementById('feed-card-area');
    if (!area) return;
    area.innerHTML = '';
    const visible = Math.min(3, profiles.length - currentIdx);
    for (let i = visible - 1; i >= 0; i--) {
      const profile = profiles[currentIdx + i];
      if (!profile) continue;
      const card = buildCard(profile, i);
      area.appendChild(card);
    }
    initSwipeGestures();
  }

  function buildCard(profile, stackPos) {
    const card = document.createElement('div');
    const scale = 1 - stackPos * 0.05;
    const translateY = stackPos * 10;
    card.id = stackPos === 0 ? 'feed-card' : 'feed-card-bg-' + stackPos;
    card.style.cssText = `
      position:absolute;inset:0;
      background:linear-gradient(135deg,#8B1A00,#D4380D);
      border-radius:20px;overflow:hidden;
      box-shadow:0 ${8 + stackPos*4}px ${30 + stackPos*10}px rgba(139,26,0,0.25);
      transform: scale(${scale}) translateY(${translateY}px);
      transform-origin: bottom center;
      transition: transform 0.3s ease;
      ${stackPos === 0 ? 'cursor:grab;user-select:none;z-index:10;' : 'z-index:' + (9 - stackPos) + ';'}
    `;

    const photoIdx = photoIndexes[profile.uuid] || 0;
    const photos = profile.photos || (profile.main_photo ? [profile.main_photo] : []);
    const imgSrc = photos[photoIdx] || profile.main_photo;
    const age = profile.age || '?';
    const flag = FLAG(profile.country_code);
    const city = profile.city || profile.country_name || '';
    const diff = profile.last_active_at ? Date.now() - parseDate(profile.last_active_at) : Infinity;
    const online = diff < 600000;
    const absent = diff >= 600000 && diff < 3600000;
    const distLabel = (profile.distance_km !== null && profile.distance_km !== undefined)
      ? `<span style="background:rgba(255,229,180,0.2);border-radius:10px;padding:2px 8px;font-size:11px;margin-left:4px;">📍 ${profile.distance_km < 1 ? '<1' : profile.distance_km} km</span>`
      : '';

    card.innerHTML = `
      <div style="position:absolute;inset:0;">
        ${imgSrc
          ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;background:linear-gradient(135deg,#8B1A00,#D4380D);">👤</div>`
        }
      </div>
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(61,26,0,0.90) 0%,rgba(61,26,0,0.15) 50%,transparent 100%);"></div>

      ${stackPos === 0 && photos.length > 1 ? `
        <div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);display:flex;gap:4px;z-index:20;">
          ${photos.map((_, i) => `<div style="width:${i===photoIdx?20:6}px;height:4px;border-radius:2px;background:${i===photoIdx?'white':'rgba(255,255,255,0.4)'};transition:width 0.2s;"></div>`).join('')}
        </div>
        <div style="position:absolute;top:0;left:0;width:40%;height:85%;z-index:15;" onclick="FeedPage.prevPhoto('${profile.uuid}')"></div>
        <div style="position:absolute;top:0;right:0;width:40%;height:85%;z-index:15;" onclick="FeedPage.nextPhoto('${profile.uuid}')"></div>
      ` : ''}

      ${online ? `<div style="position:absolute;top:14px;right:14px;background:rgba(34,197,94,0.9);color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;z-index:11;">🟢 En ligne</div>` : absent ? `<div style="position:absolute;top:14px;right:14px;background:rgba(245,158,11,0.9);color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;z-index:11;">🟡 Absent</div>` : ''}
      ${profile.is_verified ? `<div style="position:absolute;top:14px;left:14px;background:rgba(34,197,94,0.9);color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;z-index:11;">✅ Vérifié</div>` : ''}

      <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 20px 16px;z-index:11;">
        <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#FFE5B4;margin-bottom:4px;">${profile.first_name}, ${age}</div>
        <div style="font-size:13px;color:rgba(255,229,180,0.8);margin-bottom:6px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
          ${flag} ${city}${profile.profession ? ' · ' + profile.profession : ''}${distLabel}
        </div>
        ${profile.bio ? `<div style="font-size:12px;color:rgba(255,229,180,0.65);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${profile.bio}</div>` : ''}
      </div>

      <div id="swipe-nope" style="position:absolute;top:30px;left:20px;border:3px solid #EF4444;border-radius:10px;padding:6px 14px;color:#EF4444;font-weight:900;font-size:20px;transform:rotate(-15deg);opacity:0;transition:opacity 0.1s;z-index:12;">NOPE</div>
      <div id="swipe-like" style="position:absolute;top:30px;right:20px;border:3px solid #FFB347;border-radius:10px;padding:6px 14px;color:#FFB347;font-weight:900;font-size:20px;transform:rotate(15deg);opacity:0;transition:opacity 0.1s;z-index:12;">LIKE</div>
      <div id="swipe-super" style="position:absolute;top:30px;left:50%;transform:translateX(-50%);border:3px solid #F59E0B;border-radius:10px;padding:6px 14px;color:#F59E0B;font-weight:900;font-size:18px;opacity:0;transition:opacity 0.1s;z-index:12;">⭐ SUPER</div>
    `;
    return card;
  }

  function initSwipeGestures() {
    const card = document.getElementById('feed-card');
    if (!card) return;

    card.addEventListener('touchstart', e => {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
    }, {passive:true});

    card.addEventListener('touchmove', e => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX - startX;
      applyDrag(card, currentX);
    }, {passive:true});

    card.addEventListener('touchend', () => {
      isDragging = false;
      commitSwipe(card);
    });

    card.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.clientX;
      currentX = 0;
      card.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      applyDrag(card, currentX);
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (card) card.style.cursor = 'grab';
      commitSwipe(card);
    });

    document.onkeydown = e => {
      if (e.key === 'ArrowLeft')  FeedPage.swipe('dislike');
      if (e.key === 'ArrowRight') FeedPage.swipe('like');
      if (e.key === 'ArrowUp')    FeedPage.swipe('super_like');
      if (e.key === 'ArrowDown')  FeedPage.undoSwipe();
    };
  }

  function applyDrag(card, dx) {
    card.style.transform = `translateX(${dx}px) rotate(${dx * 0.06}deg)`;
    const nope = document.getElementById('swipe-nope');
    const like = document.getElementById('swipe-like');
    if (nope) nope.style.opacity = dx < -30 ? Math.min(1, Math.abs(dx) / 100) : 0;
    if (like) like.style.opacity = dx > 30  ? Math.min(1, dx / 100) : 0;
    const bg = document.getElementById('feed-card-bg-1');
    if (bg) {
      const progress = Math.min(1, Math.abs(dx) / 150);
      const scale = 0.95 + progress * 0.05;
      bg.style.transform = `scale(${scale}) translateY(${10 - progress * 10}px)`;
    }
  }

  function commitSwipe(card) {
    if (Math.abs(currentX) > 80) {
      FeedPage.swipe(currentX > 0 ? 'like' : 'dislike');
    } else {
      if (card) {
        card.style.transition = 'transform 0.35s cubic-bezier(.2,1,.3,1)';
        card.style.transform = '';
        setTimeout(() => { if (card) card.style.transition = ''; }, 350);
      }
      const nope = document.getElementById('swipe-nope');
      const like = document.getElementById('swipe-like');
      if (nope) nope.style.opacity = 0;
      if (like) like.style.opacity = 0;
    }
    currentX = 0;
  }

  function animateOut(direction) {
    const card = document.getElementById('feed-card');
    if (!card) return Promise.resolve();
    return new Promise(resolve => {
      card.style.transition = 'transform 0.4s ease, opacity 0.4s';
      const dx = direction === 'like' || direction === 'super_like' ? 600 : -600;
      const rot = direction === 'like' || direction === 'super_like' ? 30 : -30;
      card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
      card.style.opacity = '0';
      setTimeout(resolve, 380);
    });
  }

  async function showEmpty() {
    const area = document.getElementById('feed-card-area');
    if (area) area.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:20px;">
        <div style="font-size:60px;">🔥</div>
        <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#3D1A00;text-align:center;">Ce soir, c'est calme...</div>
        <div style="font-size:14px;color:#C4865A;text-align:center;">Reviens plus tard — de nouveaux profils arrivent !</div>
        <button onclick="FeedPage.reload()" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:12px 28px;border-radius:50px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Playfair Display',serif;">🔄 Actualiser</button>
      </div>`;
  }

  function showError() {
    const area = document.getElementById('feed-card-area');
    if (!area) return;
    area.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">
        <div style="font-size:40px;">⚠️</div>
        <div style="font-size:14px;color:#C4865A;">Erreur de chargement</div>
        <button onclick="FeedPage.reload()" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:10px 24px;border-radius:50px;font-size:13px;cursor:pointer;font-weight:700;">Réessayer</button>
      </div>`;
  }

  function showMatchModal(profile) {
    const photo = profile.main_photo
      ? `<img src="${profile.main_photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #D4380D;">`
      : `<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#8B1A00,#D4380D);display:flex;align-items:center;justify-content:center;font-size:36px;">👤</div>`;
    Modal.show(
      `<div style="text-align:center;padding:16px;">
        <div style="font-size:48px;margin-bottom:12px;">🔥</div>
        ${photo}
        <h2 style="font-family:'Playfair Display',serif;font-size:22px;color:#3D1A00;margin:12px 0 8px;">C'est un Match !</h2>
        <p style="color:#C4865A;font-size:14px;margin-bottom:20px;"><strong style="color:#D4380D;">${profile.first_name}</strong> vous a aussi liké !</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button onclick="Modal.close();ChatPage.open(FeedPage.getCurrentProfile())" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:12px 24px;border-radius:50px;font-weight:700;cursor:pointer;font-family:'Playfair Display',serif;">💬 Écrire</button>
          <button onclick="Modal.close()" style="background:#FFF0E0;border:1px solid #FFD4A0;color:#8B1A00;padding:12px 24px;border-radius:50px;cursor:pointer;">Continuer</button>
        </div>
      </div>`, '');
  }

  return {
    render,
    getCurrentProfile() { return profiles[currentIdx] || null; },

    nextPhoto(uuid) {
      const profile = profiles.find(p => p.uuid === uuid);
      if (!profile) return;
      const photos = profile.photos || (profile.main_photo ? [profile.main_photo] : []);
      const idx = photoIndexes[uuid] || 0;
      photoIndexes[uuid] = Math.min(idx + 1, photos.length - 1);
      renderStack();
    },

    prevPhoto(uuid) {
      const idx = photoIndexes[uuid] || 0;
      photoIndexes[uuid] = Math.max(idx - 1, 0);
      renderStack();
    },

    async swipe(action) {
      const profile = profiles[currentIdx];
      if (!profile) return;
      if (action === 'super_like') {
        const user = AuthService.getUser();
        if (!user?.is_premium) {
          Toast.info('Super Likes illimités avec Premium ⭐');
          App.navigate('pricing');
          return;
        }
      }
      await animateOut(action);
      try {
        if (profile.profile_type !== 'demo') {
          const result = await API.post('/swipe', { uuid: profile.uuid, action });
          if (result?.data?.matched) showMatchModal(profile);
        } else if ((action === 'like' || action === 'super_like') && Math.random() > 0.4) {
          showMatchModal(profile);
        }
      } catch(e) { console.log('Swipe error:', e); }
      currentIdx++;
      if (currentIdx >= profiles.length) showEmpty();
      else renderStack();
    },

    undoSwipe() {
      const user = AuthService.getUser();
      if (!user?.is_premium) {
        Toast.info('Annuler un swipe est une fonctionnalité Premium ⭐');
        App.navigate('pricing');
        return;
      }
      if (currentIdx <= 0) { Toast.info('Aucun swipe à annuler'); return; }
      API.post('/undo', {}).then(() => {
        currentIdx--;
        renderStack();
        Toast.success('Swipe annulé ↩️');
      }).catch(() => Toast.error('Erreur annulation'));
    },

    openChat() {
      const profile = profiles[currentIdx];
      if (!profile) { Toast.info('Aucun profil affiché'); return; }
      ChatPage.open(profile);
    },

    filterContinent(continent, btn) {
      document.querySelectorAll('.continent-btn').forEach(b => {
        b.style.background = '#FFF0E0'; b.style.color = '#8B1A00'; b.style.border = '1.5px solid #FFD4A0';
      });
      if (btn) { btn.style.background = 'linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00)'; btn.style.color = '#FFE5B4'; btn.style.border = 'none'; }
      profiles = []; currentIdx = 0; photoIndexes = {};
      loadProfiles({ continent });
    },

    filterByCountry(country_code, btn) {
      document.querySelectorAll('.continent-btn').forEach(b => {
        b.style.background = '#FFF0E0'; b.style.color = '#8B1A00'; b.style.border = '1.5px solid #FFD4A0';
      });
      if (btn) { btn.style.background = 'linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00)'; btn.style.color = '#FFE5B4'; btn.style.border = 'none'; }
      profiles = []; currentIdx = 0; photoIndexes = {};
      loadProfiles({ country_code });
    },

    filterByDistance(km, btn) {
      document.querySelectorAll('.continent-btn').forEach(b => {
        b.style.background = '#FFF0E0'; b.style.color = '#8B1A00'; b.style.border = '1.5px solid #FFD4A0';
      });
      if (btn) { btn.style.background = 'linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00)'; btn.style.color = '#FFE5B4'; btn.style.border = 'none'; }
      profiles = []; currentIdx = 0; photoIndexes = {};
      loadProfiles({ distance_max: km, sort_distance: true });
    },

    filterOnline(btn) {
      document.querySelectorAll('.continent-btn').forEach(b => {
        b.style.background = '#FFF0E0'; b.style.color = '#8B1A00'; b.style.border = '1.5px solid #FFD4A0';
      });
      if (btn) { btn.style.background = 'linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00)'; btn.style.color = '#FFE5B4'; btn.style.border = 'none'; }
      profiles = []; currentIdx = 0; photoIndexes = {};
      loadProfiles({ onlineOnly: true });
    },

    showFilters() {
      const f = currentFilters;
      const distVal = f.distance_max || 10000;
      const distLabel = distVal >= 10000 ? 'Monde entier' : distVal + ' km';
      Modal.show(`
        <div style="display:flex;flex-direction:column;gap:16px;padding-bottom:8px;">

          <div>
            <label style="font-size:12px;color:#C4865A;text-transform:uppercase;letter-spacing:1px;font-weight:700;">👤 Genre recherché</label>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button id="fg-all"   onclick="FeedPage._setGenderBtn('')"      style="flex:1;padding:9px 6px;border-radius:50px;border:1.5px solid #FFD4A0;background:${!f.gender?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${!f.gender?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;">Tous</button>
              <button id="fg-woman" onclick="FeedPage._setGenderBtn('woman')" style="flex:1;padding:9px 6px;border-radius:50px;border:1.5px solid #FFD4A0;background:${f.gender==='woman'?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${f.gender==='woman'?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;">♀ Femmes</button>
              <button id="fg-man"   onclick="FeedPage._setGenderBtn('man')"   style="flex:1;padding:9px 6px;border-radius:50px;border:1.5px solid #FFD4A0;background:${f.gender==='man'?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${f.gender==='man'?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;">♂ Hommes</button>
            </div>
          </div>

          <div style="border-top:1px solid #FFE4C4;padding-top:14px;">
            <label style="font-size:12px;color:#C4865A;text-transform:uppercase;letter-spacing:1px;font-weight:700;">🎂 Âge : <span id="lbl-amin">${f.age_min||18}</span> – <span id="lbl-amax">${f.age_max||60}</span> ans</label>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">
              <input type="range" min="18" max="65" value="${f.age_min||18}" style="width:100%;accent-color:#D4380D;"
                oninput="document.getElementById('lbl-amin').textContent=this.value;FeedPage._tmpFilters.age_min=+this.value">
              <input type="range" min="18" max="70" value="${f.age_max||60}" style="width:100%;accent-color:#D4380D;"
                oninput="document.getElementById('lbl-amax').textContent=this.value;FeedPage._tmpFilters.age_max=+this.value">
            </div>
          </div>

          <div style="border-top:1px solid #FFE4C4;padding-top:14px;">
            <label style="font-size:12px;color:#C4865A;text-transform:uppercase;letter-spacing:1px;font-weight:700;">📍 Distance max : <span id="lbl-dist">${distLabel}</span></label>
            <div style="margin-top:10px;">
              <input type="range" id="slider-dist" min="0" max="10000" step="50" value="${distVal}" style="width:100%;accent-color:#D4380D;"
                oninput="(function(v){document.getElementById('lbl-dist').textContent=v>=10000?'Monde entier':v+'km';FeedPage._tmpFilters.distance_max=v>=10000?null:v;FeedPage._tmpFilters.sort_distance=v<10000;})(+this.value)">
              <div style="display:flex;justify-content:space-between;font-size:10px;color:#C4865A;margin-top:6px;">
                <span>0</span><span>100km</span><span>500km</span><span>2000km</span><span>🌍</span>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid #FFE4C4;padding-top:14px;">
            <label style="font-size:12px;color:#C4865A;text-transform:uppercase;letter-spacing:1px;font-weight:700;">💞 Je recherche</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
              <button id="rel-any"     onclick="FeedPage._setRelation('any')"     style="padding:12px 8px;border-radius:14px;border:1.5px solid ${(f.relation_type||'any')==='any'?'#D4380D':'#FFD4A0'};background:${(f.relation_type||'any')==='any'?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${(f.relation_type||'any')==='any'?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;text-align:center;">🦋<br><span style="font-size:11px;">Ouvert à tout</span></button>
              <button id="rel-serious" onclick="FeedPage._setRelation('serious')" style="padding:12px 8px;border-radius:14px;border:1.5px solid ${f.relation_type==='serious'?'#D4380D':'#FFD4A0'};background:${f.relation_type==='serious'?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${f.relation_type==='serious'?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;text-align:center;">💍<br><span style="font-size:11px;">Relation sérieuse</span></button>
              <button id="rel-fun"     onclick="FeedPage._setRelation('fun')"     style="padding:12px 8px;border-radius:14px;border:1.5px solid ${f.relation_type==='fun'?'#D4380D':'#FFD4A0'};background:${f.relation_type==='fun'?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${f.relation_type==='fun'?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;text-align:center;">🔥<br><span style="font-size:11px;">Fun & rencontre</span></button>
              <button id="rel-friend"  onclick="FeedPage._setRelation('friend')"  style="padding:12px 8px;border-radius:14px;border:1.5px solid ${f.relation_type==='friend'?'#D4380D':'#FFD4A0'};background:${f.relation_type==='friend'?'linear-gradient(135deg,#8B1A00,#D4380D)':'#FFF0E0'};color:${f.relation_type==='friend'?'#FFE5B4':'#8B1A00'};cursor:pointer;font-size:13px;text-align:center;">🤝<br><span style="font-size:11px;">Amitié</span></button>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:4px;">
            <button onclick="FeedPage._resetFilters()" style="flex:1;background:#FFF0E0;border:1.5px solid #FFD4A0;color:#8B1A00;padding:12px;border-radius:50px;cursor:pointer;font-size:13px;">🔄 Réinitialiser</button>
            <button onclick="FeedPage._applyFilters()" style="flex:2;background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:12px;border-radius:50px;font-weight:700;cursor:pointer;font-size:14px;font-family:'Playfair Display',serif;">Voir les résultats 🔥</button>
          </div>

        </div>`, '⚙️ Filtres');
      this._tmpFilters = { ...f };
    },

    _tmpFilters: {},

    _setGenderBtn(g) {
      this._tmpFilters.gender = g;
      ['all','woman','man'].forEach(k => {
        const el = document.getElementById('fg-' + k);
        if (el) {
          const active = k === (g||'all');
          el.style.background = active ? 'linear-gradient(135deg,#8B1A00,#D4380D)' : '#FFF0E0';
          el.style.color = active ? '#FFE5B4' : '#8B1A00';
        }
      });
    },

    _setRelation(type) {
      this._tmpFilters.relation_type = type;
      ['any','serious','fun','friend'].forEach(k => {
        const el = document.getElementById('rel-' + k);
        if (el) {
          const active = k === type;
          el.style.background = active ? 'linear-gradient(135deg,#8B1A00,#D4380D)' : '#FFF0E0';
          el.style.color = active ? '#FFE5B4' : '#8B1A00';
          el.style.border = active ? '1.5px solid #D4380D' : '1.5px solid #FFD4A0';
        }
      });
    },

    _applyFilters() {
      Modal.close();
      loadProfiles({ ...this._tmpFilters });
      Toast.success('Filtres appliqués ✓');
    },

    _resetFilters() {
      this._tmpFilters = {};
      Modal.close();
      loadProfiles({});
      Toast.info('Filtres réinitialisés');
    },

    showNotifs() { App.navigate('matches'); },

    toggleLocation() {
      const enabled = localStorage.getItem('locationEnabled') === 'true';
      const newState = !enabled;
      localStorage.setItem('locationEnabled', newState);
      const btn = document.getElementById('btn-location-toggle');
      if (btn) btn.style.background = newState ? '#D4380D' : '#FFF0E0';
      if (newState) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(pos) {
            API.put('/me/location', { latitude: pos.coords.latitude, longitude: pos.coords.longitude }).catch(() => {});
            Toast.success('📍 Position partagée !');
          }, function() { Toast.error('Géolocalisation refusée'); });
        }
      } else {
        API.put('/me/location', { latitude: null, longitude: null }).catch(() => {});
        Toast.info('📍 Position masquée');
      }
    },

    async reload() {
      currentIdx = 0;
      profiles = [];
      photoIndexes = {};
      loadProfiles({});
    },
  };
})();
