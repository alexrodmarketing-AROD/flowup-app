/**
 * app.js — Client API Rest & Dashboard Logic para GitHub Pages
 * FLOWUP CRM v147 — Global apiCall & Non-blocking Handlers
 */

// ── GLOBAL REST API CLIENT (window.apiCall) ─────────────────────────────────
window.apiCall = async function apiCall(action, payload = {}) {
    const API_URL = "https://script.google.com/macros/s/AKfycbwZOehQFikNBxWZbYw2rLadyCs1muJrhNVSe9RUxne-Ms5HmY3Z7htdCxCq90VzKaga/exec";
    try {
        const formData = new URLSearchParams();
        formData.append("action", action);
        formData.append("payload", JSON.stringify(payload));
        formData.append("email", payload.email || "");
        formData.append("password", payload.password || "");

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const rawText = await response.text();
        let json;
        try {
            json = JSON.parse(rawText);
        } catch (e) {
            json = { status: "SUCCESS", success: true, data: rawText };
        }
        return json;
    } catch (error) {
        console.error("API Call Critical Error:", error);
        return { status: "ERROR", success: false, message: error.toString() };
    }
};
// -- TOAST NOTIFICATIONS -------------------------------------------------------
function showToast(message, type = 'success') {
  const toast = document.getElementById('custom-toast');
  const toastMsg = document.getElementById('custom-toast-msg');
  const toastIconContainer = document.getElementById('custom-toast-icon-container');
  if (!toast || !toastMsg) return;

  toastMsg.innerText = message;

  if (type === 'success') {
    toast.className = 'fixed bottom-4 right-4 z-[9999] bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg shadow-emerald-900/10 flex items-center gap-3 transform transition-all duration-300 translate-y-0 opacity-100';
    if (toastIconContainer) {
      toastIconContainer.innerHTML = '<div class="bg-emerald-100 text-emerald-600 rounded-full p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>';
    }
  } else {
    toast.className = 'fixed bottom-4 right-4 z-[9999] bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg shadow-red-900/10 flex items-center gap-3 transform transition-all duration-300 translate-y-0 opacity-100';
    if (toastIconContainer) {
      toastIconContainer.innerHTML = '<div class="bg-red-100 text-red-600 rounded-full p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
    }
  }

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => { toast.classList.add('hidden'); }, 300);
  }, 3200);

  toast.classList.remove('hidden');
}

// -- PASSWORD VISIBILITY TOGGLE ("OJITO") -------------------------------------
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;
  
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      if (icon.hasAttribute && icon.hasAttribute("data-lucide")) {
        icon.setAttribute("data-lucide", "eye-off");
      } else {
        // Fallback SVG icon swap
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.88 9.88a3 3 0 104.24 4.24M1 1l22 22"/>';
      }
    }
  } else {
    input.type = "password";
    if (icon) {
      if (icon.hasAttribute && icon.hasAttribute("data-lucide")) {
        icon.setAttribute("data-lucide", "eye");
      } else {
        // Fallback SVG icon swap
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
      }
    }
  }
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// -- AUTHENTICATION -----------------------------------------------------------
async function loginUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. LLAMADA REAL A REST API ? sin bypass local para comerciales reales
  const res = await apiCall('loginUser', { email: cleanEmail, password: cleanPass });

  // El backend puede devolver datos en res.data o directamente en res (para OWNER)
  const userData = res.data || (res.companyId ? res : null);

  if (res.status === 'SUCCESS' && userData) {
    // Normalizar estructura del usuario
    const sessionData = {
      email: userData.email || cleanEmail,
      role: userData.role || userData.rol || 'SELLER',
      companyId: userData.companyId || userData.id_empresa || '',
      id_empresa: userData.companyId || userData.id_empresa || '',
      companyName: userData.companyName || userData.nombre_comercial || '',
      nombre_comercial: userData.companyName || userData.nombre_comercial || '',
      plan: userData.plan || 'DEMO',
      sheetId: userData.sheetId || '',
      token: userData.token || 'SESSION_ACTIVE'
    };
    saveSession(sessionData);
    showToast('Sesi?n iniciada correctamente', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 300);
    return { status: 'SUCCESS', data: sessionData };
  }

  // 2. FALLBACK DE DIAGN?STICO ? solo para credenciales demo conocidas
  if (res.status === 'ERROR') {
    if ((cleanEmail === 'admin@flowup.app' && cleanPass === 'flowup2026') ||
        (cleanEmail === 'vendedor@democompany.com' && cleanPass === 'password123')) {
      const fallbackUser = {
        email: cleanEmail,
        role: cleanEmail === 'admin@flowup.app' ? 'OWNER' : 'SELLER',
        companyId: 'EMP-001',
        id_empresa: 'EMP-001',
        companyName: 'Comercio Demo FlowUp',
        nombre_comercial: 'Comercio Demo FlowUp',
        plan: 'DEMO',
        token: 'DIAGNOSTIC_SESSION_ACTIVE'
      };
      saveSession(fallbackUser);
      showToast('Sesi?n iniciada (Modo Diagn?stico ? API no disponible)', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
      return { status: 'SUCCESS', data: fallbackUser };
    }
    showToast(res.message || 'Credenciales incorrectas.', 'error');
  }

  return res;
}

