(() => {
  const form = document.getElementById("archive-search-form");
  const input = document.getElementById("archive-search-main");
  const clearButton = document.getElementById("archive-search-clear");
  const results = document.getElementById("archive-search-results");
  const hint = document.getElementById("archive-search-hint");
  if (!form || !input || !clearButton || !results || !hint) return;
  const headerInput = document.querySelector("[data-header-search-input]");
  const searchKeys = document.querySelectorAll("[data-search-key]");

  const normalize = (value = "") => String(value)
    .toLocaleLowerCase("ar")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();

  const escapeHtml = (value = "") => String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[char]));

  const field = (label, value) => value ? `<span class="search-result-tag"><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>` : "";

  const artistCard = (artist) => `<a class="search-result-card artist-result-card" href="${escapeHtml(artist.href)}">
    <img src="${escapeHtml(artist.image)}" alt="صورة الفنان ${escapeHtml(artist.name)}" loading="lazy">
    <span class="search-result-copy"><small>فنان</small><strong>${escapeHtml(artist.name)}</strong><em>${escapeHtml(artist.summary)}</em>
      <span class="search-result-tags">${field("اللقب الشخصي", artist.nickname)}${field("التخصص", artist.specialty)}${field("التصنيف", artist.rank)}${artist.titles.map((title) => field("شارة", title)).join("")}</span>
    </span><span class="search-result-arrow" aria-hidden="true">←</span>
  </a>`;

  const artworkCard = (work) => `<a class="search-result-card artwork-result-card" href="${escapeHtml(work.href)}">
    <img src="${escapeHtml(work.image)}" alt="لوحة ${escapeHtml(work.title)} للفنان ${escapeHtml(work.artist)}" loading="lazy">
    <span class="search-result-copy"><small>لوحة</small><strong>${escapeHtml(work.title)}</strong><em>${escapeHtml(work.artist)}</em>
      <span class="search-result-tags">${field("النوع", work.type)}${field("الخامة", work.material)}${field("المقاس", work.size)}</span>
    </span><span class="search-result-arrow" aria-hidden="true">←</span>
  </a>`;

  let index = { artists: [], artworks: [] };
  let currentQuery = "";

  const render = (rawQuery) => {
    currentQuery = rawQuery;
    const query = normalize(rawQuery);
    clearButton.hidden = !query;
    if (!query) {
      hint.textContent = "اكتب كلمة واحدة أو أكثر، وستظهر النتائج فورًا.";
      results.replaceChildren();
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matches = (value) => terms.every((term) => normalize(value).includes(term));
    const artists = index.artists.filter((artist) => matches([
      artist.name, artist.nickname, artist.specialty, artist.preferredMaterial, artist.rank,
      ...(artist.classifications || []), ...artist.titles
    ].join(" ")));
    const artworks = index.artworks.filter((work) => matches([
      work.title, work.artist, work.type, work.material, work.size
    ].join(" ")));

    hint.textContent = `نتائج البحث عن «${rawQuery.trim()}»: ${artists.length + artworks.length} نتيجة`;
    if (!artists.length && !artworks.length) {
      results.innerHTML = `<div class="search-empty"><strong>لم نعثر على نتيجة</strong><span>جرّب اسمًا آخر مثل «جوكر» أو «حبر» أو «A4».</span></div>`;
      return;
    }

    const sections = [];
    if (artists.length) sections.push(`<div class="search-result-group"><h3>ملفات الفنانين <span>${artists.length}</span></h3>${artists.map(artistCard).join("")}</div>`);
    if (artworks.length) sections.push(`<div class="search-result-group"><h3>الأعمال الفنية <span>${artworks.length}</span></h3>${artworks.map(artworkCard).join("")}</div>`);
    results.innerHTML = sections.join("");
  };

  input.addEventListener("input", () => render(input.value));
  form.addEventListener("submit", (event) => event.preventDefault());
  headerInput?.addEventListener("input", () => {
    input.value = headerInput.value;
    render(input.value);
  });
  document.querySelector("[data-header-search-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    input.value = headerInput?.value || "";
    render(input.value);
    document.getElementById("archive-search-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    input.focus();
  });
  searchKeys.forEach((key) => key.addEventListener("click", () => {
    input.value = key.dataset.searchKey || "";
    if (headerInput) headerInput.value = input.value;
    render(input.value);
    input.focus();
  }));
  clearButton.addEventListener("click", () => {
    input.value = "";
    render("");
    input.focus();
  });

  fetch("archive-search.json", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("تعذر تحميل فهرس البحث")))
    .then((data) => { index = data; render(currentQuery || input.value); })
    .catch((error) => console.error(error));
})();
