import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const config = window.FIREBASE_CONFIG;
if (!config || Object.values(config).some((v) => String(v).includes("REPLACE_ME"))) {
  alert("Firebase is not configured. Update public/js/firebase-config.js first.");
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  authMode: "login",
  currentUser: null,
  profile: null,
  unsubLeaderboard: null,
  unsubSocialProof: null,
};

const $ = (id) => document.getElementById(id);

const els = {
  authForm: $("authForm"),
  authError: $("authError"),
  authHint: $("authHint"),
  authSubmitBtn: $("authSubmitBtn"),
  tabs: [...document.querySelectorAll(".tab")],
  examField: $("examField"),
  logoutBtn: $("logoutBtn"),
  welcomeText: $("welcomeText"),
  kpiCards: $("kpiCards"),
  levelLabel: $("levelLabel"),
  xpMeter: $("xpMeter"),
  progressList: $("progressList"),
  leaderboard: $("leaderboard"),
  sessionForm: $("sessionForm"),
  sessionError: $("sessionError"),
  sessionSubmitBtn: $("sessionSubmitBtn"),
  statActive: $("statActive"),
  statMinutes: $("statMinutes"),
  statShares: $("statShares"),
  proofUsers: $("proofUsers"),
  proofMinutes: $("proofMinutes"),
  proofXp: $("proofXp"),
};

const DEFAULT_PROGRESS = {
  Physics: 0,
  Chemistry: 0,
  Mathematics: 0,
  "Mock Tests": 0,
};

function sanitizeName(value) {
  return value.replace(/[^a-zA-Z0-9\s.'-]/g, "").trim().slice(0, 60);
}

function levelFromXp(totalXp) {
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);
  const levelXp = totalXp % 500;
  return { level, levelXp, levelXpGoal: 500 };
}

function validateAuthForm(formData) {
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();
  const rawName = (formData.get("name") || "").toString();
  const name = sanitizeName(rawName);

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email address.");
  if (!password || password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (state.authMode === "signup" && name.length < 2) throw new Error("Please enter your full name.");

  return { email, password, name, exam: formData.get("exam") || "JEE" };
}

function validateSessionForm(formData) {
  if (!state.currentUser) throw new Error("Please login before logging study sessions.");
  const subject = (formData.get("subject") || "").toString();
  const minutes = Number(formData.get("minutes"));
  if (!(subject in DEFAULT_PROGRESS)) throw new Error("Invalid subject selected.");
  if (!Number.isFinite(minutes) || minutes < 5 || minutes > 180) throw new Error("Minutes must be between 5 and 180.");
  return { subject, minutes };
}

async function ensureUserProfile(user, signupPayload) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const name = signupPayload?.name || user.displayName || "Student";
    const exam = signupPayload?.exam || "JEE";
    await setDoc(ref, {
      uid: user.uid,
      name,
      email: user.email,
      exam,
      totalXp: 0,
      streakDays: 0,
      weeklyMinutes: 0,
      lastStudyAt: null,
      subjectProgress: DEFAULT_PROGRESS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return fetchUserProfile(user.uid);
}

async function fetchUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const { level, levelXp, levelXpGoal } = levelFromXp(data.totalXp || 0);
  return { ...data, level, levelXp, levelXpGoal };
}

function renderDashboard(profile) {
  if (!profile) {
    els.welcomeText.textContent = "Please login to access your dashboard.";
    els.kpiCards.innerHTML = "";
    els.progressList.innerHTML = "";
    els.levelLabel.textContent = "";
    els.xpMeter.style.width = "0%";
    return;
  }

  els.welcomeText.textContent = `Welcome ${profile.name} • ${profile.exam}`;
  const cards = [
    { label: "Total XP", value: profile.totalXp || 0 },
    { label: "Current Streak", value: `${profile.streakDays || 0} days` },
    { label: "Weekly Minutes", value: profile.weeklyMinutes || 0 },
    { label: "Level", value: profile.level },
  ];

  els.kpiCards.innerHTML = cards
    .map((card) => `<div><small>${card.label}</small><b style="display:block;font-size:1.05rem;margin-top:4px">${card.value}</b></div>`)
    .join("");

  const progress = profile.subjectProgress || DEFAULT_PROGRESS;
  els.progressList.innerHTML = Object.entries(progress)
    .map(
      ([subject, done]) => `
      <div class="progress-item">
        <div class="progress-head"><span>${subject}</span><span>${done}%</span></div>
        <div class="meter"><i style="width:${Math.min(100, done)}%"></i></div>
      </div>`
    )
    .join("");

  const percent = Math.round((profile.levelXp / profile.levelXpGoal) * 100);
  els.levelLabel.textContent = `${profile.levelXp}/${profile.levelXpGoal} XP to Level ${profile.level + 1} (${percent}%)`;
  requestAnimationFrame(() => (els.xpMeter.style.width = `${percent}%`));
}

function renderLeaderboard(items) {
  els.leaderboard.innerHTML = items
    .map((user, index) => {
      const mine = state.currentUser && user.uid === state.currentUser.uid;
      return `
        <div class="leaderboard-item ${mine ? "me" : ""}">
          <strong>#${index + 1}</strong>
          <div style="display:flex;align-items:center;gap:8px"><span class="dot"></span><span>${user.name || "Student"}</span></div>
          <b>${user.totalXp || 0} XP</b>
        </div>`;
    })
    .join("");
}

function bindAuthTabs() {
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      els.tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.authMode = tab.dataset.mode;
      const signup = state.authMode === "signup";
      els.examField.hidden = !signup;
      els.authSubmitBtn.textContent = signup ? "Create Account" : "Login";
      els.authHint.textContent = signup
        ? "Signup creates your streak profile and leaderboard account."
        : "Login to view and track your progress.";
      els.authError.textContent = "";
    });
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  els.authError.textContent = "";
  els.authSubmitBtn.disabled = true;

  try {
    const payload = validateAuthForm(new FormData(els.authForm));

    if (state.authMode === "signup") {
      const cred = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      await updateProfile(cred.user, { displayName: payload.name });
      await ensureUserProfile(cred.user, payload);
    } else {
      const cred = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      await ensureUserProfile(cred.user);
    }
    els.authForm.reset();
  } catch (error) {
    els.authError.textContent = humanizeFirebaseError(error);
  } finally {
    els.authSubmitBtn.disabled = false;
  }
}