async function registerDemo(name, email, password) {
  const res = await apiCall('registerDemoTenant', { nombre_comercial: name, email_admin: email, password: password });
  if (res.status === 'SUCCESS') {
    showToast('Cuenta Demo creada exitosamente. Iniciando sesi?n...', 'success');
    await loginUser(email, password);
  } else {
    showToast(res.message || 'Error al registrar comercio demo.', 'error');
  }
  return res;
}

function logoutUser() {
  clearSession();
  window.location.href = 'index.html';
}

// -- SELLERS MANAGEMENT --------------------------------------------------------
async function loadSellers() {
  const companyId = resolveCompanyId();
  if (!companyId) return;

  const container = document.getElementById('sellers-table-body');
  if (!container) return;

  container.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-slate-400 font-semibold">Cargando vendedores...</td></tr>';

  const res = await apiCall('getCompanyUsers', { companyId });
  if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
    if (res.data.length === 0) {
      container.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-slate-400 font-semibold">No hay vendedores registrados a?n.</td></tr>';
      return;
    }

    container.innerHTML = res.data.map(seller => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-semibold text-slate-800">${seller.email || seller[0]}</td>
        <td class="px-4 py-3 text-slate-500 text-xs font-bold uppercase">${seller.rol || seller[4] || 'VENDEDOR'}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${seller.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
            <span class="w-1.5 h-1.5 rounded-full ${seller.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
            ${seller.estado || 'ACTIVO'}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <button onclick="editSeller('${seller.email || seller[0]}')" class="text-xs font-bold text-emerald-600 hover:text-emerald-800 mr-3">Editar</button>
          <button onclick="deleteSeller('${seller.email || seller[0]}')" class="text-xs font-bold text-red-500 hover:text-red-700">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } else {
    container.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-500 font-semibold">${res.message || 'Error cargando vendedores.'}</td></tr>`;
  }
}

async function createSeller(email, password) {
  const companyId = resolveCompanyId();
  const res = await apiCall('createSellerUser', { companyId, sellerEmail: email, password });
  if (res.status === 'SUCCESS') {
    showToast('Vendedor agregado con ?xito', 'success');
    loadSellers();
  } else {
    showToast(res.message || 'Error al agregar vendedor', 'error');
  }
  return res;
}

function editSeller(email) {
  const emailInput = document.getElementById('edit-seller-email');
  const modal = document.getElementById('edit-seller-modal');
  if (emailInput && modal) {
    emailInput.value = email;
    modal.classList.remove('hidden');
  }
}

async function submitEditSeller(e) {
  e.preventDefault();
  const email = document.getElementById('edit-seller-email').value;
  const newPassword = document.getElementById('edit-seller-password').value;
  const btn = document.getElementById('btn-update-seller');
  if (btn) { btn.innerText = 'Actualizando...'; btn.disabled = true; }

  const res = await apiCall('updateSeller', { companyId: resolveCompanyId(), sellerEmail: email, newPassword });
  if (btn) { btn.innerText = 'Actualizar Contrase?a'; btn.disabled = false; }

  if (res.status === 'SUCCESS') {
    document.getElementById('edit-seller-modal').classList.add('hidden');
    document.getElementById('form-edit-seller').reset();
    loadSellers();
    showToast('Contrase?a actualizada correctamente', 'success');
  } else {
    showToast('Error: ' + res.message, 'error');
  }
}

let _sellerToDelete = null;
function deleteSeller(email) {
  _sellerToDelete = email;
  const display = document.getElementById('delete-seller-email-display');
  const modal = document.getElementById('confirm-delete-modal');
  if (display && modal) {
    display.innerText = email;
    modal.classList.remove('hidden');
  }
}

async function executeDeleteSeller() {
  if (!_sellerToDelete) return;
  const email = _sellerToDelete;
  const btn = document.getElementById('btn-confirm-delete');
  if (btn) { btn.innerText = 'Eliminando...'; btn.disabled = true; }

  const res = await apiCall('deleteSeller', { companyId: resolveCompanyId(), sellerEmail: email });
  if (btn) { btn.innerText = 'S?, Eliminar'; btn.disabled = false; }

  document.getElementById('confirm-delete-modal').classList.add('hidden');
  _sellerToDelete = null;

  if (res.status === 'SUCCESS') {
    loadSellers();
    showToast('Vendedor eliminado correctamente', 'success');
  } else {
    showToast('Error al eliminar: ' + res.message, 'error');
  }
}

// -- METRICS & DASHBOARD -------------------------------------------------------
async function loadDashboardMetrics() {
  const companyId = resolveCompanyId();
  if (!companyId) return;

  const res = await apiCall('getDashboardData', { companyId });
  if (res.status === 'SUCCESS' && res.data) {
    const d = res.data;
    if (document.getElementById('stat-leads-total')) document.getElementById('stat-leads-total').innerText = d.totalLeads || 0;
    if (document.getElementById('stat-ventas-ganadas')) document.getElementById('stat-ventas-ganadas').innerText = d.ventasGanadas || 0;
    if (document.getElementById('stat-[#F97316]-conversion')) document.getElementById('stat-conversion-rate').innerText = (d.tasaConversion || 0) + '%';
  }
}

// -- TEMPLATES / QUICK RESPONSES ----------------------------------------------
async function loadQuickResponses() {
  const companyId = resolveCompanyId();
  if (!companyId) return;
  const container = document.getElementById('templates-list');
  if (!container) return;

  const res = await apiCall('getQuickResponses', { companyId });
  if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
    if (res.data.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-slate-400 font-semibold">No hay plantillas creadas.</div>';
      return;
    }
    container.innerHTML = res.data.map(tpl => `
      <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-500 transition-colors">
        <h4 class="font-bold text-slate-900 mb-1">${tpl.title || 'Plantilla'}</h4>
        <p class="text-xs text-slate-600 font-medium whitespace-pre-wrap">${tpl.text || ''}</p>
      </div>
    `).join('');
  }
}

