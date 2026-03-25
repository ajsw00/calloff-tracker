import React, { useMemo, useState } from "react";

const initialEntries = [
  {
    id: 1,
    type: "Call Off",
    employee: "Renetha Uhunmwuango",
    site: "Burlingame",
    shiftDate: "2026-03-25",
    shift: "Grave",
    hours: 8,
    category: "Sick",
    status: "Open",
    submittedBy: "Anthony",
    notes: "Called off before shift start. Coverage needed.",
    createdAt: "2026-03-25T06:20:00",
  },
  {
    id: 2,
    type: "Time Off Request",
    employee: "Julie Burns",
    site: "Burlingame",
    shiftDate: "2026-03-29",
    shift: "Day",
    hours: 8,
    category: "Vacation",
    status: "Pending",
    submittedBy: "Anthony",
    notes: "Requested PTO for personal appointment.",
    createdAt: "2026-03-24T14:05:00",
  },
  {
    id: 3,
    type: "Call Off",
    employee: "Carlos Vazquez",
    site: "San Mateo",
    shiftDate: "2026-03-26",
    shift: "Swing",
    hours: 8,
    category: "Personal",
    status: "Filled",
    submittedBy: "Anthony",
    notes: "Coverage secured with extra officer.",
    createdAt: "2026-03-25T08:10:00",
  },
];

const emptyForm = {
  type: "Call Off",
  employee: "",
  site: "Burlingame",
  shiftDate: "",
  shift: "Day",
  hours: 8,
  category: "Sick",
  status: "Open",
  submittedBy: "",
  notes: "",
};

const typeOptions = ["Call Off", "Time Off Request"];
const statusOptions = ["Open", "Pending", "Approved", "Denied", "Filled", "Closed"];
const shiftOptions = ["Day", "Swing", "Grave"];
const categoryOptions = ["Sick", "Vacation", "Personal", "Late Call Off", "FMLA", "Bereavement", "Other"];
const siteOptions = ["Burlingame", "San Mateo", "San Francisco", "Sausalito"];

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function escapeCsv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
}

function downloadCsv(entries) {
  const headers = [
    "Type",
    "Employee",
    "Site",
    "Shift Date",
    "Shift",
    "Hours",
    "Category",
    "Status",
    "Submitted By",
    "Notes",
    "Created At",
  ];

  const rows = entries.map((entry) => [
    entry.type,
    entry.employee,
    entry.site,
    entry.shiftDate,
    entry.shift,
    entry.hours,
    entry.category,
    entry.status,
    entry.submittedBy,
    entry.notes,
    entry.createdAt,
  ]);

  const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "call_off_time_off_tracker.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ShellCard({ children, className = "" }) {
  return <div className={`rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${className}`}>{children}</div>;
}

function StatCard({ title, value, subtext }) {
  return (
    <ShellCard className="p-5">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{subtext}</div>
    </ShellCard>
  );
}

function StatusPill({ status }) {
  const styles = {
    Open: "bg-rose-50 text-rose-700 ring-rose-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Denied: "bg-slate-100 text-slate-700 ring-slate-200",
    Filled: "bg-sky-50 text-sky-700 ring-sky-200",
    Closed: "bg-slate-50 text-slate-600 ring-slate-200",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status] || styles.Open}`}>{status}</span>;
}

function TypePill({ type }) {
  const styles = {
    "Call Off": "bg-blue-50 text-blue-700 ring-blue-200",
    "Time Off Request": "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[type] || styles["Call Off"]}`}>{type}</span>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${props.className || ""}`}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${props.className || ""}`}
    />
  );
}

