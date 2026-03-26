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

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, detail }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </Card>
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

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status] || styles.Open}`}>
      {status}
    </span>
  );
}

function TypePill({ type }) {
  const styles = {
    "Call Off": "bg-blue-50 text-blue-700 ring-blue-200",
    "Time Off Request": "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[type] || styles["Call Off"]}`}>
      {type}
    </span>
  );
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
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

function TextAreaInput(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

export default function App() {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [siteFilter, setSiteFilter] = useState("All");
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
      totalRecords: entries.length,
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
  }

  function updateStatus(id, status) {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-950 px-6 py-6 text-white md:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                      Internal Operations
                    </div>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Call Off and Time Off Tracker</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                      Manage staffing interruptions, PTO requests, coverage status, and follow-up notes in one cleaner workspace.
                    </p>
                  </div>

                  <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => downloadCsv(filteredEntries)}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Export CSV
                    </button>
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Records</div>
                      <div className="mt-1 text-2xl font-semibold text-white">{stats.totalRecords}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4 md:p-6">
                <KpiCard label="Total Call Offs" value={stats.callOffs} detail="Logged absences that affected coverage." />
                <KpiCard label="Time Off Requests" value={stats.requests} detail="Planned future time away from shift coverage." />
                <KpiCard label="Open Coverage Gaps" value={stats.openCoverage} detail="Items still needing staffing action." />
                <KpiCard label="Pending Requests" value={stats.pendingRequests} detail="Requests awaiting approval or review." />
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <SectionHeader
                subtitle="Tracker"
                title="Staffing records"
                action={
                  <div className="text-sm text-slate-500">
                    {filteredEntries.length} showing
                  </div>
                }
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="xl:col-span-2">
                  <Field label="Search">
                    <TextInput
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search employee, notes, category, site, or submitted by"
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

              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
                        <th className="px-4 py-4 font-semibold">Employee</th>
                        <th className="px-4 py-4 font-semibold">Type</th>
                        <th className="px-4 py-4 font-semibold">Site</th>
                        <th className="px-4 py-4 font-semibold">Shift</th>
                        <th className="px-4 py-4 font-semibold">Date</th>
                        <th className="px-4 py-4 font-semibold">Hours</th>
                        <th className="px-4 py-4 font-semibold">Category</th>
                        <th className="px-4 py-4 font-semibold">Status</th>
                        <th className="px-4 py-4 font-semibold">Submitted By</th>
                        <th className="px-4 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-6 py-16 text-center">
                            <div className="text-lg font-semibold text-slate-900">No matching records</div>
                            <div className="mt-2 text-sm text-slate-500">Adjust the filters or add a new entry.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredEntries.map((entry) => (
                          <tr key={entry.id} className="border-b border-slate-200 align-top last:border-b-0 hover:bg-slate-50/60">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-950">{entry.employee}</div>
                              <div className="mt-1 text-xs text-slate-500">{entry.notes || "No notes added."}</div>
                            </td>
                            <td className="px-4 py-4">
                              <TypePill type={entry.type} />
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">{entry.site}</td>
                            <td className="px-4 py-4 text-sm text-slate-700">{entry.shift}</td>
                            <td className="px-4 py-4 text-sm text-slate-700">{formatDate(entry.shiftDate)}</td>
                            <td className="px-4 py-4 text-sm text-slate-700">{entry.hours}</td>
                            <td className="px-4 py-4 text-sm text-slate-700">{entry.category}</td>
                            <td className="px-4 py-4">
                              <StatusPill status={entry.status} />
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              <div>{entry.submittedBy}</div>
                              <div className="mt-1 text-xs text-slate-500">{formatDateTime(entry.createdAt)}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2">
                                <SelectInput
                                  value={entry.status}
                                  onChange={(event) => updateStatus(entry.id, event.target.value)}
                                  className="min-w-[140px]"
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </SelectInput>

                                <button
                                  type="button"
                                  onClick={() => deleteEntry(entry.id)}
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">New Entry</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Log a staffing change</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add a call off or time off request and keep the operational details in one place.
                </p>
              </div>

              <div className="p-5">
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <Field label="Entry Type">
                    <SelectInput value={form.type} onChange={(event) => handleTypeChange(event.target.value)}>
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>

                  <Field label="Employee Name">
                    <TextInput
                      value={form.employee}
                      onChange={(event) => updateForm("employee", event.target.value)}
                      placeholder="Enter employee name"
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Site">
                      <SelectInput value={form.site} onChange={(event) => updateForm("site", event.target.value)}>
                        {siteOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>

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

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Shift Date">
                      <TextInput
                        type="date"
                        value={form.shiftDate}
                        onChange={(event) => updateForm("shiftDate", event.target.value)}
                      />
                    </Field>

                    <Field label="Hours">
                      <TextInput
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={form.hours}
                        onChange={(event) => updateForm("hours", event.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <SelectInput value={form.category} onChange={(event) => updateForm("category", event.target.value)}>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>

                    <Field label="Submitted By">
                      <TextInput
                        value={form.submittedBy}
                        onChange={(event) => updateForm("submittedBy", event.target.value)}
                        placeholder="Your name"
                      />
                    </Field>
                  </div>

                  <Field label="Notes">
                    <TextAreaInput
                      rows={6}
                      value={form.notes}
                      onChange={(event) => updateForm("notes", event.target.value)}
                      placeholder="Add coverage notes, approval context, or follow-up details"
                    />
                  </Field>

                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setForm(emptyForm)}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workflow Notes</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">1. Log the issue</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">Capture the employee, site, shift, date, and reason right away.</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">2. Update status</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">Move the entry through Open, Pending, Filled, Approved, or Closed as it develops.</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">3. Export when needed</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">Use export for leadership visibility, payroll follow-up, or staffing recap.</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}