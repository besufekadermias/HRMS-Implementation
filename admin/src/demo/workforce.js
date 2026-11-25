// Local admin preview data. Account/department rules stay in workforce services.
export const JOB_GRADES = [
  { id: 2, name: 'Grade II (Associate)', salary: 11200 },
  { id: 5, name: 'Grade II', salary: 11200 },
  { id: 3, name: 'Grade III (Senior)', salary: 16500 },
  { id: 6, name: 'Grade III', salary: 16500 },
  { id: 7, name: 'Grade IV', salary: 24000 },
]

export const INITIAL_EMPLOYEES = [
  {
    id: "Epy123",
    name: "Besufekad Ermias",
    email: "babi",
    qualification: "Diploma",
    basicSalary: 11200,
    department: "Database & Cloud Administration",
    grade: "Grade II (Associate)",
    status: "Active",
    hiredDate: "2026-10-30",
  },
  {
    id: "T2323",
    name: "Tedwodros Kifle",
    email: "tedwodros@example.test",
    qualification: "Bcs",
    basicSalary: 11200,
    department: "Cybersecurity & Quality Assurance",
    grade: "Grade II (Associate)",
    status: "Active",
    hiredDate: "2026-10-24",
  },
  {
    id: "5601",
    name: "Tesfaye Alemayew",
    email: "alemayeh150@gmail.com",
    qualification: "BCS",
    basicSalary: 24000,
    department: "Software Engineering",
    grade: "Grade IV",
    status: "Active",
    hiredDate: "2026-10-21",
  },
  {
    id: "2121",
    name: "Tsedeke Wondimu",
    email: "tsedeke@example.test",
    portalRole: "Head of Department",
    qualification: "BCS",
    basicSalary: 24000,
    department: "Cybersecurity & Quality Assurance",
    grade: "Grade IV",
    status: "Active",
    hiredDate: "2026-10-22",
  },
  {
    id: "HD-IT-001",
    name: "Sisay Kebede",
    email: "emp001",
    qualification: "MSc in Computer Science",
    basicSalary: 16500,
    department: "Hadiya Science Information Technology",
    grade: "Grade III (Senior)",
    status: "Active",
    hiredDate: "2022-01-13",
  },
];

// Initial departments based on Department.png.
// One head is assigned for the email/role demo; other heads and descriptions stay empty.
export const INITIAL_DEPARTMENTS = [
  { id: 5, name: "Cybersecurity & Quality Assurance", code: "CQA" },
  { id: 4, name: "Database & Cloud Administration", code: "DCA" },
  { id: 1, name: "Hadiya Science Information Technology", code: "HSIT" },
  { id: 3, name: "Network & Infrastructure", code: "NET" },
  { id: 11, name: "Software Engineering", code: "SWE" },
].map((department) => ({
  ...department,
  description: "",
  headId: department.id === 5 ? "2121" : "",
  status: "Active",
}));