function TextAreaInput(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${props.className || ""}`}
    />
  );
}

function SectionTitle({ eyebrow, title, body }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function MetaGlyph() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15 backdrop-blur-sm">
      <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 39C14 25 20 17 26 17C33 17 38 35 42 42C45 47 48 49 51 49C55 49 56 45 56 41C56 32 50 19 42 19C35 19 30 31 26 39C22 47 19 49 15 49C11 49 8 46 8 41C8 35 10 29 14 24C18 19 23 16 28 16C37 16 42 25 46 33C49 39 51 43 53 43C55 43 56 40 56 36C56 28 51 16 42 16C33 16 28 28 24 36C20 45 16 52 9 52C4 52 1 48 1 41C1 34 4 27 9 21C14 15 21 12 29 12C41 12 48 23 53 34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
      </svg>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [siteFilter, setSiteFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("tracker");
  const [form, setForm] = useState(emptyForm);

  const filteredEntries = useMemo(() => {
    const term = normalize(search);

    return entries.filter((entry) => {
      const matchesSearch =
        !term ||
        normalize(entry.employee).includes(term) ||
        normalize(entry.site).includes(term) ||
        normalize(entry.category).includes(term) ||
        normalize(entry.notes).includes(term) ||
        normalize(entry.submittedBy).includes(term);

      const matchesType = typeFilter === "All" || entry.type === typeFilter;
      const matchesStatus = statusFilter === "All" || entry.status === statusFilter;
      const matchesSite = siteFilter === "All" || entry.site === siteFilter;

      return matchesSearch && matchesType && matchesStatus && matchesSite;
    });
  }, [entries, search, typeFilter, statusFilter, siteFilter]);

  const stats = useMemo(() => {
    return {
      callOffs: entries.filter((entry) => entry.type === "Call Off").length,
      requests: entries.filter((entry) => entry.type === "Time Off Request").length,
      openCoverage: entries.filter((entry) => entry.type === "Call Off" && ["Open", "Pending"].includes(entry.status)).length,
      pendingRequests: entries.filter((entry) => entry.type === "Time Off Request" && entry.status === "Pending").length,
    };
  }, [entries]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(value) {
    setForm((prev) => ({
      ...prev,
      type: value,
      status: value === "Call Off" ? "Open" : "Pending",
      category: value === "Call Off" ? "Sick" : "Vacation",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const employee = form.employee.trim();
    const site = form.site.trim();
    const shiftDate = form.shiftDate.trim();
    const submittedBy = form.submittedBy.trim();
    const notes = form.notes.trim();
    const hours = Number(form.hours);

    if (!employee || !site || !shiftDate || !submittedBy || !Number.isFinite(hours) || hours <= 0) {
      return;
    }

    const newEntry = {
      id: Date.now(),
      type: form.type,
      employee,
      site,
      shiftDate,
      shift: form.shift,
      hours,
      category: form.category,
      status: form.status,
      submittedBy,
      notes,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setForm({
      ...emptyForm,
      type: form.type,
      site,
      submittedBy,
      category: form.type === "Call Off" ? "Sick" : "Vacation",
      status: form.type === "Call Off" ? "Open" : "Pending",
    });
    setActiveTab("tracker");
  }

  function updateStatus(id, status) {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#0a2540] via-[#0f3b68] to-[#0b66ff] text-white shadow-[0_30px_80px_rgba(11,102,255,0.18)]">
          <div className="grid gap-8 p-6 md:grid-cols-[1.6fr_0.9fr] md:p-10">
            <div>
              <div className="flex items-center gap-3">
                <MetaGlyph />
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-100">
                  Internal Operations Tool
                </div>
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">Call Off and Time Off Tracker</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/90 md:text-base">
                Centralize staffing interruptions, pending approvals, and follow-up visibility in a cleaner internal workspace built for day-to-day operations management.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("new")}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0b66ff] transition hover:bg-blue-50"
                >
                  Add New Entry
                </button>
                <button
                  type="button"
                  onClick={() => downloadCsv(filteredEntries)}
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-sm font-medium text-blue-50">Operations Snapshot</div>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span className="text-sm text-blue-50/90">Open coverage gaps</span>
                  <span className="text-2xl font-semibold">{stats.openCoverage}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span className="text-sm text-blue-50/90">Pending time off</span>
                  <span className="text-2xl font-semibold">{stats.pendingRequests}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span className="text-sm text-blue-50/90">Total records</span>
                  <span className="text-2xl font-semibold">{entries.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Call Offs" value={stats.callOffs} subtext="Logged absences requiring staffing review" />
          <StatCard title="Time Off Requests" value={stats.requests} subtext="Future requests submitted for approval" />
          <StatCard title="Open Coverage Gaps" value={stats.openCoverage} subtext="Call offs still needing coverage action" />
          <StatCard title="Pending Requests" value={stats.pendingRequests} subtext="Items still waiting for approval" />
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SectionTitle
            eyebrow="Workspace"
            title={activeTab === "tracker" ? "Staffing records" : "Create a new record"}
            body={
              activeTab === "tracker"
                ? "Review current call offs and time off requests with cleaner filters, clearer status handling, and a more polished internal layout."
                : "Capture a new call off or time off request with the details needed for approvals, coverage, and partner follow-up."
            }
          />

          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("tracker")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === "tracker" ? "bg-[#0b66ff] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === "new" ? "bg-[#0b66ff] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
            >
              New Entry
            </button>
          </div>
        </div>

        {activeTab === "tracker" ? (
          <div className="mt-6 space-y-6">
            <ShellCard className="p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="xl:col-span-2">
                  <Field label="Search records">
                    <TextInput
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search employee, site, category, notes, or submitted by"
                    />
                  </Field>
                </div>
                <div>
                  <Field label="Type">
                    <SelectInput value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                      <option value="All">All</option>
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <div>
                  <Field label="Status">
                    <SelectInput value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="All">All</option>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <div>
                  <Field label="Site">
                    <SelectInput value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}>
                      <option value="All">All</option>
                      {siteOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
              </div>
            </ShellCard>

            <div className="grid gap-5">
              {filteredEntries.length === 0 ? (
                <ShellCard className="p-12 text-center">
                  <div className="text-lg font-semibold text-slate-900">No matching records found</div>
                  <div className="mt-2 text-sm text-slate-500">Try adjusting the filters or add a new record.</div>
                </ShellCard>
              ) : (
                filteredEntries.map((entry) => (
                  <ShellCard key={entry.id} className="p-5 md:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypePill type={entry.type} />
                          <StatusPill status={entry.status} />
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{entry.employee}</h3>
                          <span className="text-sm font-medium text-slate-500">{entry.site}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {formatDate(entry.shiftDate)} • {entry.shift} Shift • {entry.hours} hrs • {entry.category}
                        </div>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{entry.notes || "No notes added."}</p>
                      </div>

                      <div className="grid min-w-[260px] gap-3 rounded-[24px] bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-1">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Submitted by</div>
                          <div className="mt-1 text-sm font-medium text-slate-900">{entry.submittedBy}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Created</div>
                          <div className="mt-1 text-sm font-medium text-slate-900">{formatDateTime(entry.createdAt)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateStatus(entry.id, status)}
                            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${entry.status === status ? "bg-[#0b66ff] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Delete Record
                      </button>
                    </div>
                  </ShellCard>
                ))
              )}
            </div>
          </div>
        ) : (
          <ShellCard className="mt-6 overflow-hidden">
            <div className="grid lg:grid-cols-[0.95fr_1.45fr]">
              <div className="border-b border-slate-200 bg-gradient-to-br from-[#0a2540] via-[#0f3b68] to-[#0b66ff] p-6 text-white lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-3">
                  <MetaGlyph />
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Entry Intake</div>
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">Create a clean record</h3>
                <p className="mt-3 text-sm leading-7 text-blue-50/90">
                  Log the request, capture the details that matter, and update the status as approvals or coverage decisions move forward.
                </p>
                <div className="mt-8 rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-sm font-medium text-blue-50">Recommended workflow</div>
                  <div className="mt-2 text-sm leading-7 text-blue-50/90">
                    Submit the record, document any useful context, then return to the tracker to update approval or coverage status as the situation develops.
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Field label="Entry Type">
                      <SelectInput value={form.type} onChange={(event) => handleTypeChange(event.target.value)}>
                        {typeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>

                  <div>
                    <Field label="Employee Name">
                      <TextInput value={form.employee} onChange={(event) => updateForm("employee", event.target.value)} placeholder="Enter employee name" />
                    </Field>
                  </div>

                  <div>
                    <Field label="Site">
                      <SelectInput value={form.site} onChange={(event) => updateForm("site", event.target.value)}>
                        {siteOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>

                  <div>
                    <Field label="Shift Date">
                      <TextInput type="date" value={form.shiftDate} onChange={(event) => updateForm("shiftDate", event.target.value)} />
                    </Field>
                  </div>

                  <div>
                    <Field label="Shift">
                      <SelectInput value={form.shift} onChange={(event) => updateForm("shift", event.target.value)}>
                        {shiftOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>

                  <div>
                    <Field label="Hours">
                      <TextInput type="number" min="0.5" step="0.5" value={form.hours} onChange={(event) => updateForm("hours", event.target.value)} />
                    </Field>
                  </div>

                  <div>
                    <Field label="Category">
                      <SelectInput value={form.category} onChange={(event) => updateForm("category", event.target.value)}>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>

                  <div>
                    <Field label="Submitted By">
                      <TextInput value={form.submittedBy} onChange={(event) => updateForm("submittedBy", event.target.value)} placeholder="Your name" />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Notes">
                      <TextAreaInput
                        rows={6}
                        value={form.notes}
                        onChange={(event) => updateForm("notes", event.target.value)}
                        placeholder="Add coverage notes, reason, approval details, or follow-up context"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2 flex flex-wrap justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForm(emptyForm)}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-[#0b66ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0057e6]"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ShellCard>
        )}
      </div>
    </div>
  );
}
