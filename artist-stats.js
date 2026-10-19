(() => {
  const trigger = document.querySelector("[data-skill-stats-trigger]");
  const dialog = document.getElementById("artist-skill-dialog");
  const closeButton = dialog?.querySelector("[data-skill-stats-close]");
  const dataNode = document.getElementById("artist-skill-ratings");
  const groupsRoot = document.getElementById("artist-skill-groups");
  const meta = document.getElementById("artist-skill-meta");
  const artistName = document.getElementById("artist-skill-name");

  if (!trigger || !dialog || !closeButton || !dataNode || !groupsRoot) return;

  let data;
  try {
    data = JSON.parse(dataNode.textContent);
  } catch (error) {
    trigger.disabled = true;
    console.error("تعذر قراءة بيانات الإحصاءات الفنية:", error);
    return;
  }

  const makeIcon = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
  const icons = {
    freehand: makeIcon('<path d="m4 16 9-9 4 4-9 9H4z"/><path d="m12 8 4 4M4 20h16"/>'),
    observation: makeIcon('<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>'),
    reference: makeIcon('<circle cx="11" cy="11" r="6.5"/><path d="M11 7.5v7M7.5 11h7M16 16l5 5"/>'),
    line: makeIcon('<path d="M4 19 9 5l4 12 3-8 4 10"/><circle cx="4" cy="19" r="1"/><circle cx="20" cy="19" r="1"/>'),
    proportion: makeIcon('<path d="M4 5v14M8 5v4M8 13v2M12 5v4M12 13v2M16 5v4M16 13v2M20 5v14M4 12h16"/>'),
    light: makeIcon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    color: makeIcon('<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3 1.7 1.7 0 0 1 1.3-2.8H18a3 3 0 0 0 3-3c0-5-4-8.9-9-8.9Z"/><circle cx="7.5" cy="11" r=".8"/><circle cx="10" cy="7.5" r=".8"/><circle cx="15" cy="8" r=".8"/>'),
    material: makeIcon('<path d="m14 4 6 6M4 20l4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z"/><path d="M3 21h18"/>'),
    detail: makeIcon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 10.5h5M10.5 8v5"/>'),
    composition: makeIcon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18M15 9v12"/>'),
    creativity: makeIcon('<path d="M9 18h6M10 22h4M8 14c-1.4-1-2-2.4-2-4a6 6 0 1 1 12 0c0 1.6-.6 3-2 4l-1 2h-6z"/><path d="M12 2V1M3 10H2m20 0h-1M5 4 4 3m16 1 1-1"/>'),
    story: makeIcon('<path d="M4 5.5c3-1 6-1 8 1v14c-2-2-5-2-8-1zM20 5.5c-3-1-6-1-8 1v14c2-2 5-2 8-1z"/><path d="M7 9h2m6 0h2M7 13h2m6 0h2"/>'),
    style: makeIcon('<path d="M12 3 14.7 8.5 21 9.4l-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.4l6.3-.9z"/>'),
    anatomy: makeIcon('<circle cx="12" cy="5" r="2.5"/><path d="M8.5 21v-5l-2-3 1.5-5 4 2 4-2 1.5 5-2 3v5M8 13h8M9 17h6"/>'),
    background: makeIcon('<path d="M3 20h18M4 18l5-6 3 3 4-7 4 10"/><circle cx="17" cy="5" r="2"/>'),
    texture: makeIcon('<path d="M4 5h16M4 9h16M4 13h16M4 17h16M4 21h16"/><circle cx="7" cy="7" r=".6"/><circle cx="15" cy="15" r=".6"/>'),
    experiment: makeIcon('<path d="M9 3h6M10 3v6l-5.5 9.5A2.3 2.3 0 0 0 6.5 22h11a2.3 2.3 0 0 0 2-3.5L14 9V3M8 15h8"/><path d="m10 18 1.5-1.5 1.5 1 2-2"/>'),
    speed: makeIcon('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M18 5l1.5-1.5"/>'),
    clean: makeIcon('<path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h7M9 17h4"/><path d="m3 9 1.5 1.5L7 8"/>')
  };

  const groups = [
    {
      title: "مهارات التنفيذ الأساسية",
      items: [
        { id: "freehand", name: "الرسم الحر", description: "الرسم مباشرة دون شبكة أو مساعدة.", icon: "freehand" },
        { id: "observation", name: "دقة الملاحظة", description: "ملاحظة الفروق والنسب والتفاصيل في المرجع.", icon: "observation" },
        { id: "reference-accuracy", name: "دقة النقل والنسخ", description: "نقل التفاصيل والنسب من المرجع بدقة.", icon: "reference" },
        { id: "line-control", name: "ثبات اليد والتحكم بالخط", description: "التحكم بالخطوط والمنحنيات والتفاصيل.", icon: "line" },
        { id: "proportion-perspective", name: "التناسب والمنظور", description: "صحة النسب والأبعاد وإظهار العمق.", icon: "proportion" },
        { id: "light-shadow", name: "الظلال والإضاءة", description: "توزيع الضوء والظل وإظهار الحجم.", icon: "light" },
        { id: "color-harmony", name: "الألوان وتناسقها", description: "اختيار الألوان ودمجها وتوزيعها.", icon: "color" },
        { id: "material-control", name: "التحكم بالخامة", description: "استغلال خصائص الخامة وتقنياتها.", icon: "material" },
        { id: "details", name: "الاهتمام بالتفاصيل", description: "دقة التفاصيل والملامس المهمة في العمل.", icon: "detail" },
        { id: "composition", name: "التكوين وتوزيع العناصر", description: "ترتيب العناصر داخل مساحة اللوحة.", icon: "composition" }
      ]
    },
    {
      title: "الإبداع والبصمة",
      items: [
        { id: "creativity", name: "الخيال والإبداع", description: "ابتكار أفكار ومشاهد وحلول بصرية.", icon: "creativity" },
        { id: "storytelling", name: "التعبير والسرد البصري", description: "نقل قصة أو إحساس من خلال الصورة.", icon: "story" },
        { id: "personal-style", name: "الأسلوب والبصمة الشخصية", description: "وجود طابع فني خاص يمكن تمييزه.", icon: "style" }
      ]
    },
    {
      title: "معايير تخصصية",
      note: "تُقيّم عند انطباقها على نوع أعمال الفنان.",
      collapsible: true,
      items: [
        { id: "anatomy", name: "التشريح والعضلات", description: "فهم تركيب الجسم والعضلات والمفاصل.", icon: "anatomy" },
        { id: "backgrounds", name: "بناء الخلفيات والمشاهد", description: "إنشاء البيئات والخلفيات وتوزيع عناصرها.", icon: "background" },
        { id: "texture-pores", name: "الملمس والمسامات", description: "إظهار ملمس السطوح وتفاصيلها الدقيقة.", icon: "texture" },
        { id: "material-experimentation", name: "التجريب بالخامات", description: "اختبار خامات وتقنيات متنوعة.", icon: "experiment" }
      ]
    },
    {
      title: "مؤشرات مساندة اختيارية",
      note: "لا تُستخدم وحدها للحكم على جودة العمل.",
      collapsible: true,
      items: [
        { id: "speed", name: "السرعة في الإنجاز", description: "كفاءة استخدام الوقت، وليست مقياسًا منفردًا للجودة.", icon: "speed" },
        { id: "cleanliness", name: "نظافة التنفيذ", description: "تُراعى بحسب الخامة وأسلوب العمل.", icon: "clean" }
      ]
    }
  ];

  if (artistName) artistName.textContent = data.artistName || "";
  if (meta) meta.textContent = data.evaluatedAt ? `تاريخ التقييم: ${data.evaluatedAt}` : "الدرجات غير مسجلة بعد؛ كل مهارة تُقيّم منفردة من 100.";

  const ratings = data.scores || {};
  const notApplicable = new Set(Array.isArray(data.notApplicable) ? data.notApplicable : []);

  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function makeCard(skill) {
    const card = makeElement("article", "skill-stat-card");
    const head = makeElement("div", "skill-stat-head");
    const icon = makeElement("span", "skill-stat-icon");
    icon.innerHTML = icons[skill.icon] || icons.detail;
    const copy = makeElement("div", "skill-stat-copy");
    copy.append(makeElement("h4", "skill-stat-name", skill.name));
    copy.append(makeElement("p", "skill-stat-description", skill.description));
    const scoreBox = makeElement("div", "skill-stat-score");
    const scoreValue = makeElement("strong", "skill-stat-value");
    const scoreUnit = makeElement("span", "skill-stat-unit", "/ 100");
    scoreBox.append(scoreValue, scoreUnit);
    head.append(icon, copy, scoreBox);

    const meter = makeElement("div", "skill-stat-meter");
    const fill = makeElement("span", "skill-stat-fill");
    meter.append(fill);
    const foot = makeElement("div", "skill-stat-foot");
    const state = makeElement("span", "skill-stat-state");
    const scale = makeElement("span", "skill-stat-scale", "مقياس مستقل");
    foot.append(state, scale);

    const rating = ratings[skill.id];
    const rawScore = typeof rating === "number" ? rating : rating && typeof rating === "object" ? rating.score : null;
    const evidence = rating && typeof rating === "object" ? rating.evidence : "";
    const validScore = typeof rawScore === "number" && Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 100;

    if (notApplicable.has(skill.id)) {
      scoreValue.textContent = "—";
      state.textContent = "لا ينطبق";
      meter.classList.add("is-unrated");
      meter.setAttribute("role", "img");
      meter.setAttribute("aria-label", `${skill.name}: لا ينطبق`);
    } else if (validScore) {
      const shown = Number.isInteger(rawScore) ? String(rawScore) : rawScore.toFixed(1);
      scoreValue.textContent = `${shown}%`;
      state.textContent = evidence ? String(evidence) : "تقييم مستقل";
      fill.style.width = `${rawScore}%`;
      meter.setAttribute("role", "progressbar");
      meter.setAttribute("aria-valuemin", "0");
      meter.setAttribute("aria-valuemax", "100");
      meter.setAttribute("aria-valuenow", String(rawScore));
      meter.setAttribute("aria-label", `${skill.name}: ${shown} من 100`);
    } else {
      scoreValue.textContent = "—";
      state.textContent = "لم يُقيّم بعد";
      meter.classList.add("is-unrated");
      meter.setAttribute("role", "img");
      meter.setAttribute("aria-label", `${skill.name}: لم يُقيّم بعد، من 100`);
    }

    card.append(head, meter, foot);
    return card;
  }

  for (const group of groups) {
    let shell;
    let list;
    if (group.collapsible) {
      shell = makeElement("details", "skill-stat-details");
      const summary = makeElement("summary", "skill-stat-summary");
      const title = makeElement("span", "skill-stat-group-title", group.title);
      const count = makeElement("span", "skill-stat-count", String(group.items.length));
      summary.append(title, count);
      shell.append(summary);
      list = makeElement("div", "skill-stat-list");
      if (group.note) shell.append(makeElement("p", "skill-stat-group-note", group.note));
      shell.append(list);
    } else {
      shell = makeElement("section", "skill-stat-group");
      const heading = makeElement("h3", "skill-stat-group-title", group.title);
      shell.append(heading);
      if (group.note) shell.append(makeElement("p", "skill-stat-group-note", group.note));
      list = makeElement("div", "skill-stat-list");
      shell.append(list);
    }
    for (const skill of group.items) list.append(makeCard(skill));
    groupsRoot.append(shell);
  }

  trigger.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
    trigger.setAttribute("aria-expanded", "true");
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  });
})();
