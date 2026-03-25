import React, { useMemo, useState } from "react";

const initialEntries = [
  {
    id: 1,
    type: "Call Off",
    employee: "Renetha Uhunmwuango",
    site: "BUR",
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
    site: "BUR",
    shiftDate: "2026-03-29",
    shift: "Day",
    hours: 8,
    category: "Vacation",
    status: "Pending",
    submittedBy: "Anthony",
    notes: "Requested PTO for personal appointment.",
    createdAt: "2026-03-24T14:05:00",
  },
];

const emptyForm = {
  type: "Call Off",
  employee: "",
  site: "BUR",
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

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function escapeCsv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
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

function StatCard({ title, value, subtext }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtext}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Open: "bg-red-100 text-red-800",
    Pending: "bg-amber-100 text-amber-800",
    Approved: "bg-emerald-100 text-emerald-800",
    Denied: "bg-slate-200 text-slate-800",
    Filled: "bg-blue-100 text-blue-800",
    Closed: "bg-slate-100 text-slate-700",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status] || styles.Open}`}>{status}</span>;
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
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

function TextAreaInput(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

export default function App() {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
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

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, search, typeFilter, statusFilter]);

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Call Off and Time Off Tracker</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              A simple operations dashboard to log call offs, review time off requests, track coverage gaps, and export records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadCsv(filteredEntries)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Call Offs" value={stats.callOffs} subtext="Logged incidents needing coverage review" />
          <StatCard title="Time Off Requests" value={stats.requests} subtext="All submitted future leave requests" />
          <StatCard title="Open Coverage Gaps" value={stats.openCoverage} subtext="Call offs still open or pending fill" />
          <StatCard title="Pending Requests" value={stats.pendingRequests} subtext="Waiting for leadership approval" />
        </div>

        <div className="rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("tracker")}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${activeTab === "tracker" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${activeTab === "new" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              New Entry
            </button>
          </div>
        </div>

        {activeTab === "tracker" ? (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Field label="Search">
                    <TextInput
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search employee, site, category, submitted by, or notes"
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
              </div>
            </div>

            <div className="grid gap-4">
              {filteredEntries.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                  No matching records found.
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-xl font-semibold text-slate-900">{entry.employee}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {entry.type} • {entry.site} • {entry.shiftDate} • {entry.shift} Shift • {entry.hours} hrs
                        </div>
                      </div>
                      <StatusPill status={entry.status} />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">Category</div>
                        <div className="mt-1 text-sm font-medium text-slate-900">{entry.category}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">Submitted By</div>
                        <div className="mt-1 text-sm font-medium text-slate-900">{entry.submittedBy}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">Created</div>
                        <div className="mt-1 text-sm font-medium text-slate-900">{new Date(entry.createdAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">Status Actions</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateStatus(entry.id, status)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${entry.status === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Notes</div>
                      <div className="mt-1 text-sm leading-6 text-slate-700">{entry.notes || "No notes added."}</div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
                  <TextInput value={form.site} onChange={(event) => updateForm("site", event.target.value)} placeholder="BUR, SMO, SAF, etc." />
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
                    rows={5}
                    value={form.notes}
                    onChange={(event) => updateForm("notes", event.target.value)}
                    placeholder="Coverage notes, follow-up details, reason, or leadership comments"
                  />
                </Field>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
