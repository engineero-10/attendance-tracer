import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDownToLine,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  createClass,
  deleteClass,
  enrollInClass,
  exportAttendance,
  getAttendanceHistory,
  getAvailableClasses,
  getDailySummary,
  getMyEnrollments,
  getStoredUser,
  getTeacherClasses,
  login,
  logout,
  markAttendance,
  signup,
  updateAttendance,
  updateClass,
} from "./api.js";
import "./styles.css";
import "./controls.css";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeClass(item) {
  const schedule = item.schedule?.[0];
  return {
    ...item,
    code: item.code,
    name: item.className || item.name,
    description: item.description || "",
    schedule: item.schedule || [],
    scheduleText: schedule
      ? `${schedule.dayOfWeek} · ${schedule.startTime}`
      : "Schedule pending",
    students: item.students || item.enrollmentCount || 0,
    status: item.status || "ACTIVE",
  };
}

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [authView, setAuthView] = useState("login");

  function handleAuthenticated(nextUser) {
    setUser(nextUser);
  }

  if (!user)
    return (
      <AuthPage
        view={authView}
        setView={setAuthView}
        onAuthenticated={handleAuthenticated}
      />
    );
  return (
    <Workspace
      user={user}
      onLogout={() => {
        logout();
        setUser(null);
      }}
    />
  );
}

