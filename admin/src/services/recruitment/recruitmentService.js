import {
  isValidDate,
  todayInNairobi,
} from "../../utils/validation/validators.js";

export const JOB_STATUSES = ["OPEN", "CLOSED"];
// HIRED remains readable for historical records; application review cannot hire.
export const APPLICATION_STATUSES = [
  "PENDING",
  "SHORTLISTED",
  "HIRED",
  "REJECTED",
];

// Local demo records. Replace these with server data when connecting recruitment.
// No credential files were supplied with the reference screenshots.
export const INITIAL_RECRUITMENT = {
  jobs: [
    {
      id: "JOB-005",
      title: "Senior Software Engineer",
      departmentId: 11,
      deadline: "2026-11-05",
      status: "OPEN",
      description:
        "Design, build, and maintain software systems. Support code reviews and mentor developers.",
    },
    {
      id: "JOB-004",
      title: "Full Stack Developer",
      departmentId: 11,
      deadline: "2026-10-28",
      status: "OPEN",
      description:
        "Build accessible web applications and maintain backend services and databases.",
    },
    {
      id: "JOB-003",
      title: "Cybersecurity Officer",
      departmentId: 5,
      deadline: "2026-10-20",
      status: "OPEN",
      description:
        "Implement security policies, vulnerability auditing, and incident response.",
    },
    {
      id: "JOB-002",
      title: "Network Infrastructure Administrator",
      departmentId: 3,
      deadline: "2026-11-21",
      status: "OPEN",
      description:
        "Manage the regional network backbone, data center connections, and server infrastructure.",
    },
    {
      id: "JOB-001",
      title: "Senior Full Stack Software Engineer",
      departmentId: 1,
      deadline: "2026-12-27",
      status: "OPEN",
      description:
        "Develop institutional software using Node.js, React, and MySQL. Collaborate with the IT team to improve public services.",
    },
  ],
  applications: [
    {
      id: "APP-004",
      jobId: "JOB-001",
      fullName: "Tedwodros Kifle",
      nationalId: "234567",
      email: "dawit@example.com",
      phone: "+251900000001",
      appliedDate: "2026-10-24",
      status: "PENDING",
      credentialsUrl: "",
    },
    {
      id: "APP-003",
      jobId: "JOB-003",
      fullName: "Tsedeke Wondimu",
      nationalId: "234567",
      email: "tesfaye.h@example.com",
      phone: "+251900000002",
      appliedDate: "2026-10-24",
      status: "PENDING",
      credentialsUrl: "",
    },
    {
      id: "APP-002",
      jobId: "JOB-001",
      fullName: "Tsedeke Wondimu",
      nationalId: "234567",
      email: "tesfaye.h@example.com",
      phone: "+251900000002",
      appliedDate: "2026-10-24",
      status: "PENDING",
      credentialsUrl: "",
    },
    {
      id: "APP-001",
      jobId: "JOB-002",
      fullName: "Tesfaye Alemayew",
      nationalId: "123456",
      email: "tesfaye.a@example.com",
      phone: "+251900000003",
      appliedDate: "2026-10-22",
      status: "PENDING",
      credentialsUrl: "",
    },
  ],
};

export function validateJob(values, departments, today = todayInNairobi()) {
  const errors = {};
  const title = (values.title || "").trim();
  const description = (values.description || "").trim();
  if (!title || title.length > 100)
    errors.title = "Enter a job title of 1–100 characters.";
  const department = departments.find(
    (item) => String(item.id) === String(values.departmentId),
  );
  if (!department || department.status !== "Active")
    errors.departmentId = "Select an active department.";
  if (
    !isValidDate(values.deadline) ||
    values.deadline < "1900-01-01" ||
    values.deadline > "2100-12-31"
  ) {
    errors.deadline = "Enter a valid application deadline.";
  } else if (values.status === "OPEN" && values.deadline < today) {
    errors.deadline = "An open vacancy needs a deadline of today or later.";
  }
  if (!JOB_STATUSES.includes(values.status))
    errors.status = "Select Open or Closed.";
  if (!description || description.length > 5000)
    errors.description = "Enter a job description of 1–5,000 characters.";
  return errors;
}

