(() => {
  const form = document.getElementById("artist-registration-form");
  const list = document.getElementById("artworks-list");
  const empty = document.getElementById("empty-artworks");
  const template = document.getElementById("artwork-template");
  const addButton = document.getElementById("add-artwork");
  const clearButton = document.getElementById("clear-form");
  const status = document.getElementById("form-status");
  let artworkCount = 0;

  const updateEmpty = () => { empty.hidden = list.children.length > 0; };
  const addArtwork = () => {
    artworkCount += 1;
    const fragment = template.content.cloneNode(true);
    const entry = fragment.querySelector(".artwork-entry");
    entry.dataset.index = artworkCount;
    entry.querySelector(".artwork-entry-heading strong").textContent = `لوحة رقم ${artworkCount}`;
    entry.querySelector(".remove-artwork").addEventListener("click", () => { entry.remove(); updateEmpty(); });
    list.appendChild(fragment);
    updateEmpty();
    list.lastElementChild.querySelector("input[name=title]").focus();
  };
  const collect = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    data.artworks = [...list.querySelectorAll(".artwork-entry")].map((entry) => Object.fromEntries(new FormData(entry).entries()));
    delete data.consent;
    delete data.profileImage;
    data.profileImageName = form.elements.profileImage.files[0]?.name || "";
    data.artworks = data.artworks.map((artwork, index) => ({ ...artwork, imageName: artwork.image?.name || "", number: index + 1, image: undefined }));
    return { ...data, submittedAt: new Date().toISOString(), reviewStatus: "pending-demo", badges: [] };
  };
  addButton.addEventListener("click", addArtwork);
  clearButton.addEventListener("click", () => {
    if (!window.confirm("هل تريد مسح بيانات النموذج التجريبي؟")) return;
    form.reset(); list.replaceChildren(); artworkCount = 0; updateEmpty(); status.textContent = "تم مسح النموذج."; status.classList.remove("error");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("error");
    if (!form.reportValidity()) { status.textContent = "أكمل الحقول المطلوبة قبل الحفظ."; status.classList.add("error"); return; }
    const record = collect();
    const saved = JSON.parse(localStorage.getItem("jaa-demo-submissions") || "[]");
    saved.push({ id: `DEMO-${Date.now()}`, ...record });
    localStorage.setItem("jaa-demo-submissions", JSON.stringify(saved));
    status.textContent = "تم حفظ الطلب تجريبيًا داخل هذا المتصفح فقط. لم يتم رفعه أو نشره.";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });
  updateEmpty();
})();
