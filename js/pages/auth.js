// js/pages/auth.js
const AuthPage = (() => {

  let onboardingData = {};
  let currentStep = 1;
  const TOTAL_STEPS = 3;

  function render() {
    const view = document.getElementById('view-auth');
    view.innerHTML = `
      <div style="min-height:100vh;background:#FFF8F0;display:flex;flex-direction:column;overflow-y:scroll;-webkit-overflow-scrolling:touch;">
        <div style="padding:48px 24px 0;text-align:center;">
          <div style="margin:0 auto 8px;">
            <img src="/icons/afro-bizi-logo.png" style="width:260px;height:260px;object-fit:contain;" alt="AfroBizi">
          </div>
          <p style="font-size:15px;font-weight:700;color:#3D1A00;font-family:'Playfair Display',serif;margin-top:8px;">
            Tu pensais avoir tout vu ? Attends d'entrer ici.
          </p>
        </div>

        <div style="display:flex;gap:0;padding:28px 24px 0;border-bottom:1px solid #FFE4C4;margin-top:24px;">
          <button id="tab-login" onclick="AuthPage.showLogin()"
            style="flex:1;padding:12px;background:none;border:none;border-bottom:2px solid #D4380D;color:#3D1A00;font-family:'Playfair Display',serif;font-size:15px;font-weight:700;cursor:pointer;">
            Connexion
          </button>
          <button id="tab-register" onclick="AuthPage.showRegister()"
            style="flex:1;padding:12px;background:none;border:none;border-bottom:2px solid transparent;color:#C4865A;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;">
            S'inscrire
          </button>
        </div>

        <div id="auth-form-container" style="flex:1;padding:28px 24px;overflow-y:auto;">
          ${renderLoginForm()}
        </div>
      </div>
    `;
  }

  function renderLoginForm() {
    return `
      <form id="login-form" onsubmit="AuthPage.submitLogin(event)">
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="input-group">
            <label class="input-label">Email</label>
            <input name="email" type="email" class="input-field" placeholder="votre@email.com" autocomplete="email" required>
          </div>
          <div class="input-group">
            <label class="input-label">Mot de passe</label>
            <div style="position:relative;">
              <input name="password" id="login-password" type="password" class="input-field" placeholder="••••••••" autocomplete="current-password" required style="padding-right:48px;">
              <button type="button" onclick="AuthPage.togglePassword('login-password',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:18px;color:#C4865A;padding:4px;">👁️</button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" style="margin-top:8px;padding:16px;font-size:16px;">
            Entrer maintenant 🔥
          </button>
          <div style="display:flex;align-items:center;gap:8px;color:#C4865A;font-size:12px;">
            <div style="flex:1;height:1px;background:#FFE4C4;"></div>ou<div style="flex:1;height:1px;background:#FFE4C4;"></div>
          </div>
          <button type="button" class="btn btn-secondary btn-full" style="padding:14px;" onclick="AuthPage.demoLogin()">
            🎭 Connexion démo
          </button>
          <p style="text-align:center;font-size:13px;color:#C4865A;margin-top:4px;">
            <button type="button" onclick="AuthPage.forgotPassword()" style="background:none;border:none;color:#C4865A;cursor:pointer;font-size:13px;">Mot de passe oublié ?</button>
          </p>
          <p style="text-align:center;font-size:13px;color:#C4865A;">
            Pas encore inscrit ? <button type="button" onclick="AuthPage.showRegister()" style="background:none;border:none;color:#D4380D;cursor:pointer;font-size:13px;font-weight:700;">Créer un compte</button>
          </p>
        </div>
      </form>
    `;
  }

  function renderOnboardingStep(step) {
    const progressW = Math.round((step / TOTAL_STEPS) * 100);
    const header = `
      <div style="padding:20px 24px 0;display:flex;align-items:center;gap:12px;">
        ${step > 1 ? `<button onclick="AuthPage.prevStep()" class="header-btn">←</button>` : '<div style="width:36px;"></div>'}
        <div class="progress-bar" style="flex:1;"><div class="progress-bar-fill" style="width:${progressW}%"></div></div>
        <span style="font-size:12px;color:#C4865A;font-family:'Plus Jakarta Sans',sans-serif;">${step}/${TOTAL_STEPS}</span>
      </div>`;

    const steps = {
      1: `
        <div class="onboarding-step">
          ${header}
          <div class="onboarding-content">
            <div class="onboarding-title">Ce soir, <em>tout</em> est possible 🔥</div>
            <p class="onboarding-desc">Vite fait, bien fait. Juste l'essentiel.</p>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="input-group">
                <label class="input-label">Prénom *</label>
                <input id="ob-firstname" type="text" class="input-field" placeholder="Ton prénom" value="${onboardingData.first_name||''}">
              </div>
              <div class="input-group">
                <label class="input-label">Date de naissance *</label>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                  <select id="ob-birth-day" class="input-field" style="padding:12px 8px;font-size:13px;">
                    <option value="">Jour</option>
                    ${Array.from({length:31},(_,i)=>`<option value="${String(i+1).padStart(2,'0')}">${i+1}</option>`).join('')}
                  </select>
                  <select id="ob-birth-month" class="input-field" style="padding:12px 8px;font-size:13px;">
                    <option value="">Mois</option>
                    ${['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
                      .map((m,i)=>`<option value="${String(i+1).padStart(2,'0')}">${m}</option>`).join('')}
                  </select>
                  <select id="ob-birth-year" class="input-field" style="padding:12px 8px;font-size:13px;">
                    <option value="">Année</option>
                    ${Array.from({length:50},(_,i)=>2006-i).map(y=>`<option value="${y}">${y}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="input-group">
                <label class="input-label">Email *</label>
                <input id="ob-email" type="email" class="input-field" placeholder="ton@email.com" value="${onboardingData.email||''}">
              </div>
              <div class="input-group">
                <label class="input-label">Mot de passe *</label>
                <div style="position:relative;">
                  <input id="ob-password" type="password" class="input-field" placeholder="Minimum 8 caractères" style="padding-right:48px;">
                  <button type="button" onclick="AuthPage.togglePassword('ob-password',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:18px;color:#C4865A;padding:4px;">👁️</button>
                </div>
              </div>
            </div>
          </div>
          <div style="padding:16px 24px 32px;">
            <button class="btn btn-primary btn-full" style="padding:16px;font-size:16px;" onclick="AuthPage.nextStep(1)">Continuer →</button>
          </div>
        </div>
      `,

      2: `
        <div class="onboarding-step">
          ${header}
          <div class="onboarding-content">
            <div class="onboarding-title">Je suis...</div>
            <p class="onboarding-desc">Et je cherche...</p>
            <div style="margin-bottom:20px;">
              <label class="input-label" style="margin-bottom:10px;display:block;">Mon genre</label>
              <div class="option-grid">
                <div class="option-card ${onboardingData.gender==='man'?'selected':''}" onclick="AuthPage.selectGender('man',this)">
                  <div class="option-card-icon">👨</div>
                  <div class="option-card-label">Homme</div>
                </div>
                <div class="option-card ${onboardingData.gender==='woman'?'selected':''}" onclick="AuthPage.selectGender('woman',this)">
                  <div class="option-card-icon">👩</div>
                  <div class="option-card-label">Femme</div>
                </div>
              </div>
            </div>
            <div>
              <label class="input-label" style="margin-bottom:10px;display:block;">Je cherche</label>
              <div class="option-grid">
                <div class="option-card ${onboardingData.looking_for==='man'?'selected':''}" onclick="AuthPage.selectLookingFor('man',this)">
                  <div class="option-card-icon">👨</div>
                  <div class="option-card-label">Des hommes</div>
                </div>
                <div class="option-card ${onboardingData.looking_for==='woman'?'selected':''}" onclick="AuthPage.selectLookingFor('woman',this)">
                  <div class="option-card-icon">👩</div>
                  <div class="option-card-label">Des femmes</div>
                </div>
                <div class="option-card ${onboardingData.looking_for==='all'?'selected':''}" onclick="AuthPage.selectLookingFor('all',this)" style="grid-column:1/-1;">
                  <div class="option-card-icon">💞</div>
                  <div class="option-card-label">Tout le monde</div>
                </div>
              </div>
            </div>
          </div>
          <div style="padding:16px 24px 32px;">
            <button class="btn btn-primary btn-full" style="padding:16px;font-size:16px;" onclick="AuthPage.nextStep(2)">Continuer →</button>
          </div>
        </div>
      `,

      3: `
        <div class="onboarding-step">
          ${header}
          <div class="onboarding-content">
            <div class="onboarding-title">Tu es où ce soir ? 📍</div>
            <p class="onboarding-desc">On connecte le Togo et le Bénin — on t'en met plein les yeux.</p>
            <div class="option-grid" style="margin-top:16px;">
              <div class="option-card ${onboardingData.country_code==='TG'?'selected':''}" onclick="AuthPage.selectCountry('TG',this)">
                <div class="option-card-icon">🇹🇬</div>
                <div class="option-card-label">Togo</div>
                <div style="font-size:10px;color:#C4865A;margin-top:4px;">Lomé & environs</div>
              </div>
              <div class="option-card ${onboardingData.country_code==='BJ'?'selected':''}" onclick="AuthPage.selectCountry('BJ',this)">
                <div class="option-card-icon">🇧🇯</div>
                <div class="option-card-label">Bénin</div>
                <div style="font-size:10px;color:#C4865A;margin-top:4px;">Cotonou & environs</div>
              </div>
            </div>
            <div style="margin-top:16px;" class="input-group">
              <label class="input-label">Ville (optionnel)</label>
              <input id="ob-city" type="text" class="input-field" placeholder="Ex: Lomé, Cotonou, Porto-Novo..." value="${onboardingData.city||''}">
            </div>
            <p style="font-size:11px;color:#C4865A;text-align:center;margin-top:16px;">
              En créant un compte, tu confirmes avoir <strong>18 ans ou plus</strong> et accepter nos CGU.
            </p>
          </div>
          <div style="padding:16px 24px 32px;">
            <button class="btn btn-primary btn-full" style="padding:16px;font-size:16px;" onclick="AuthPage.submitRegister()" id="btn-finish">
              🔥 C'est parti !
            </button>
          </div>
        </div>
      `,
    };
    return steps[step] || steps[1];
  }

  return {
    render,

    showLogin() {
      document.getElementById('tab-login').style.borderBottomColor = '#D4380D';
      document.getElementById('tab-login').style.color = '#3D1A00';
      document.getElementById('tab-login').style.fontWeight = '700';
      document.getElementById('tab-register').style.borderBottomColor = 'transparent';
      document.getElementById('tab-register').style.color = '#C4865A';
      document.getElementById('tab-register').style.fontWeight = '500';
      document.getElementById('auth-form-container').innerHTML = renderLoginForm();
    },

    showRegister() {
      document.getElementById('tab-register').style.borderBottomColor = '#D4380D';
      document.getElementById('tab-register').style.color = '#3D1A00';
      document.getElementById('tab-register').style.fontWeight = '700';
      document.getElementById('tab-login').style.borderBottomColor = 'transparent';
      document.getElementById('tab-login').style.color = '#C4865A';
      document.getElementById('tab-login').style.fontWeight = '500';
      currentStep = 1;
      onboardingData = {};
      document.getElementById('auth-form-container').innerHTML = renderOnboardingStep(1);
    },

    prevStep() {
      if (currentStep > 1) {
        currentStep--;
        document.getElementById('auth-form-container').innerHTML = renderOnboardingStep(currentStep);
      }
    },

    nextStep(step) {
      if (step === 1) {
        const fn    = document.getElementById('ob-firstname')?.value.trim();
        const day   = document.getElementById('ob-birth-day')?.value;
        const month = document.getElementById('ob-birth-month')?.value;
        const year  = document.getElementById('ob-birth-year')?.value;
        const bd    = (day && month && year) ? `${year}-${month}-${day}` : '';
        const em    = document.getElementById('ob-email')?.value.trim();
        const pw    = document.getElementById('ob-password')?.value;
        if (!fn)              return Toast.error('Prénom requis');
        if (!bd)              return Toast.error('Date de naissance requise');
        if (!em)              return Toast.error('Email requis');
        if (!pw || pw.length < 8) return Toast.error('Mot de passe : 8 caractères minimum');
        Object.assign(onboardingData, { first_name: fn, birthdate: bd, email: em, password: pw });
      }
      if (step === 2) {
        if (!onboardingData.gender)      return Toast.error('Sélectionne ton genre');
        if (!onboardingData.looking_for) return Toast.error('Sélectionne ce que tu cherches');
      }
      currentStep++;
      document.getElementById('auth-form-container').innerHTML = renderOnboardingStep(currentStep);
    },

    selectGender(v, el) {
      onboardingData.gender = v;
      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    },

    selectLookingFor(v, el) {
      onboardingData.looking_for = v;
      // Ne désélectionne que les cartes "Je cherche" (pas "Mon genre")
      el.parentElement.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    },

    selectCountry(v, el) {
      onboardingData.country_code = v;
      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    },

    togglePassword(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    },

    async submitLogin(event) {
      event.preventDefault();
      const form = event.target;
      await Utils.handleForm(form, async () => {
        const email    = form.email.value.trim();
        const password = form.password.value;
        await AuthService.login(email, password);
        Toast.success('Bienvenue sur AfroBizi ! 🔥');
        setTimeout(() => App.showApp(), 500);
      });
    },

    forgotPassword() {
      Modal.show(
        '<div style="display:flex;flex-direction:column;gap:16px;">' +
          '<p style="font-size:14px;color:#C4865A;">Entrez votre email — vous recevrez un lien de réinitialisation.</p>' +
          '<div class="input-group">' +
            '<label class="input-label">Email</label>' +
            '<input id="forgot-email" type="email" class="input-field" placeholder="votre@email.com">' +
          '</div>' +
          '<button onclick="AuthPage._doForgotPassword()" style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;padding:14px;border-radius:50px;font-weight:700;cursor:pointer;font-family:Playfair Display,serif;">Envoyer le lien</button>' +
        '</div>', 'Mot de passe oublié');
    },

    async _doForgotPassword() {
      const email = document.getElementById('forgot-email')?.value.trim();
      if (!email) { Toast.error('Entrez votre email'); return; }
      try {
        await API.post('/auth/forgot-password', { email });
        Modal.close();
        Toast.success('Email envoyé ! Vérifiez votre boîte mail.');
      } catch(err) {
        Toast.error(err.message || 'Erreur - vérifiez votre email');
      }
    },

    async demoLogin() {
      AuthService.save({
        accessToken:  'demo_token',
        refreshToken: 'demo_refresh',
        user: { id: 1, uuid: 'demo-uuid', email: 'demo@bizi228.com', first_name: 'Démo', gender: 'man', country_code: 'TG', is_premium: true, coins: 500 }
      });
      Toast.info('Mode démo activé 🎭');
      setTimeout(() => App.showApp(), 500);
    },

    async submitRegister() {
      if (!onboardingData.country_code) return Toast.error('Sélectionne ton pays');
      const city = document.getElementById('ob-city')?.value.trim();
      if (city) onboardingData.city = city;
      onboardingData.looking_for = onboardingData.looking_for || 'all';

      const btn = document.getElementById('btn-finish');
      if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Création...'; }
      try {
        await AuthService.register(onboardingData);
        Toast.success('Bienvenue sur AfroBizi 🔥');
        setTimeout(() => App.showApp(), 600);
      } catch (err) {
        Toast.error(err.message || 'Erreur lors de la création du compte');
        if (btn) { btn.disabled = false; btn.innerHTML = '🔥 C\'est parti !'; }
      }
    },
  };
})();