export function saveJob(data, departments, values, today = todayInNairobi()) {
  const errors = validateJob(values, departments, today);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const original = data.jobs.find((job) => job.id === values.id);
  if (values.id && !original) throw new Error("This vacancy no longer exists.");
  const department = departments.find(
    (item) => String(item.id) === String(values.departmentId),
  );
  const job = {
    id: original?.id || crypto.randomUUID(),
    title: values.title.trim(),
    departmentId: department.id,
    deadline: values.deadline,
    status: values.status,
    description: values.description.trim(),
  };
  return {
    ...data,
    jobs: original
      ? data.jobs.map((item) => (item.id === job.id ? job : item))
      : [job, ...data.jobs],
  };
}

export function toggleJobStatus(
  data,
  departments,
  id,
  today = todayInNairobi(),
) {
  const job = data.jobs.find((item) => item.id === id);
  if (!job) throw new Error("This vacancy no longer exists.");
  // Closing remains possible even if its deadline passed or department is inactive.
  if (job.status === "OPEN")
    return {
      ...data,
      jobs: data.jobs.map((item) =>
        item.id === id ? { ...item, status: "CLOSED" } : item,
      ),
    };
  return saveJob(data, departments, { ...job, status: "OPEN" }, today);
}

export function decideApplication(data, id, status) {
  const application = data.applications.find((item) => item.id === id);
  if (!application) throw new Error("This application no longer exists.");
  if (!["PENDING", "SHORTLISTED"].includes(application.status))
    throw new Error("This application already has a final decision.");
  if (!["SHORTLISTED", "REJECTED"].includes(status))
    throw new Error("Choose Shortlist for Interview or Reject.");
  if (application.status === "SHORTLISTED" && status === "SHORTLISTED")
    throw new Error("This candidate is already shortlisted for interview.");
  const reviewedAt = new Date().toISOString();
  return {
    ...data,
    applications: data.applications.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            reviewedAt,
            ...(status === "SHORTLISTED" ? { shortlistedAt: reviewedAt } : {}),
          }
        : item,
    ),
  };
}

export function jobRows(data, departments, search = "", status = "") {
  const query = search.trim().toLowerCase();
  return data.jobs
    .map((job) => ({
      ...job,
      department:
        departments.find((item) => item.id === job.departmentId)?.name ||
        "Department unavailable",
      applicantCount: data.applications.filter((item) => item.jobId === job.id)
        .length,
    }))
    .filter(
      (job) =>
        (!status || job.status === status) &&
        [job.title, job.description, job.department].some((value) =>
          value.toLowerCase().includes(query),
        ),
    );
}

export function applicationRows(
  data,
  departments,
  search = "",
  status = "",
  jobId = "",
) {
  const query = search.trim().toLowerCase();
  return data.applications
    .map((application) => {
      const job = data.jobs.find((item) => item.id === application.jobId);
      return {
        ...application,
        jobTitle: job?.title || "Vacancy unavailable",
        department:
          departments.find((item) => item.id === job?.departmentId)?.name ||
          "Department unavailable",
      };
    })
    .filter(
      (item) =>
        (!status || item.status === status) &&
        (!jobId || item.jobId === jobId) &&
        [
          item.fullName,
          item.nationalId,
          item.jobTitle,
          item.department,
          item.email,
          item.phone,
          item.id,
        ].some((value) => (value || "").toLowerCase().includes(query)),
    )
    .sort(
      (a, b) =>
        b.appliedDate.localeCompare(a.appliedDate) || b.id.localeCompare(a.id),
    );
}

// Only open real web document links; never render script or data URLs from records.
export function credentialLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