async function handleSessionSubmit(event) {
  event.preventDefault();
  els.sessionError.textContent = "";
  els.sessionSubmitBtn.disabled = true;

  try {
    const { subject, minutes } = validateSessionForm(new FormData(els.sessionForm));
    const xpGain = Math.round(minutes * 2);
    const userRef = doc(db, "users", state.currentUser.uid);

    const profile = await fetchUserProfile(state.currentUser.uid);
    const previous = profile.subjectProgress || DEFAULT_PROGRESS;
    const nextSubjectValue = Math.min(100, (previous[subject] || 0) + Math.round(minutes / 6));

    await addDoc(collection(db, "users", state.currentUser.uid, "sessions"), {
      subject,
      minutes,
      xpGain,
      createdAt: serverTimestamp(),
    });

    const now = new Date();
    let streakDays = profile.streakDays || 0;
    if (profile.lastStudyAt?.toDate) {
      const last = profile.lastStudyAt.toDate();
      const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) streakDays += 1;
      else if (daysDiff > 1) streakDays = 1;
    } else streakDays = 1;

    await updateDoc(userRef, {
      totalXp: increment(xpGain),
      weeklyMinutes: increment(minutes),
      streakDays,
      [`subjectProgress.${subject}`]: nextSubjectValue,
      lastStudyAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    els.sessionForm.reset();
  } catch (error) {
    els.sessionError.textContent = humanizeFirebaseError(error);
  } finally {
    els.sessionSubmitBtn.disabled = false;
  }
}

function subscribeLeaderboard() {
  if (state.unsubLeaderboard) state.unsubLeaderboard();

  const q = query(collection(db, "users"), orderBy("totalXp", "desc"), limit(20));
  state.unsubLeaderboard = onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
      renderLeaderboard(users);
    },
    () => {
      els.leaderboard.innerHTML = "<p class='error'>Could not load leaderboard.</p>";
    }
  );
}

function subscribeSocialProof() {
  if (state.unsubSocialProof) state.unsubSocialProof();

  state.unsubSocialProof = onSnapshot(collection(db, "users"), (snapshot) => {
    const users = snapshot.docs.map((d) => d.data());
    const totalUsers = users.length;
    const totalMinutes = users.reduce((sum, u) => sum + (u.weeklyMinutes || 0), 0);
    const totalXp = users.reduce((sum, u) => sum + (u.totalXp || 0), 0);

    els.statActive.textContent = totalUsers.toLocaleString("en-IN");
    els.statMinutes.textContent = totalMinutes.toLocaleString("en-IN");
    els.statShares.textContent = `${Math.round(totalXp / 1000).toLocaleString("en-IN")}K`;

    els.proofUsers.textContent = totalUsers.toLocaleString("en-IN");
    els.proofMinutes.textContent = totalMinutes.toLocaleString("en-IN");
    els.proofXp.textContent = totalXp.toLocaleString("en-IN");
  });
}

async function refreshUserProfile(user) {
  const profile = await fetchUserProfile(user.uid);
  state.profile = profile;
  renderDashboard(profile);
}

function bindAuthState() {
  onAuthStateChanged(auth, async (user) => {
    state.currentUser = user;
    els.logoutBtn.hidden = !user;
    els.sessionSubmitBtn.disabled = !user;

    if (user) {
      await ensureUserProfile(user);
      await refreshUserProfile(user);
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          state.profile = { ...data, ...levelFromXp(data.totalXp || 0) };
          renderDashboard(state.profile);
        }
      });
    } else {
      state.profile = null;
      renderDashboard(null);
    }
  });
}

function humanizeFirebaseError(error) {
  const code = error?.code || "";
  const map = {
    "auth/email-already-in-use": "Email already in use. Please login instead.",
    "auth/invalid-credential": "Invalid credentials. Please re-check email/password.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "permission-denied": "Permission denied. Check Firestore rules and auth state.",
  };
  return map[code] || error?.message || "Something went wrong. Please try again.";
}

function bindGeneralUi() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible"));
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  els.logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(humanizeFirebaseError(error));
    }
  });

  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.sessionForm.addEventListener("submit", handleSessionSubmit);
}

async function bootstrap() {
  bindGeneralUi();
  bindAuthTabs();
  bindAuthState();
  subscribeLeaderboard();
  subscribeSocialProof();

  // Warm-up read to surface Firestore index/rules issues early.
  await getDocs(query(collection(db, "users"), limit(1)));
}

bootstrap().catch((error) => {
  console.error(error);
  alert("Startup error. Check Firebase config, rules, and indexes.");
});