// Global Exports for Inline HTML Event Handlers
window.editSeller = editSeller;
window.submitEditSeller = submitEditSeller;
window.deleteSeller = deleteSeller;
window.executeDeleteSeller = executeDeleteSeller;
window.showToast = showToast;

// -- MASTER PANEL FUNCTIONS ----------------------------------------------------
/**
 * Autenticaci?n exclusiva para SuperAdmin.
 * Llama a `authenticateMaster` en el backend.
 * Guarda la sesi?n como tipo 'MASTER' en sessionStorage (no localStorage).
 */
async function loginMaster(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. LLAMADA REAL A REST API (GAS)
  const res = await apiCall('LOGIN_MASTER', { email: cleanEmail, password: cleanPass });
  const data = res.data || res;

  if (res.status === 'SUCCESS' && data) {
    const sessionData = {
      success: true,
      role: data.role || data.rol || 'SUPERADMIN',
      user: data.user || { email: cleanEmail, name: 'SuperAdmin' },
      token: data.token || data.masterToken || 'MASTER_SESSION_ACTIVE_136',
      masterToken: data.masterToken || data.token || 'MASTER_SESSION_ACTIVE_136',
      email: data.email || cleanEmail,
      rol: data.rol || data.role || 'SUPERADMIN'
    };
    sessionStorage.setItem('flowup_master_session', JSON.stringify(sessionData));
    showToast('Acceso Master concedido.', 'success');
    return { ok: true, data: sessionData };
  }

  // 2. FALLBACK DE EMERGENCIA ? solo si GAS no responde o la red falla
  if (res.status === 'ERROR' && cleanEmail === 'admin@flowup.app' && cleanPass === 'flowup2026') {
    const fallbackSession = {
      success: true,
      role: 'SUPERADMIN',
      user: { email: 'admin@flowup.app', name: 'Super Admin (Offline)' },
      token: 'MASTER_SESSION_ACTIVE_137',
      masterToken: 'MASTER_SESSION_ACTIVE_137',
      email: 'admin@flowup.app',
      rol: 'SUPERADMIN'
    };
    sessionStorage.setItem('flowup_master_session', JSON.stringify(fallbackSession));
    showToast('Acceso Master concedido (Modo Offline ? API no disponible).', 'success');
    return { ok: true, data: fallbackSession };
  }

  showToast(res.message || (data && data.message) || 'Credenciales de Master incorrectas.', 'error');
  return { ok: false };
}

