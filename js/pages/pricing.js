// js/pages/pricing.js — Bizi 228+1
const PricingPage = (() => {
  const PLANS = [
    {
      id: 'free',
      name: 'Gratuit',
      label: 'GRATUIT',
      duration: 'Pour toujours',
      price_xof: 0,
      popular: false,
      features: [
        { text: 'Swipe illimité', ok: true },
        { text: '1 Super Like / jour', ok: true },
        { text: 'Messagerie de base', ok: true },
        { text: 'Appels vidéo', ok: false },
        { text: 'Mode Incognito', ok: false },
        { text: 'Super Likes illimités', ok: false },
      ]
    },
    {
      id: 'day',
      name: '1 Jour',
      label: 'TOURISTE',
      duration: '24 heures',
      price_xof: 1000,
      popular: false,
      features: [
        { text: 'Super Likes illimités', ok: true },
        { text: 'Messagerie illimitée', ok: true },
        { text: 'Voir qui vous a liké', ok: true },
        { text: 'Appels vidéo', ok: false },
        { text: 'Mode Incognito', ok: false },
      ]
    },
    {
      id: 'weekly',
      name: '1 Semaine',
      label: 'TOURISTE',
      duration: '7 jours',
      price_xof: 5000,
      popular: false,
      features: [
        { text: 'Super Likes illimités', ok: true },
        { text: 'Messagerie illimitée', ok: true },
        { text: 'Voir qui vous a liké', ok: true },
        { text: 'Appels vidéo HD', ok: true },
        { text: 'Mode Incognito', ok: false },
      ]
    },
    {
      id: 'monthly',
      name: '1 Mois',
      label: '🔥 POPULAIRE',
      duration: '30 jours',
      price_xof: 15000,
      popular: true,
      features: [
        { text: 'Super Likes illimités', ok: true },
        { text: 'Messagerie illimitée', ok: true },
        { text: 'Appels vidéo HD', ok: true },
        { text: 'Voir qui vous a liké', ok: true },
        { text: 'Mode Incognito', ok: true },
        { text: 'Salons webcam privés', ok: true },
      ]
    },
    {
      id: 'biannual',
      name: '6 Mois',
      label: 'ÉCONOMIQUE',
      duration: '180 jours',
      price_xof: 70000,
      popular: false,
      features: [
        { text: 'Tout Premium inclus', ok: true },
        { text: 'Salons webcam privés', ok: true },
        { text: 'Appels audio illimités', ok: true },
        { text: 'Mode Incognito', ok: true },
        { text: 'Badge Vérifié', ok: true },
      ]
    },
    {
      id: 'yearly',
      name: '1 An',
      label: '⭐ MEILLEUR PRIX',
      duration: '365 jours',
      price_xof: 120000,
      popular: false,
      features: [
        { text: 'Tout Premium inclus', ok: true },
        { text: 'Support prioritaire', ok: true },
        { text: 'Badge VIP sur profil', ok: true },
        { text: 'Boosts mensuels offerts', ok: true },
        { text: 'Accès fonctions bêta', ok: true },
      ]
    },
  ];

  let selectedPlan = null;

  function formatPrice(xof) {
    if (xof === 0) return 'Gratuit';
    return xof.toLocaleString('fr-FR') + ' CFA';
  }

  async function render() {
    const page = document.getElementById('page-pricing');
    if (!page) return;

    const user = AuthService.getUser();

    page.innerHTML = `
      <div style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);padding:32px 20px 24px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">⭐</div>
        <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFE5B4;">Passez Premium</div>
        <div style="font-size:14px;color:rgba(255,229,180,0.8);margin-top:6px;">Ce soir, pas de limites 🔥</div>
      </div>

      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;padding-bottom:80px;">
        ${PLANS.map(plan => `
          <div onclick="PricingPage.selectPlan('${plan.id}')" id="plan-card-${plan.id}"
            style="background:#FFFFFF;border:2px solid ${plan.popular ? '#D4380D' : '#FFE4C4'};border-radius:20px;padding:16px;cursor:pointer;transition:all 0.2s;${plan.popular ? 'box-shadow:0 8px 32px rgba(212,56,13,0.2);' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
              <div>
                ${plan.popular ? `<div style="background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);color:#FFE5B4;font-size:10px;font-weight:700;padding:3px 10px;border-radius:50px;display:inline-block;margin-bottom:6px;">${plan.label}</div><br>` : `<div style="color:#C4865A;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${plan.label}</div>`}
                <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#3D1A00;">${plan.name}</div>
                <div style="font-size:12px;color:#C4865A;">${plan.duration}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:${plan.popular ? '#D4380D' : '#3D1A00'};">${formatPrice(plan.price_xof)}</div>
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${plan.features.map(f => `
                <span style="font-size:11px;color:${f.ok ? '#3D1A00' : '#C4865A'};background:${f.ok ? '#FFF0E0' : '#F5F5F5'};border:1px solid ${f.ok ? '#FFD4A0' : '#E5E5E5'};border-radius:50px;padding:3px 8px;">
                  ${f.ok ? '✓' : '✗'} ${f.text}
                </span>
              `).join('')}
            </div>
            ${plan.id !== 'free' ? `
              <button style="width:100%;margin-top:12px;padding:12px;background:${plan.popular ? 'linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00)' : '#FFF0E0'};border:${plan.popular ? 'none' : '1.5px solid #FFD4A0'};border-radius:50px;color:${plan.popular ? '#FFE5B4' : '#8B1A00'};font-family:'Playfair Display',serif;font-size:14px;font-weight:700;cursor:pointer;">
                ${user?.is_premium ? 'Plan actuel' : 'Choisir ce plan'}
              </button>
            ` : `<div style="text-align:center;margin-top:8px;font-size:12px;color:#C4865A;">Plan actuel</div>`}
          </div>
        `).join('')}

        <div style="background:#FFF8F0;border:1.5px solid #FFE4C4;border-radius:16px;padding:16px;text-align:center;">
          <div style="font-size:24px;margin-bottom:8px;">💳</div>
          <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#3D1A00;margin-bottom:6px;">Paiement sécurisé</div>
          <div style="font-size:12px;color:#C4865A;margin-bottom:12px;">MasterCard · Visa · Mobile Money</div>
          <div style="display:flex;justify-content:center;gap:12px;font-size:24px;">
            💳 📱 🏦
          </div>
          <div style="font-size:11px;color:#C4865A;margin-top:8px;">Intégration CinetPay/FedaPay — bientôt disponible</div>
        </div>
      </div>
    `;
  }

  return {
    render,

    selectPlan(id) {
      const plan = PLANS.find(p => p.id === id);
      if (!plan || plan.id === 'free') return;
      selectedPlan = plan;

      Modal.show(`
        <div style="text-align:center;padding:8px;">
          <div style="font-size:40px;margin-bottom:12px;">⭐</div>
          <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#3D1A00;margin-bottom:4px;">${plan.name}</div>
          <div style="font-size:28px;font-weight:900;color:#D4380D;font-family:'Playfair Display',serif;margin:12px 0;">${formatPrice(plan.price_xof)}</div>
          <div style="font-size:13px;color:#C4865A;margin-bottom:20px;">${plan.duration}</div>
          <div style="background:#FFF0E0;border-radius:14px;padding:14px;margin-bottom:16px;text-align:left;">
            <div style="font-size:12px;color:#C4865A;margin-bottom:8px;font-weight:700;">CHOISIR UN MOYEN DE PAIEMENT</div>
            <button onclick="PricingPage.payWithMastercard('${plan.id}')" style="width:100%;padding:12px;background:linear-gradient(135deg,#8B1A00,#D4380D,#FF7A00);border:none;color:#FFE5B4;border-radius:12px;font-weight:700;cursor:pointer;margin-bottom:8px;font-size:14px;">💳 MasterCard / Visa</button>
            <button onclick="PricingPage.payWithMobileMoney('${plan.id}')" style="width:100%;padding:12px;background:#FFF0E0;border:1.5px solid #FFD4A0;color:#8B1A00;border-radius:12px;font-weight:700;cursor:pointer;font-size:14px;">📱 Mobile Money</button>
          </div>
          <button onclick="Modal.close()" style="background:none;border:none;color:#C4865A;cursor:pointer;font-size:13px;">Annuler</button>
        </div>
      `, 'Activer Premium');
    },

    payWithMastercard(planId) {
      Modal.close();
      Toast.info('Paiement MasterCard/Visa — intégration CinetPay bientôt disponible !');
    },

    payWithMobileMoney(planId) {
      Modal.close();
      Toast.info('Mobile Money — intégration FedaPay bientôt disponible !');
    },

    setCurrency(cur) {
      // Conservé pour compatibilité
    },
  };
})();
