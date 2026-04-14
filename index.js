import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxbQZpp1ZFpk0Le7Fszkqsswcz-JEAbVA",
  authDomain: "preventive-maintenance-s-e4f29.firebaseapp.com",
  databaseURL:
    "https://preventive-maintenance-s-e4f29-default-rtdb.firebaseio.com",
  projectId: "preventive-maintenance-s-e4f29",
  storageBucket: "preventive-maintenance-s-e4f29.firebasestorage.app",
  messagingSenderId: "1063715318135",
  appId: "1:1063715318135:web:81bfbcdf1312d12d0ad972",
  measurementId: "G-2JX1KZD2E1",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let userSession = null;

// --- 1. LOGIN FUNCTION ---
async function handleLogin() {
  const u = document.getElementById("user").value.trim().toLowerCase();
  const p = document.getElementById("pass").value.trim();
  const btn = document.getElementById("login-btn");

  console.log("Searching for user:", u); // DEBUG LOG

  btn.disabled = true;
  btn.innerHTML = "Checking...";

  try {
    const dbRef = ref(db);
    const userPath = `users/${u}`;
    console.log("Firebase Path:", userPath); // DEBUG LOG

    const snapshot = await get(child(dbRef, userPath));

    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log("User Found! Data:", userData); // DEBUG LOG

      if (userData.password.toString() === p.toString()) {
        userSession = userData;
        localStorage.setItem("userSession", JSON.stringify(userData));
        showSystem(userData);
      } else {
        showError("Maling password.");
      }
    } else {
      console.warn("Snapshot does not exist for path:", userPath);
      showError("User not found.");
    }
  } catch (err) {
    console.error("Firebase Error Details:", err); // DEBUG LOG
    showError("Connection error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = "SIGN IN";
  }
}

// --- 2. UI CONTROL ---
function showError(msg) {
  const errorDiv = document.getElementById("login-error");
  const errorText = document.getElementById("error-text");
  if (errorDiv && errorText) {
    errorText.innerText = msg;
    errorDiv.style.display = "block";
  }
}

function showSystem(res) {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-system").style.display = "block";
  document.getElementById("user-display").innerText = `Welcome, ${
    res.name || res.Username
  }`;
  buildSidebar();
}

// --- 3. SIDEBAR BUILDER (Permissions Logic) ---
function buildSidebar() {
  if (!userSession || !userSession.permissions) return;
  const perms = userSession.permissions;
  const has = (p) => perms[p] == "1" || perms[p] == 1;

  let h =
    '<div class="nav-group p-2 text-secondary small uppercase">Main Menu</div>';

  if (has("P_Dashboard")) {
    h += `<a class="nav-link p-2 text-white text-decoration-none d-block" href="#"><i class="bi bi-speedometer2 me-2"></i> Dashboard</a>`;
  }

  if (has("P_Master_List") || has("P_Specifications")) {
    let sub = "";
    if (has("P_Master_List"))
      sub += `<a class="nav-link ps-4 py-1 text-white-50 text-decoration-none d-block small">Master List</a>`;
    if (has("P_Specifications"))
      sub += `<a class="nav-link ps-4 py-1 text-white-50 text-decoration-none d-block small">Specifications</a>`;
    h += createParent("m1", "bi-bus-front", "Asset Mgmt", sub);
  }

  if (has("P_Inventory") || has("P_Stock_In")) {
    let sub = "";
    if (has("P_Inventory"))
      sub += `<a class="nav-link ps-4 py-1 text-white-50 text-decoration-none d-block small">Inventory</a>`;
    if (has("P_Stock_In"))
      sub += `<a class="nav-link ps-4 py-1 text-white-50 text-decoration-none d-block small">Stock-In</a>`;
    h += createParent("m2", "bi-box-seam", "Logistics", sub);
  }

  if (userSession.role && userSession.role.toLowerCase() === "admin") {
    h +=
      '<div class="nav-group p-2 mt-3 text-secondary small border-top border-secondary">System</div>';
    h += `<a class="nav-link p-2 text-info text-decoration-none d-block" href="#"><i class="bi bi-shield-lock me-2"></i> Admin Access</a>`;
  }

  document.getElementById("sidebar-menu").innerHTML = h;
}

function createParent(id, icon, label, sub) {
  return `
    <div class="nav-item">
      <a class="nav-link d-flex align-items-center justify-content-between p-2 text-white text-decoration-none" 
         data-bs-toggle="collapse" href="#${id}">
        <span><i class="bi ${icon} me-2"></i> ${label}</span>
        <i class="bi bi-chevron-down small"></i>
      </a>
      <div class="collapse" id="${id}"><div class="bg-dark py-1">${sub}</div></div>
    </div>`;
}

// --- 4. INITIALIZATION & EVENTS ---
window.handleLogout = function () {
  localStorage.removeItem("userSession");
  location.reload();
};

// Ginagamit ang DOMContentLoaded para sigurado na load na ang HTML bago lagyan ng function
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginBtn) loginBtn.onclick = handleLogin;
  if (logoutBtn) logoutBtn.onclick = handleLogout;

  // Auto-login check
  const saved = localStorage.getItem("userSession");
  if (saved) {
    userSession = JSON.parse(saved);
    showSystem(userSession);
  }
});