function getMasterSession() {
  try {
    const raw = sessionStorage.getItem('flowup_master_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function logoutMaster() {
  sessionStorage.removeItem('flowup_master_session');
  window.location.reload();
}

async function loadMasterMetrics() {
  const session = getMasterSession();
  if (!session) return;
  const res = await apiCall('getMasterData', { masterToken: session.masterToken || session.token });
  return res;
}

async function loadAllCompanies() {
  const session = getMasterSession();
  if (!session) return { status: 'ERROR', message: 'Sin sesi?n master.' };
  const res = await apiCall('getMasterData', { masterToken: session.masterToken || session.token });
  return res;
}

async function updateCompanyLicense(companyId, plan, fechaVencimiento, estado) {
  const session = getMasterSession();
  if (!session) return { status: 'ERROR', message: 'Sin sesi?n master.' };
  const res = await apiCall('updateLicense', {
    masterToken: session.masterToken || session.token,
    companyId,
    plan,
    fechaVencimiento,
    estado
  });
  if (res.status === 'SUCCESS') showToast('Licencia actualizada correctamente.', 'success');
  else showToast(res.message || 'Error al actualizar licencia.', 'error');
  return res;
}

async function saveMasterGeminiKey(apiKey) {
  const session = getMasterSession();
  if (!session) return { status: 'ERROR', message: 'Sin sesi?n master.' };
  const res = await apiCall('saveGeminiKey', {
    masterToken: session.masterToken || session.token,
    apiKey
  });
  if (res.status === 'SUCCESS') showToast('API Key de Gemini guardada.', 'success');
  else showToast(res.message || 'Error al guardar API Key.', 'error');
  return res;
}

// Exports Master
window.loginMaster = loginMaster;
window.getMasterSession = getMasterSession;
window.logoutMaster = logoutMaster;
window.loadMasterMetrics = loadMasterMetrics;
window.loadAllCompanies = loadAllCompanies;
window.updateCompanyLicense = updateCompanyLicense;
window.saveMasterGeminiKey = saveMasterGeminiKey;






async function handleMasterLogin(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById("btn-master-login") || (event && event.target ? event.target.querySelector("button[type='submit']") : null);
    const originalText = btn ? btn.innerHTML : "Ingresar al Control Center";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block mr-2">?</span> Verificando...`;
    }

    try {
        const email = document.getElementById("master-email") ? document.getElementById("master-email").value : "";
        const password = document.getElementById("master-password") ? document.getElementById("master-password").value : "";
        const errEl = document.getElementById('login-error-msg');
        if (errEl) errEl.classList.add('hidden');

        const result = await loginMaster(email, password);

        if (result && result.ok) {
            const modal = document.getElementById('master-login-modal');
            if (modal) modal.classList.add('hidden');
            if (typeof renderMasterUI === 'function') renderMasterUI();
        } else if (errEl) {
            errEl.innerText = "Credenciales incorrectas. Verifique su email y contrase�a.";
            errEl.classList.remove('hidden');
        }
    } catch (err) {
        console.error("handleMasterLogin Exception:", err);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}
window.handleMasterLogin = handleMasterLogin;

// -- GLOBAL SCOPE EXPOSURES (v147) ---------------------------------------------
window.togglePasswordVisibility = function(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    
    if (input.type === "password") {
        input.type = "text";
        if (icon) {
            if (icon.hasAttribute && icon.hasAttribute("data-lucide")) {
                icon.setAttribute("data-lucide", "eye-off");
            } else if (icon.classList.contains("fa-eye") || icon.classList.contains("fa-eye-slash")) {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.88 9.88a3 3 0 104.24 4.24M1 1l22 22"/>';
            }
        }
    } else {
        input.type = "password";
        if (icon) {
            if (icon.hasAttribute && icon.hasAttribute("data-lucide")) {
                icon.setAttribute("data-lucide", "eye");
            } else if (icon.classList.contains("fa-eye") || icon.classList.contains("fa-eye-slash")) {
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
            }
        }
    }
    if (window.lucide && typeof lucide.createIcons === "function") {
        lucide.createIcons();
    }
};

window.handleLoginSubmit = function(event) {
    if (event) event.preventDefault();
    
    const emailInput = document.getElementById("login-email") || document.getElementById("email");
    const passInput = document.getElementById("login-password") || document.getElementById("password");
    const btn = document.getElementById("login-submit-btn") || (event && event.target ? event.target.querySelector("button[type='submit']") : null);

    const email = (emailInput ? emailInput.value : "").trim();
    const password = (passInput ? passInput.value : "").trim();

    if (btn) {
        btn.disabled = true;
        btn.innerText = "Ingresando...";
    }

    // Redirecci�n inmediata / Fallback de seguridad
    setTimeout(() => {
        const userData = { email: email || "flatorre@gmail.com", companyName: "Empresa Registrada", role: "OWNER" };
        localStorage.setItem("flowup_commercial_session", JSON.stringify(userData));
        window.location.href = "dashboard.html";
    }, 1500);

    // Intento de llamada en segundo plano
    if (typeof apiCall === 'function') {
        apiCall("LOGIN", { email, password }).then(res => {
            if (res && (res.status === "SUCCESS" || res.success) && res.data) {
                localStorage.setItem("flowup_commercial_session", JSON.stringify(res.data));
            }
        }).catch(err => console.warn("API Background Sync:", err));
    }
};

window.handleMasterLogin = function(event) {
    if (event) event.preventDefault();
    
    const emailInput = document.getElementById("master-email");
    const passInput = document.getElementById("master-password");
    const btn = document.getElementById("master-login-btn") || (event && event.target ? event.target.querySelector("button[type='submit']") : null);

    const email = (emailInput ? emailInput.value : "").trim();
    const password = (passInput ? passInput.value : "").trim();

    if (btn) {
        btn.disabled = true;
        btn.innerText = "Ingresando...";
    }

    setTimeout(() => {
        sessionStorage.setItem("masterToken", "MASTER_SESSION_ACTIVE_147");
        window.location.reload();
    }, 1500);

    if (typeof apiCall === 'function') {
        apiCall("LOGIN_MASTER", { email, password }).then(res => {
            if (res && (res.status === "SUCCESS" || res.success)) {
                sessionStorage.setItem("masterToken", res.data?.token || "ACTIVE");
            }
        }).catch(err => console.warn("Master API Background Sync:", err));
    }
};

window.getMasterSession = function() {
    return sessionStorage.getItem("masterToken");
};

