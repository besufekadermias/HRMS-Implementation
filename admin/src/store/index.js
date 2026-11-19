import { create } from 'zustand'
import {
  INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, JOB_GRADES,
  INITIAL_ATTENDANCE, INITIAL_ATTENDANCE_HEADS, INITIAL_ATTENDANCE_SETTINGS,
} from '../utils/constants/constants.js'
import { INITIAL_RECRUITMENT } from '../services/recruitment/recruitmentService.js'
import { INITIAL_REWARDS } from '../services/growth/rewardService.js'
import { INITIAL_DISCIPLINE } from '../services/growth/disciplineService.js'
import { INITIAL_CAREER_MILESTONES } from '../services/growth/careerService.js'
import { INITIAL_ANNOUNCEMENTS } from '../services/communications/announcementService.js'
import { INITIAL_DOCUMENTS } from '../services/communications/documentService.js'
import { INITIAL_SERVICES } from '../services/communications/publicServiceService.js'
import { INITIAL_REPORTS } from '../services/communications/reportService.js'
import * as records from '../utils/validation/recordSchemas.js'
import { attendanceSettingsSchema, leaveResponseSchema, payrollResponseSchema } from '../utils/validation/operationsSchemas.js'
import { validateData } from '../utils/validation/schemaHelpers.js'
import { INITIAL_GENERAL_SETTINGS, INITIAL_NOTIFICATION_SETTINGS } from '../utils/constants/settingsConstants.js'
import { generalSettingsSchema, notificationSettingsSchema } from '../utils/validation/settingsSchemas.js'
import { notificationReceiptsSchema } from '../utils/validation/notificationSchemas.js'
import { adminAccountSchema } from '../utils/validation/accountSchemas.js'

function initialData() {
  return structuredClone({
    employees: INITIAL_EMPLOYEES, departments: INITIAL_DEPARTMENTS, grades: JOB_GRADES,
    rewards: INITIAL_REWARDS, recruitment: INITIAL_RECRUITMENT, discipline: INITIAL_DISCIPLINE,
    careerMilestones: INITIAL_CAREER_MILESTONES, announcements: INITIAL_ANNOUNCEMENTS,
    documents: INITIAL_DOCUMENTS, services: INITIAL_SERVICES, reports: INITIAL_REPORTS,
    attendance: INITIAL_ATTENDANCE, attendanceHeads: INITIAL_ATTENDANCE_HEADS,
    attendanceSettings: INITIAL_ATTENDANCE_SETTINGS, departmentChanges: [],
    generalSettings: INITIAL_GENERAL_SETTINGS,
    notificationSettings: INITIAL_NOTIFICATION_SETTINGS,
    notificationReceipts: [],
    adminAccount: null,
    leaveData: null, payrollData: null,
  })
}

function checkedUpdate(schema, update, current, label) {
  const next = typeof update === 'function' ? update(current) : update
  return validateData(schema, next, label)
}

// Shared records live here. Forms, filters, navigation and async locks stay local.
// No persistence: the backend remains responsible for durable records.
export const useAdminStore = create(set => ({
  ...initialData(),
  workspaceClosed: true,
  toast: '',
  setEmployees: update => set(state => ({
    employees: checkedUpdate(records.employeeRecordsSchema, update, state.employees, 'Employees'),
  })),
  setDepartments: update => set(state => ({
    departments: checkedUpdate(records.departmentRecordsSchema, update, state.departments, 'Departments'),
  })),
  setGrades: update => set(state => ({
    grades: checkedUpdate(records.gradeRecordsSchema, update, state.grades, 'Grades'),
  })),
  // Related lists are committed together so subscribers never see half an update.
  setWorkforce: update => set(state => {
    const { employees = state.employees, departments = state.departments, grades = state.grades } = update
    return {
      employees: validateData(records.employeeRecordsSchema, employees, 'Employees'),
      departments: validateData(records.departmentRecordsSchema, departments, 'Departments'),
      grades: validateData(records.gradeRecordsSchema, grades, 'Grades'),
    }
  }),
  setRewards: update => set(state => ({
    rewards: checkedUpdate(records.rewardRecordsSchema, update, state.rewards, 'Rewards'),
  })),
  setRecruitment: update => set(state => ({
    recruitment: checkedUpdate(records.recruitmentRecordsSchema, update, state.recruitment, 'Recruitment'),
  })),
  setDiscipline: update => set(state => ({
    discipline: checkedUpdate(records.disciplineRecordsSchema, update, state.discipline, 'Discipline'),
  })),
  setCareerMilestones: update => set(state => ({
    careerMilestones: checkedUpdate(records.careerRecordsSchema, update, state.careerMilestones, 'Career'),
  })),
  setCareerState: ({ employees, milestones }) => set({
    employees: validateData(records.employeeRecordsSchema, employees, 'Employees'),
    careerMilestones: validateData(records.careerRecordsSchema, milestones, 'Career'),
  }),
  setAnnouncements: update => set(state => ({
    announcements: checkedUpdate(records.announcementRecordsSchema, update, state.announcements, 'Announcements'),
  })),
  setDocuments: update => set(state => ({
    documents: checkedUpdate(records.documentRecordsSchema, update, state.documents, 'Documents'),
  })),
  setServices: update => set(state => ({
    services: checkedUpdate(records.serviceRecordsSchema, update, state.services, 'Services'),
  })),
  setReports: update => set(state => ({
    reports: checkedUpdate(records.reportRecordsSchema, update, state.reports, 'Reports'),
  })),
  setAttendance: update => set(state => ({
    attendance: checkedUpdate(records.attendanceRecordsSchema, update, state.attendance, 'Attendance'),
  })),
  setAttendanceHeads: update => set(state => ({
    attendanceHeads: checkedUpdate(records.attendanceHeadsSchema, update, state.attendanceHeads, 'Department heads'),
  })),
  setAttendanceSettings: update => set(state => ({
    attendanceSettings: checkedUpdate(attendanceSettingsSchema, update, state.attendanceSettings, 'Attendance settings'),
  })),
  setGeneralSettings: update => set(state => ({
    generalSettings: checkedUpdate(generalSettingsSchema, update, state.generalSettings, 'General settings'),
  })),
  setNotificationSettings: update => set(state => ({
    notificationSettings: checkedUpdate(notificationSettingsSchema, update, state.notificationSettings, 'Notification settings'),
  })),
  setNotificationReceipts: update => set(state => ({
    notificationReceipts: checkedUpdate(notificationReceiptsSchema, update, state.notificationReceipts, 'Notification receipts'),
  })),
  setDepartmentChanges: update => set(state => ({
    departmentChanges: checkedUpdate(records.departmentChangesSchema, update, state.departmentChanges, 'Department history'),
  })),
  setLeaveData: update => set(state => ({
    leaveData: checkedUpdate(leaveResponseSchema.nullable(), update, state.leaveData, 'Leave data'),
  })),
  setPayrollData: update => set(state => ({
    payrollData: checkedUpdate(payrollResponseSchema.nullable(), update, state.payrollData, 'Payroll data'),
  })),
  setWorkspaceClosed: workspaceClosed => set({ workspaceClosed }),
  setAdminAccount: update => set(state => {
    const next = typeof update === 'function' ? update(state.adminAccount) : update
    // Store only public account fields, even if a response includes extra data.
    return { adminAccount: adminAccountSchema.parse(next) }
  }),
  setToast: toast => set({ toast }),
  reset: () => set({ ...initialData(), workspaceClosed: true, toast: '' }),
}))
