(() => {
  const grid = document.getElementById("artists-directory-grid");
  const search = document.getElementById("artist-directory-search");
  const clear = document.getElementById("artist-directory-clear");
  const count = document.getElementById("artist-count");
  const status = document.getElementById("directory-status");
  const empty = document.getElementById("directory-empty");
  const sortButtons = [...document.querySelectorAll("[data-sort]")];
  if (!grid || !search || !clear || !count || !status || !empty) return;

  const normalize = (value = "") => String(value).toLocaleLowerCase("ar")
    .replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim();
  const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const rankOrder = { SSS: 0, SS: 1, S: 2, A: 3, B: 4, C: 5, D: 6, E: 7 };
  let artists = [];
  let sortBy = "name";

  const card = (artist) => {
    const tags = [artist.rank, artist.nickname, ...(artist.titles || [])].filter(Boolean).slice(0, 3);
    return `<a class="directory-artist-card" href="../${escapeHtml(artist.href)}">
      <img src="../${escapeHtml(artist.image)}" alt="صورة الفنان ${escapeHtml(artist.name)}" loading="lazy">
      <span class="directory-artist-copy"><small>ملف فني</small><strong>${escapeHtml(artist.name)}</strong><em>${escapeHtml(artist.specialty || artist.summary || "فنان من أرشيف الجزيرة")}</em>
        <span class="directory-artist-meta">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}<b class="directory-arrow" aria-hidden="true">←</b></span>
      </span>
    </a>`;
  };
  const sorted = (items) => [...items].sort((a, b) => {
    if (sortBy === "rank") return (rankOrder[a.rank] ?? 99) - (rankOrder[b.rank] ?? 99) || a.name.localeCompare(b.name, "ar");
    if (sortBy === "nickname") return (a.nickname || "").localeCompare(b.nickname || "", "ar") || a.name.localeCompare(b.name, "ar");
    return a.name.localeCompare(b.name, "ar");
  });
  const render = () => {
    const query = normalize(search.value);
    clear.hidden = !query;
    const terms = query.split(/\s+/).filter(Boolean);
    const filtered = sorted(artists.filter((artist) => {
      const haystack = normalize([artist.name, artist.nickname, artist.specialty, artist.preferredMaterial, artist.rank, ...(artist.titles || []), ...(artist.classifications || [])].join(" "));
      return terms.every((term) => haystack.includes(term));
    }));
    count.textContent = `(${filtered.length} من ${artists.length})`;
    status.textContent = query ? `نتائج البحث عن «${search.value.trim()}»` : "مرتبة أبجديًا؛ يمكنك البحث بالاسم أو اللقب الشخصي أو التخصص.";
    empty.hidden = filtered.length > 0;
    grid.innerHTML = filtered.map(card).join("");
  };
  search.addEventListener("input", render);
  clear.addEventListener("click", () => { search.value = ""; render(); search.focus(); });
  sortButtons.forEach((button) => button.addEventListener("click", () => {
    sortBy = button.dataset.sort;
    sortButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  }));
  fetch("../archive-search.json", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("تعذر تحميل الفهرس")))
    .then((data) => { artists = Array.isArray(data.artists) ? data.artists : []; render(); })
    .catch(() => { status.textContent = "تعذر تحميل ملفات الفنانين حاليًا."; count.textContent = ""; });
})();