function AuthPage({ view, setView, onAuthenticated }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    try {
      const nextUser =
        view === "login" ? await login(values) : await signup(values);
      onAuthenticated(nextUser);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-art">
        <div className="brand large">
          <div className="brand-mark">
            <Activity size={22} />
          </div>
          <span>
            attendance
            <br />
            <strong>tracer</strong>
          </span>
        </div>
        <div className="auth-art-copy">
          <div className="eyebrow">CLASSROOM OPERATIONS</div>
          <h1>
            Every class day,
            <br />
            <em>clearly accounted for.</em>
          </h1>
          <p>
            A focused workspace for teachers to run attendance and students to
            stay on top of their learning.
          </p>
        </div>
        <div className="auth-art-footer">
          <span>Secure JWT access</span>
          <span>•</span>
          <span>MongoDB powered</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand brand">
            <div className="brand-mark">
              <Activity size={19} />
            </div>
            <span>
              attendance <strong>tracer</strong>
            </span>
          </div>
          <div className="auth-heading">
            <div className="section-kicker">
              {view === "login" ? "WELCOME BACK" : "GET STARTED"}
            </div>
            <h2>
              {view === "login"
                ? "Sign in to your workspace"
                : "Create your account"}
            </h2>
            <p>
              {view === "login"
                ? "Use your account to continue to your classes."
                : "Choose your role and start tracking attendance."}
            </p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {view === "signup" && (
              <>
                <Field label="Full name" name="name" placeholder="Alex Kim" />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                />
              </>
            )}
            <Field label="Username" name="userName" placeholder="alex.kim" />
            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
            />
            {view === "signup" && (
              <label className="field">
                <span>Workspace role</span>
                <select name="role" defaultValue="STUDENT">
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </label>
            )}
            {error && <div className="form-error">{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : view === "login"
                  ? "Sign in"
                  : "Create account"}
              <ChevronRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {view === "login"
              ? "New to Attendance Tracer?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setError("");
                setView(view === "login" ? "signup" : "login");
              }}
            >
              {view === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, name, type = "text", placeholder, defaultValue }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function Workspace({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const isTeacher = user.role === "TEACHER";
  const items = isTeacher
    ? ["Overview", "Classes", "Attendance", "Reports"]
    : ["Overview", "Discover classes", "My enrollments", "Attendance history"];
  const icons = [LayoutDashboard, BookOpen, ClipboardCheck, FileText];
  return (
    <div className="app-shell">
      <aside className={mobileNav ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark">
            <Activity size={20} />
          </div>
          <span>
            attendance
            <br />
            <strong>tracer</strong>
          </span>
        </div>
        <div className="workspace-label">
          {isTeacher ? "TEACHER WORKSPACE" : "STUDENT WORKSPACE"}
        </div>
        <div className="profile-card">
          <div className="avatar">
            {user.name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2) || "U"}
          </div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.role.toLowerCase()}</span>
          </div>
        </div>
        <nav className="main-nav">
          {items.map((item, index) => {
            const Icon = icons[index];
            return (
              <button
                key={item}
                className={activePage === item ? "nav-item active" : "nav-item"}
                onClick={() => {
                  setActivePage(item);
                  setMobileNav(false);
                }}
              >
                <Icon size={18} />
                <span>{item}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" /> Live API session
          </div>
          <button className="nav-item" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobileNav((current) => !current)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>
          <div className="top-actions">
            <div className="avatar small">
              {user.name
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2) || "U"}
            </div>
          </div>
        </header>
        {isTeacher ? (
          <TeacherPages activePage={activePage} />
        ) : (
          <StudentPages activePage={activePage} />
        )}
      </main>
    </div>
  );
}

function TeacherPages({ activePage }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  async function loadClasses() {
    setPageLoading(true);
    try {
      const result = (await getTeacherClasses()).map(normalizeClass);
      setClasses(result);
      setSelectedClass(
        (current) =>
          result.find((item) => item.code === current?.code) ||
          result[0] ||
          null,
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPageLoading(false);
    }
  }

  async function loadSummary(
    classCode = selectedClass?.code,
    date = attendanceDate,
  ) {
    if (!classCode) return;
    try {
      setSummary(await getDailySummary(classCode, date));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);
  useEffect(() => {
    if (activePage === "Attendance" || activePage === "Overview") loadSummary();
  }, [selectedClass?.code, activePage, attendanceDate]);

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  async function saveClass(formData, code) {
    const payload = {
      className: formData.name,
      description: formData.description,
      code: formData.code.toUpperCase(),
      status: formData.status,
      schedule: [
        {
          dayOfWeek: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
      ],
    };
    try {
      if (code) await updateClass(code, payload);
      else await createClass(payload);
      setModal(null);
      await loadClasses();
      notify(code ? "Class updated" : "Class created");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeClass(code) {
    if (!window.confirm(`Delete ${code}?`)) return;
    try {
      await deleteClass(code);
      await loadClasses();
      notify("Class deleted");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeAttendance(student, values) {
    try {
      const participation =
        values.status === "ABSENT"
          ? 0
          : Math.max(0, Math.min(5, Number(values.participationScore) || 0));
      if (student.status === "NOT_MARKED")
        await markAttendance({
          studentId: student.studentId,
          status: values.status,
          participation,
          classCode: selectedClass.code,
          notes: values.notes,
        });
      else
        await updateAttendance(selectedClass.code, student.studentId, {
          status: values.status,
          participation,
          notes: values.notes,
        });
      await loadSummary(selectedClass.code, attendanceDate);
      notify("Attendance saved");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function downloadReport() {
    try {
      const blob = await exportAttendance(selectedClass.code, attendanceDate);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedClass.code}-attendance-${attendanceDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Report downloaded");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const students = summary?.students || [];
  return (
    <PageFrame
      title={activePage}
      eyebrow="TEACHER CONTROL CENTER"
      error={error}
      notice={notice}
    >
      {activePage === "Overview" && (
        <TeacherOverview
          classes={classes}
          summary={summary}
          onCreate={() => setModal({ type: "create" })}
          onSelect={(item) => {
            setSelectedClass(item);
          }}
          onAttendance={() => {}}
        />
      )}
      {activePage === "Classes" && (
        <ClassesPage
          classes={classes}
          selected={selectedClass}
          onSelect={setSelectedClass}
          onCreate={() => setModal({ type: "create" })}
          onEdit={(item) => setModal({ type: "edit", item })}
          onDelete={removeClass}
          loading={pageLoading}
        />
      )}
      {activePage === "Attendance" && (
        <AttendancePage
          classes={classes}
          selected={selectedClass}
          setSelected={setSelectedClass}
          date={attendanceDate}
          setDate={setAttendanceDate}
          summary={summary}
          students={students}
          onChange={changeAttendance}
          onExport={downloadReport}
          onRefresh={() => loadSummary(selectedClass?.code, attendanceDate)}
        />
      )}
      {activePage === "Reports" && (
        <ReportsPage
          classes={classes}
          selected={selectedClass}
          setSelected={setSelectedClass}
          date={attendanceDate}
          setDate={setAttendanceDate}
          onExport={downloadReport}
          summary={summary}
        />
      )}
      {modal && (
        <ClassModal
          mode={modal.type}
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={saveClass}
        />
      )}
    </PageFrame>
  );
}

function StudentPages({ activePage }) {
  const [available, setAvailable] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyDate, setHistoryDate] = useState("");
  async function load() {
    setLoading(true);
    try {
      const [classes, enrolled, records] = await Promise.all([
        getAvailableClasses(),
        getMyEnrollments(),
        getAttendanceHistory(),
      ]);
      setAvailable(classes.map(normalizeClass));
      setEnrollments(enrolled);
      setHistory(records);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function enroll(code) {
    try {
      await enrollInClass(code);
      await load();
      setNotice("Enrollment completed");
      window.setTimeout(() => setNotice(""), 2600);
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  const visible = available.filter((item) =>
    `${item.name} ${item.code}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredHistory = historyDate
    ? history.filter((item) => item.date?.slice(0, 10) === historyDate)
    : history;
  return (
    <PageFrame
      title={activePage}
      eyebrow="STUDENT LEARNING SPACE"
      error={error}
      notice={notice}
    >
      {activePage === "Overview" && (
        <StudentOverview
          enrollments={enrollments}
          history={history}
          onDiscover={() => {}}
        />
      )}
      {activePage === "Discover classes" && (
        <DiscoverPage
          classes={visible}
          query={query}
          setQuery={setQuery}
          enrollments={enrollments}
          onEnroll={enroll}
          loading={loading}
        />
      )}
      {activePage === "My enrollments" && (
        <EnrollmentPage enrollments={enrollments} />
      )}
      {activePage === "Attendance history" && (
        <HistoryPage
          history={filteredHistory}
          date={historyDate}
          setDate={setHistoryDate}
        />
      )}
    </PageFrame>
  );
}

function PageFrame({ title, eyebrow, error, notice, children }) {
  return (
    <div className="page-content">
      <div className="page-title">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>
            {title}
            <span>.</span>
          </h1>
          <p>Everything you need to keep learning and attendance in sync.</p>
        </div>
      </div>
      {error && <div className="page-error">{error}</div>}
      {notice && (
        <div className="page-notice">
          <Check size={16} /> {notice}
        </div>
      )}
      {children}
    </div>
  );
}
function TeacherOverview({ classes, summary, onCreate, onSelect }) {
  const present = summary?.present || 0;
  const total = summary?.totalStudents || 0;
  return (
    <>
      <section className="metric-grid">
        <Metric
          label="Active classes"
          value={classes.filter((item) => item.status === "ACTIVE").length}
          icon={BookOpen}
        />
        <Metric label="Students today" value={total} icon={Users} />
        <Metric label="Present today" value={present} icon={ClipboardCheck} />
        <Metric
          label="Attendance rate"
          value={total ? `${Math.round((present / total) * 100)}%` : "0%"}
          icon={Activity}
        />
      </section>
      <section className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">YOUR CLASSES</div>
            <h2>Choose a class to manage</h2>
          </div>
          <button className="primary-button" onClick={onCreate}>
            <Plus size={17} /> Create class
          </button>
        </div>
        <ClassGrid classes={classes} onSelect={onSelect} />
      </section>
    </>
  );
}
function ClassesPage({
  classes,
  selected,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  loading,
}) {
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-kicker">CLASS MANAGEMENT</div>
          <h2>All classes</h2>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={17} /> Create class
        </button>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <ClassGrid
          classes={classes}
          selected={selected}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          editable
        />
      )}
    </section>
  );
}
function ClassGrid({
  classes,
  selected,
  onSelect,
  onEdit,
  onDelete,
  editable,
}) {
  if (!classes.length)
    return (
      <Empty
        title="No classes yet"
        text="Create your first class to begin managing attendance."
      />
    );
  return (
    <div className="class-grid">
      {classes.map((item) => (
        <article
          className={
            selected?.code === item.code ? "class-card selected" : "class-card"
          }
          key={item.code}
          onClick={() => onSelect(item)}
        >
          <div className="class-card-top">
            <span className="class-code">{item.code}</span>
            <Status status={item.status} />
          </div>
          <div className="class-card-body">
            <h3>{item.name}</h3>
            <p>{item.description || "No description provided."}</p>
            <div className="class-meta">
              <span>
                <Clock3 size={14} /> {item.scheduleText}
              </span>
              <span>
                <Users size={14} /> {item.students || 0} students
              </span>
            </div>
            {editable && (
              <div className="card-actions">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <FileText size={14} /> Edit
                </button>
                <button
                  className="danger-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(item.code);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
function AttendancePage({
  classes,
  selected,
  setSelected,
  date,
  setDate,
  summary,
  students,
  onChange,
  onExport,
  onRefresh,
}) {
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-kicker">DAILY REGISTER</div>
          <h2>Record attendance</h2>
        </div>
        <div className="header-actions">
          <input
            className="date-input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <select
            value={selected?.code || ""}
            onChange={(event) =>
              setSelected(
                classes.find((item) => item.code === event.target.value),
              )
            }
          >
            {classes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
          <button className="outline-button" onClick={onExport}>
            <ArrowDownToLine size={16} /> Export CSV
          </button>
        </div>
      </div>
      {!selected ? (
        <Empty
          title="Select a class"
          text="Create a class before opening the register."
        />
      ) : (
        <>
          <div className="attendance-banner">
            <div>
              <strong>{selected.name}</strong>
              <span>
                {selected.code} · {formatDate(new Date(`${date}T00:00:00`))}
              </span>
            </div>
            <div className="attendance-numbers">
              <b>
                {summary?.present || 0} <small>present</small>
              </b>
              <b>
                {summary?.absent || 0} <small>absent</small>
              </b>
              <b>
                {summary?.notMarked || 0} <small>pending</small>
              </b>
            </div>
            <button className="icon-button" onClick={onRefresh}>
              ↻
            </button>
          </div>
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>STATUS</th>
                  <th>SCORE</th>
                  <th>NOTES</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <AttendanceRow
                    key={student.studentId}
                    student={student}
                    onSave={onChange}
                  />
                ))}
              </tbody>
            </table>
            {!students.length && (
              <Empty
                title="No enrolled students"
                text="Students will appear here after they enroll in this class."
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
function AttendanceRow({ student, onSave }) {
  const [status, setStatus] = useState(
    student.status === "NOT_MARKED" ? "PRESENT" : student.status,
  );
  const [score, setScore] = useState(student.participationScore || 0);
  const [notes, setNotes] = useState(student.notes || "");
  return (
    <tr>
      <td>
        <div className="student-cell">
          <div className="mini-avatar">
            <UserRound size={14} />
          </div>
          <div>
            <strong>{student.student}</strong>
            <span>@{student.userName}</span>
          </div>
        </div>
      </td>
      <td>
        <select
          className="table-select"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            if (event.target.value === "ABSENT") setScore(0);
          }}
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
        </select>
      </td>
      <td>
        <input
          className="score-input"
          type="number"
          min="0"
          max="5"
          step="1"
          value={status === "ABSENT" ? 0 : score}
          disabled={status === "ABSENT"}
          onChange={(event) =>
            setScore(Math.max(0, Math.min(5, event.target.value)))
          }
        />
      </td>
      <td>
        <input
          className="note-input"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional note"
        />
      </td>
      <td>
        <button
          className="small-action"
          onClick={() =>
            onSave(student, {
              status,
              participationScore: status === "ABSENT" ? 0 : score,
              notes,
            })
          }
        >
          Save
        </button>
      </td>
    </tr>
  );
}
function ReportsPage({
  classes,
  selected,
  setSelected,
  date,
  setDate,
  onExport,
  summary,
}) {
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-kicker">REPORT CENTER</div>
          <h2>Attendance reports</h2>
        </div>
        <button
          className="primary-button"
          disabled={!selected}
          onClick={onExport}
        >
          <ArrowDownToLine size={17} /> Download CSV
        </button>
      </div>
      <div className="report-card">
        <FileText size={25} />
        <div>
          <h3>Daily attendance export</h3>
          <p>Download the current register for analysis or sharing.</p>
        </div>
        <select
          value={selected?.code || ""}
          onChange={(event) =>
            setSelected(
              classes.find((item) => item.code === event.target.value),
            )
          }
        >
          {classes.map((item) => (
            <option key={item.code} value={item.code}>
              {item.code}
            </option>
          ))}
        </select>
        <input
          className="date-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <strong>{summary?.totalStudents || 0} students</strong>
      </div>
    </section>
  );
}
function StudentOverview({ enrollments, history }) {
  return (
    <>
      <section className="metric-grid">
        <Metric label="My classes" value={enrollments.length} icon={BookOpen} />
        <Metric
          label="Attendance records"
          value={history.length}
          icon={ClipboardCheck}
        />
        <Metric
          label="Present"
          value={history.filter((item) => item.status === "PRESENT").length}
          icon={Check}
        />
        <Metric label="Current streak" value="-" icon={Activity} />
      </section>
      <section className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">YOUR PROGRESS</div>
            <h2>Recent attendance</h2>
          </div>
        </div>
        <HistoryPage history={history.slice(0, 5)} />
      </section>
    </>
  );
}
function DiscoverPage({
  classes,
  query,
  setQuery,
  enrollments,
  onEnroll,
  loading,
}) {
  const enrolledCodes = new Set(enrollments.map((item) => item.class));
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-kicker">CLASS DIRECTORY</div>
          <h2>Find your next class</h2>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search classes"
          />
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="directory-grid">
          {classes.map((item) => (
            <article className="directory-card" key={item.code}>
              <div className="directory-icon">
                <BookOpen size={20} />
              </div>
              <Status status={item.status} />
              <h3>{item.name}</h3>
              <span className="class-code">{item.code}</span>
              <p>
                {item.description ||
                  "Build practical knowledge with your class community."}
              </p>
              <div className="class-meta">
                <span>
                  <UserRound size={14} /> {item.teacher?.name || "Instructor"}
                </span>
                <span>
                  <Clock3 size={14} /> {item.scheduleText}
                </span>
              </div>
              <button
                className="full-button"
                disabled={enrolledCodes.has(item.code)}
                onClick={() => onEnroll(item.code)}
              >
                {enrolledCodes.has(item.code) ? "Enrolled" : "Enroll in class"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function EnrollmentPage({ enrollments }) {
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-kicker">MY LEARNING</div>
          <h2>Enrolled classes</h2>
        </div>
      </div>
      {enrollments.length ? (
        <div className="enrollment-list">
          {enrollments.map((item, index) => (
            <div className="enrollment-row" key={item._id || index}>
              <div className="directory-icon">
                <BookOpen size={18} />
              </div>
              <div>
                <strong>{item.class}</strong>
                <span>
                  Enrolled{" "}
                  {item.enrollmentDate
                    ? formatDate(new Date(item.enrollmentDate))
                    : "recently"}
                </span>
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="No enrollments yet"
          text="Visit Discover classes to find a class."
        />
      )}
    </section>
  );
}
function HistoryPage({ history, date, setDate }) {
  return (
    <>
      {setDate && (
        <div className="history-filter">
          <label className="field">
            <span>Filter by date</span>
            <input
              className="date-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <button className="outline-button" onClick={() => setDate("")}>
            All dates
          </button>
        </div>
      )}
      <div className="history-list">
        {history.length ? (
          history.map((item, index) => (
            <div className="history-row" key={item._id || index}>
              <div className="history-date">
                <CalendarDays size={16} />
                <span>{item.date ? formatDate(new Date(item.date)) : "-"}</span>
              </div>
              <strong>{item.class}</strong>
              <Status status={item.status} />
              <span className="score-text">
                {item.participationScore || 0}/5
              </span>
            </div>
          ))
        ) : (
          <Empty
            title="No attendance history"
            text="Your attendance records will appear here."
          />
        )}
      </div>
    </>
  );
}
function ClassModal({ mode, item, onClose, onSave }) {
  const schedule = item?.schedule?.[0] || {};
  function submit(event) {
    event.preventDefault();
    onSave(
      Object.fromEntries(new FormData(event.currentTarget).entries()),
      item?.code,
    );
  }
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <div className="section-kicker">
              {mode === "edit" ? "EDIT CLASS" : "NEW CLASS"}
            </div>
            <h2>{mode === "edit" ? "Update class" : "Create a class"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <Field
          label="Class name"
          name="name"
          placeholder="Full Stack Foundations"
          defaultValue={item?.name}
        />
        <Field
          label="Description"
          name="description"
          placeholder="What students will learn"
          defaultValue={item?.description}
        />
        <div className="form-row">
          <Field
            label="Class code"
            name="code"
            placeholder="WEB-204"
            defaultValue={item?.code}
          />
          <label className="field">
            <span>Day</span>
            <select name="day" defaultValue={schedule.dayOfWeek || "Monday"}>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <Field
            label="Start time"
            name="startTime"
            type="time"
            defaultValue={schedule.startTime}
          />
          <Field
            label="End time"
            name="endTime"
            type="time"
            defaultValue={schedule.endTime}
          />
        </div>
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={item?.status || "ACTIVE"}>
            <option value="ACTIVE">Active - visible to students</option>
            <option value="INACTIVE">Inactive - hidden from students</option>
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            <Check size={16} /> Save class
          </button>
        </div>
      </form>
    </div>
  );
}
function Metric({ label, value, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-label">{label}</span>
    </div>
  );
}
function Status({ status }) {
  return (
    <span className={`status-pill ${String(status).toLowerCase()}`}>
      <i /> {String(status).replace("_", " ")}
    </span>
  );
}
function Loading() {
  return <div className="loading">Loading live data...</div>;
}
function Empty({ title, text }) {
  return (
    <div className="empty">
      <BookOpen size={22} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
