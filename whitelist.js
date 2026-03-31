const SUPABASE_URL = "https://hphxtlotlwazwajvrpub.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHh0bG90bHdhendhanZycHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDAzNzcsImV4cCI6MjA5MDAxNjM3N30.VylwC9DSKWszFpI6dLL9FunIPmXx6SxJmfqE-Iz8qvI";
const TABLE = "whitelist_entries";
const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

const form = document.getElementById("whitelist-form");
const formStatus = document.getElementById("form-status");
const checkerStatus = document.getElementById("checker-status");
const walletInput = document.getElementById("wl-wallet");
const connectButton = document.getElementById("connect-wallet-btn");
const submitButton = document.getElementById("submit-btn");
const walletLookupButton = document.getElementById("wallet-lookup-btn");
const checkWalletButton = document.getElementById("check-wallet-btn");
const checkWalletInput = document.getElementById("check-wallet");
const capacityStat = document.getElementById("capacity-stat");
const applicationsStat = document.getElementById("applications-stat");
const remainingStat = document.getElementById("remaining-stat");
const statsNote = document.getElementById("stats-note");

function showBox(el, kind, message) {
  if (!el) return;
  el.classList.remove("hidden", "notice", "warning");
  el.classList.add(kind === "success" ? "notice" : "warning");
  el.innerHTML = message;
}

function normalizeWallet(wallet) {
  return (wallet || "").trim();
}

function validWallet(wallet) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(normalizeWallet(wallet));
}

function isDuplicateWalletError(message) {
  return /duplicate key value|unique constraint|whitelist_entries_wallet_key|wallet.*already/i.test(message || "");
}

async function connectPhantom() {
  const provider = window.solana;
  if (!provider || !provider.isPhantom) {
    showBox(formStatus, "error", "Phantom wallet was not detected. Open this page in a browser with Phantom installed.");
    return;
  }

  try {
    const res = await provider.connect();
    const address = res?.publicKey?.toString?.() || "";
    if (address) {
      walletInput.value = address;
      if (checkWalletInput) checkWalletInput.value = address;
      connectButton.textContent = `${address.slice(0, 4)}...${address.slice(-4)}`;
      showBox(formStatus, "success", "Wallet connected successfully. Your Solana wallet has been filled into the form.");
    }
  } catch (err) {
    showBox(formStatus, "error", `Wallet connection failed: ${err?.message || "Unknown error"}`);
  }
}

async function loadWhitelistStats() {
  if (!capacityStat || !applicationsStat || !remainingStat) return;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_whitelist_stats`, {
      method: "POST",
      headers,
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Stats lookup failed.");
    }

    const data = await response.json();
    const stats = Array.isArray(data) ? data[0] : data;
    if (!stats) throw new Error("No stats returned.");

    capacityStat.textContent = String(stats.capacity ?? 250);
    applicationsStat.textContent = String(stats.total_applications ?? 0);
    remainingStat.textContent = String(stats.spots_remaining ?? 250);
    if (statsNote) {
      statsNote.textContent = `Approved: ${stats.approved_count ?? 0} • Pending: ${stats.pending_count ?? 0} • Remaining: ${stats.spots_remaining ?? 250}`;
    }
  } catch (err) {
    if (statsNote) statsNote.textContent = "Whitelist stats could not be loaded yet. Re-run the updated supabase-setup.sql once, then refresh this page.";
  }
}

async function submitWhitelist(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById("wl-name").value.trim(),
    email: document.getElementById("wl-email").value.trim(),
    twitter: document.getElementById("wl-twitter").value.trim(),
    discord: document.getElementById("wl-discord").value.trim(),
    wallet: normalizeWallet(walletInput.value),
    tier: document.getElementById("wl-tier").value,
    reason: document.getElementById("wl-reason").value.trim(),
    status: "pending"
  };

  if (!payload.name || !payload.email || !payload.wallet) {
    showBox(formStatus, "error", "Name, email, and wallet are required.");
    return;
  }

  if (!validWallet(payload.wallet)) {
    showBox(formStatus, "error", "Please enter a valid Solana wallet address.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...headers, "Prefer": "return=minimal" },
      body: JSON.stringify([payload])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to submit application.");
    }

    form.reset();
    if (checkWalletInput) checkWalletInput.value = payload.wallet;
    showBox(formStatus, "success", `Application received. Status: <strong>pending</strong>. Approve it in Supabase when you are ready.`);
    await loadWhitelistStats();
  } catch (err) {
    const msg = err?.message || "Submission failed.";
    if (isDuplicateWalletError(msg)) {
      showBox(formStatus, "error", "That wallet has already applied. Use the wallet checker or approve the existing application in Supabase.");
    } else {
      const helpful = msg.includes("relation") || msg.includes("get_whitelist_stats") || msg.includes("whitelist_entries")
        ? `${msg}<br><br>Re-run the updated <strong>supabase-setup.sql</strong> file in your Supabase SQL Editor, then refresh the page.`
        : msg;
      showBox(formStatus, "error", helpful);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit application";
  }
}

async function checkWalletStatus(walletOverride) {
  const wallet = normalizeWallet(walletOverride || checkWalletInput.value);
  if (!validWallet(wallet)) {
    showBox(checkerStatus, "error", "Enter a valid Solana wallet to check.");
    return;
  }

  checkWalletButton.disabled = true;
  walletLookupButton && (walletLookupButton.disabled = true);
  checkWalletButton.textContent = "Checking...";
  if (walletLookupButton) walletLookupButton.textContent = "Checking...";

  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${TABLE}`);
    url.searchParams.set("select", "wallet,status,tier,created_at");
    url.searchParams.set("wallet", `eq.${wallet}`);
    url.searchParams.set("status", "eq.approved");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), { method: "GET", headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Wallet lookup failed.");
    }

    const rows = await response.json();
    if (rows.length) {
      const row = rows[0];
      showBox(checkerStatus, "success", `Approved ✅<br>Wallet: <strong>${row.wallet}</strong><br>Tier: <strong>${row.tier || "standard"}</strong>`);
    } else {
      showBox(checkerStatus, "error", "This wallet is not currently approved on the whitelist. It may still be pending, rejected, or not submitted yet.");
    }
  } catch (err) {
    const msg = err?.message || "Wallet lookup failed.";
    const helpful = msg.includes("relation") || msg.includes("whitelist_entries")
      ? `${msg}<br><br>Re-run the updated <strong>supabase-setup.sql</strong> file in your Supabase SQL Editor, then refresh the page.`
      : msg;
    showBox(checkerStatus, "error", helpful);
  } finally {
    checkWalletButton.disabled = false;
    if (walletLookupButton) walletLookupButton.disabled = false;
    checkWalletButton.textContent = "Check wallet";
    if (walletLookupButton) walletLookupButton.textContent = "Check this wallet before applying";
  }
}

connectButton?.addEventListener("click", connectPhantom);
form?.addEventListener("submit", submitWhitelist);
checkWalletButton?.addEventListener("click", () => checkWalletStatus());
walletLookupButton?.addEventListener("click", () => {
  const wallet = normalizeWallet(walletInput.value);
  if (!wallet) {
    showBox(formStatus, "error", "Enter or connect a wallet first, then run the duplicate/approval check.");
    return;
  }
  if (checkWalletInput) checkWalletInput.value = wallet;
  checkWalletStatus(wallet);
});

loadWhitelistStats();
