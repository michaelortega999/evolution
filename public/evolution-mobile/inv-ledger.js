// Phone manual investing ledger: account balance = opening/reference balance + Σ linked trade P/L.
// Accounts get stable ids; trades link by acctId (the old index `acct` is kept for display only).
// Compatibility: an account without `open` gets open = stored bal − Σ P/L of its linked trades
// (exactly undoing the old "bal += pl on add"), provenance openSrc:"derived-v1", raw legacyBal kept.
// Unlinkable legacy trades (bad index) stay stored but never move any balance.
(function (g) {
  var mkId = function (taken) {
    var n = taken.length + 1, id;
    do { id = "acc-" + Date.now().toString(36) + "-" + n++; } while (taken.indexOf(id) >= 0);
    return id;
  };
  var num = function (x) { return typeof x === "number" && isFinite(x) ? x : 0; };
  function plOf(trades, id) {
    return trades.reduce(function (a, t) { return t.acctId === id && typeof t.pl === "number" && isFinite(t.pl) ? a + t.pl : a; }, 0);
  }
  function recalc(inv) {
    var trades = Array.isArray(inv.trades) ? inv.trades : [];
    var accounts = (inv.accounts || []).map(function (a) { return Object.assign({}, a, { bal: num(a.open) + plOf(trades, a.id) }); });
    return Object.assign({}, inv, { accounts: accounts });
  }
  function migrate(inv) {
    if (!inv || !Array.isArray(inv.accounts)) return inv;
    var trades = Array.isArray(inv.trades) ? inv.trades.slice() : [];
    var taken = inv.accounts.map(function (a) { return a.id; }).filter(Boolean);
    // Deterministic ids for existing accounts so every device migrates the same data identically.
    var accounts = inv.accounts.map(function (a, i) {
      if (a.id) return a;
      var id = "acc-legacy-" + i + "-" + String(a.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      while (taken.indexOf(id) >= 0) id += "x";
      taken.push(id); return Object.assign({}, a, { id: id });
    });
    trades = trades.map(function (t) {
      if (t.acctId !== undefined) return t;
      var a = accounts[t.acct];
      return Object.assign({}, t, { acctId: a ? a.id : null });
    });
    accounts = accounts.map(function (a) {
      if (typeof a.open === "number") return a;
      return Object.assign({}, a, { open: num(a.bal) - plOf(trades, a.id), openSrc: "derived-v1", legacyBal: a.bal });
    });
    return recalc(Object.assign({}, inv, { accounts: accounts, trades: trades }));
  }
  function addAccount(inv, acc) {
    var taken = (inv.accounts || []).map(function (a) { return a.id; });
    var a = Object.assign({}, acc, { id: mkId(taken), open: num(acc.bal), openSrc: "entered" });
    return recalc(Object.assign({}, inv, { accounts: (inv.accounts || []).concat(a) }));
  }
  function addTrade(inv, row) {
    var a = inv.accounts[row.acct];
    var t = Object.assign({}, row, { acctId: a ? a.id : null });
    return recalc(Object.assign({}, inv, { trades: [t].concat(inv.trades || []) }));
  }
  function editTrade(inv, id, fields) {
    return recalc(Object.assign({}, inv, { trades: (inv.trades || []).map(function (t) { return t.id === id ? Object.assign({}, t, fields, { id: t.id, acctId: t.acctId }) : t; }) }));
  }
  function deleteTrade(inv, id) {
    return recalc(Object.assign({}, inv, { trades: (inv.trades || []).filter(function (t) { return t.id !== id; }) }));
  }
  function deleteAccount(inv, i) {
    var gone = inv.accounts[i];
    if (!gone) return inv;
    var accounts = inv.accounts.filter(function (_, n) { return n !== i; });
    var trades = (inv.trades || []).filter(function (t) { return t.acctId !== gone.id; }).map(function (t) {
      var at = accounts.findIndex(function (a) { return a.id === t.acctId; });
      return at >= 0 ? Object.assign({}, t, { acct: at }) : t; // display index follows its own account
    });
    return recalc(Object.assign({}, inv, { accounts: accounts, trades: trades }));
  }
  g.EvoInvLedger = { migrate: migrate, recalc: recalc, addAccount: addAccount, addTrade: addTrade, editTrade: editTrade, deleteTrade: deleteTrade, deleteAccount: deleteAccount };
})(typeof window !== "undefined" ? window : globalThis);
