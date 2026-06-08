/* ============================================================
   AutomiaCRM — mock data (Polish, realistic)
   Exposed on window.DB
   ============================================================ */
(function () {
  const STATUSES = [
    { key: 'nowy',      label: 'Nowy',      cls: 'badge-nowy' },
    { key: 'wtoku',     label: 'W toku',    cls: 'badge-wtoku' },
    { key: 'oczekuje',  label: 'Oczekuje',  cls: 'badge-oczekuje' },
    { key: 'wygrany',   label: 'Wygrany',   cls: 'badge-wygrany' },
    { key: 'przegrany', label: 'Przegrany', cls: 'badge-przegrany' },
    { key: 'zamkniety', label: 'Zamknięty', cls: 'badge-zamkniety' },
  ];

  // agents / users
  const users = [
    { id: 'u1', name: 'Jan Kowalski',     email: 'jan.kowalski@automnia.pl',   role: 'admin',   status: 'aktywny',   last: '2026-06-06 08:42', color: '#E040A0' },
    { id: 'u2', name: 'Anna Maj',         email: 'anna.maj@automnia.pl',       role: 'agent',   status: 'aktywny',   last: '2026-06-06 09:10', color: '#9B40E0' },
    { id: 'u3', name: 'Piotr Nowak',      email: 'piotr.nowak@automnia.pl',    role: 'agent',   status: 'aktywny',   last: '2026-06-05 17:55', color: '#4060E0' },
    { id: 'u4', name: 'Katarzyna Wójcik', email: 'k.wojcik@automnia.pl',       role: 'agent',   status: 'aktywny',   last: '2026-06-06 07:30', color: '#36B37E' },
    { id: 'u5', name: 'Tomasz Lewandowski', email: 't.lewandowski@reseller.pl', role: 'partner', status: 'aktywny',  last: '2026-06-04 14:20', color: '#FFB020' },
    { id: 'u6', name: 'Magda Zielińska',  email: 'magda@zielinska-consulting.pl', role: 'partner', status: 'nieaktywny', last: '2026-05-28 11:05', color: '#FF4D4D' },
  ];

  const forms = [
    { id: 'f1', name: 'Formularz kontaktowy',   slug: 'kontakt',          desc: 'Główny formularz ze strony automnia.pl', responses: 248, active: true,  created: '2025-11-03', partner: null,  assignTo: 'u2' },
    { id: 'f2', name: 'Zapytanie ofertowe',     slug: 'oferta',           desc: 'Formularz wyceny wdrożenia automatyzacji', responses: 132, active: true,  created: '2025-12-12', partner: null,  assignTo: 'u3' },
    { id: 'f3', name: 'Formularz partnera',     slug: 'partner-lewandowski', desc: 'Leady zgłaszane przez T. Lewandowskiego', responses: 64,  active: true,  created: '2026-01-20', partner: 'u5',  assignTo: 'u2' },
    { id: 'f4', name: 'Webinar — zapisy',       slug: 'webinar-ai',       desc: 'Rejestracja na webinar „AI w sprzedaży”', responses: 410, active: true,  created: '2026-02-08', partner: null,  assignTo: 'u4' },
    { id: 'f5', name: 'Demo produktu',          slug: 'demo',             desc: 'Umów prezentację platformy', responses: 89,  active: false, created: '2026-03-15', partner: null,  assignTo: 'u3' },
    { id: 'f6', name: 'Newsletter B2B',         slug: 'newsletter',       desc: 'Zapis na listę mailingową', responses: 1530, active: true,  created: '2025-09-01', partner: null,  assignTo: 'u2' },
  ];

  // leads — realistic Polish companies
  const rawLeads = [
    ['Marek Wiśniewski', 'NordKraft Sp. z o.o.', 'm.wisniewski@nordkraft.pl', '+48 601 234 567', 'wtoku', 'f2', 'u3', '2026-06-06 09:05', ['hot', 'enterprise']],
    ['Joanna Dąbrowska', 'Pixela Studio', 'joanna@pixela.studio', '+48 512 880 114', 'nowy', 'f1', 'u2', '2026-06-06 08:40', ['design']],
    ['Krzysztof Kamiński', 'Logistyka Bałtyk S.A.', 'k.kaminski@baltyk-log.pl', '+48 698 220 901', 'oczekuje', 'f2', 'u3', '2026-06-05 16:22', ['enterprise']],
    ['Agnieszka Kozłowska', 'Zielony Ogród Catering', 'kontakt@zielonyogrod.pl', '+48 604 119 558', 'wygrany', 'f1', 'u2', '2026-06-05 14:10', ['food']],
    ['Robert Mazur', 'TechBridge IT', 'robert.mazur@techbridge.pl', '+48 660 745 102', 'nowy', 'f3', 'u2', '2026-06-05 11:48', ['partner-lead']],
    ['Ewa Jankowska', 'Klinika Uśmiech', 'recepcja@klinika-usmiech.pl', '+48 22 654 33 21', 'wtoku', 'f4', 'u4', '2026-06-05 10:30', ['medyczna']],
    ['Paweł Wojciechowski', 'BudMax Konstrukcje', 'biuro@budmax.com.pl', '+48 691 008 442', 'przegrany', 'f2', 'u3', '2026-06-04 15:05', ['budowa']],
    ['Monika Kwiatkowska', 'Flofor Kwiaciarnia', 'monika@floflor.pl', '+48 530 667 220', 'nowy', 'f1', 'u4', '2026-06-04 13:20', []],
    ['Grzegorz Kaczmarek', 'AutoSerwis Kaczmarek', 'serwis@autokaczmarek.pl', '+48 605 332 118', 'wtoku', 'f1', 'u3', '2026-06-04 09:15', ['retencja']],
    ['Aleksandra Piotrowska', 'EduFuture Academy', 'a.piotrowska@edufuture.pl', '+48 781 220 654', 'oczekuje', 'f4', 'u4', '2026-06-03 17:40', ['edukacja']],
    ['Michał Grabowski', 'SunVolt Energia', 'm.grabowski@sunvolt.pl', '+48 668 901 223', 'wygrany', 'f3', 'u2', '2026-06-03 12:00', ['partner-lead', 'oze']],
    ['Natalia Pawłowska', 'Moda Bella Boutique', 'natalia@modabella.pl', '+48 502 778 330', 'nowy', 'f6', 'u2', '2026-06-03 10:25', []],
    ['Łukasz Michalski', 'Frigo Chłodnictwo', 'l.michalski@frigo.com.pl', '+48 609 443 100', 'zamkniety', 'f2', 'u3', '2026-06-02 16:50', ['b2b']],
    ['Karolina Nowakowska', 'Vivasport Klub', 'biuro@vivasport.pl', '+48 600 221 884', 'wtoku', 'f4', 'u4', '2026-06-02 14:35', ['fitness']],
    ['Adam Zając', 'Drewno-Styl Meble', 'adam@drewnostyl.pl', '+48 692 554 071', 'nowy', 'f1', 'u2', '2026-06-02 11:12', []],
    ['Dorota Król', 'Apteka pod Lipą', 'apteka@podlipa.pl', '+48 22 778 11 09', 'oczekuje', 'f1', 'u4', '2026-06-01 15:48', ['medyczna']],
    ['Bartosz Wieczorek', 'Cloudnest Software', 'bartosz@cloudnest.io', '+48 730 884 552', 'wygrany', 'f2', 'u3', '2026-06-01 09:55', ['enterprise', 'hot']],
    ['Sylwia Wróbel', 'Smaczna Chata', 'kontakt@smacznachata.pl', '+48 604 332 990', 'przegrany', 'f1', 'u2', '2026-05-31 18:20', ['food']],
    ['Marcin Jabłoński', 'ProInstal Hydraulika', 'biuro@proinstal.pl', '+48 661 220 447', 'nowy', 'f3', 'u2', '2026-05-31 13:05', ['partner-lead']],
    ['Beata Dudek', 'Hotel Panorama', 'rezerwacje@hotelpanorama.pl', '+48 18 200 55 40', 'wtoku', 'f4', 'u4', '2026-05-30 16:00', ['hospitality']],
    ['Rafał Sikora', 'Mech-Tech Obróbka', 'r.sikora@mechtech.com.pl', '+48 698 110 224', 'wygrany', 'f2', 'u3', '2026-05-30 10:40', ['b2b']],
    ['Patrycja Baran', 'Słodki Kącik Cukiernia', 'patrycja@slodkikacik.pl', '+48 512 009 778', 'nowy', 'f1', 'u2', '2026-05-29 12:30', []],
    ['Damian Sobczak', 'GreenLine Transport', 'd.sobczak@greenline.pl', '+48 605 778 119', 'oczekuje', 'f2', 'u3', '2026-05-29 09:18', ['logistyka']],
    ['Justyna Walczak', 'Studio Urody Lumière', 'salon@lumiere-studio.pl', '+48 530 220 665', 'zamkniety', 'f1', 'u4', '2026-05-28 17:25', ['beauty']],
  ];

  const leads = rawLeads.map((r, i) => ({
    id: 'l' + (i + 1),
    name: r[0],
    company: r[1],
    email: r[2],
    phone: r[3],
    status: r[4],
    formId: r[5],
    assignedTo: r[6],
    created: r[7],
    tags: r[8],
    // form answers (varied per lead)
    answers: buildAnswers(r),
  }));

  function buildAnswers(r) {
    return [
      { label: 'Imię i nazwisko', value: r[0] },
      { label: 'Firma', value: r[1] },
      { label: 'Email', value: r[2] },
      { label: 'Telefon', value: r[3] },
      { label: 'Budżet', value: ['do 10 tys. zł', '10–50 tys. zł', '50–100 tys. zł', 'powyżej 100 tys. zł'][r[0].length % 4] },
      { label: 'Wiadomość', value: 'Dzień dobry, jesteśmy zainteresowani wdrożeniem automatyzacji procesów sprzedażowych. Proszę o kontakt i przygotowanie wstępnej wyceny.' },
    ];
  }

  // activity feed per lead
  function activityFor(lead) {
    return [
      { type: 'status', user: 'u3', from: 'Nowy', to: 'W toku', time: '2h temu' },
      { type: 'note',   user: 'u2', time: 'wczoraj', note: 'Rozmowa telefoniczna — klient prosi o ofertę do końca tygodnia.' },
      { type: 'assign', user: null, to: 'u3', time: '3 dni temu' },
      { type: 'created', formId: lead.formId, time: '5 dni temu' },
    ];
  }

  // global recent activity (dashboard)
  const recentActivity = [
    { user: 'u2', text: 'dodała notatkę do leada Marek Wiśniewski', time: '12 min temu' },
    { user: 'u3', text: 'zmienił status leada Cloudnest Software na Wygrany', time: '40 min temu' },
    { user: null, text: 'System przypisał lead Robert Mazur do Anna Maj', time: '1h temu' },
    { user: 'u4', text: 'dodała notatkę do leada Hotel Panorama', time: '2h temu' },
    { user: 'u2', text: 'utworzyła nowy lead Natalia Pawłowska', time: '3h temu' },
    { user: 'u3', text: 'zmienił status leada BudMax Konstrukcje na Przegrany', time: '5h temu' },
    { user: 'u4', text: 'przypisała lead Apteka pod Lipą do siebie', time: '6h temu' },
  ];

  // dashboard KPIs
  const kpis = {
    newToday: { value: 7, trend: +3, label: 'Nowe leady dziś' },
    open: { value: 11, label: 'Leady w toku' },
    responseTime: { value: 2.4, label: 'Czas odpowiedzi', unit: 'h' },
    wonMonth: { value: 9, conv: 31, label: 'Wygranych ten miesiąc' },
  };

  // field types for builder
  const fieldTypes = [
    { type: 'text',     label: 'Tekst',         icon: 'type',       desc: 'Krótkie pole tekstowe' },
    { type: 'textarea', label: 'Długi tekst',   icon: 'align-left', desc: 'Wieloliniowe pole' },
    { type: 'email',    label: 'Email',         icon: 'mail',       desc: 'Email z walidacją' },
    { type: 'phone',    label: 'Telefon',       icon: 'phone',      desc: 'Numer telefonu' },
    { type: 'select',   label: 'Lista',         icon: 'chevron-down', desc: 'Dropdown z opcjami' },
    { type: 'radio',    label: 'Wybór jeden',   icon: 'circle-dot', desc: 'Jedna z opcji' },
    { type: 'checkbox', label: 'Wielokrotny',   icon: 'check-square', desc: 'Wiele opcji' },
    { type: 'date',     label: 'Data',          icon: 'calendar',   desc: 'Wybór daty' },
    { type: 'file',     label: 'Plik',          icon: 'paperclip',  desc: 'Upload (max 10MB)' },
    { type: 'section',  label: 'Sekcja',        icon: 'minus',      desc: 'Nagłówek / separator' },
  ];

  // a sample form schema for the builder canvas
  const builderSchema = [
    { id: 'b1', type: 'section',  label: 'Dane kontaktowe', required: false },
    { id: 'b2', type: 'text',     label: 'Imię i nazwisko', placeholder: 'Jan Kowalski', required: true, help: '' },
    { id: 'b3', type: 'email',    label: 'Adres email', placeholder: 'jan@firma.pl', required: true, help: 'Na ten adres wyślemy potwierdzenie' },
    { id: 'b4', type: 'phone',    label: 'Telefon', placeholder: '+48 600 000 000', required: false, help: '' },
    { id: 'b5', type: 'text',     label: 'Firma / Organizacja', placeholder: 'Nazwa firmy', required: false, help: '' },
    { id: 'b6', type: 'section',  label: 'Szczegóły zapytania', required: false },
    { id: 'b7', type: 'select',   label: 'Interesuje mnie', required: true, options: ['Automatyzacja sprzedaży', 'Integracja CRM', 'Wdrożenie MedusaJS', 'Konsultacja'], help: '' },
    { id: 'b8', type: 'select',   label: 'Budżet', required: false, options: ['do 10 tys. zł', '10–50 tys. zł', '50–100 tys. zł', 'powyżej 100 tys. zł'], help: '' },
    { id: 'b9', type: 'textarea', label: 'Wiadomość', placeholder: 'Opisz swoje potrzeby...', required: false, help: '' },
  ];

  // status counts for chart
  function statusCounts() {
    const m = {};
    STATUSES.forEach(s => m[s.key] = 0);
    leads.forEach(l => m[l.status]++);
    return STATUSES.map(s => ({ ...s, count: m[s.key] }));
  }

  window.DB = {
    STATUSES, users, forms, leads, recentActivity, kpis, fieldTypes,
    builderSchema, statusCounts, activityFor,
    statusByKey: k => STATUSES.find(s => s.key === k),
    userById: id => users.find(u => u.id === id) || null,
    formById: id => forms.find(f => f.id === id) || null,
    leadById: id => leads.find(l => l.id === id) || null,
    agents: () => users.filter(u => u.role === 'agent' || u.role === 'admin'),
  };
})();
