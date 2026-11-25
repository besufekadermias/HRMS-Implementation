import { create } from 'zustand'

export const useEmployeeStore = create((set) => ({
  user: null,
  phase: 'loading',
  sessionError: '',
  securityBusy: false,
  passwordDirty: false,
  notice: '',
  profileBusy: false,
  profileDirty: false,
  attendanceBusy: false,
  leaveBusy: false,
  leaveDirty: false,
  reportBusy: false,
  reportDirty: false,
  employeeBusy: false,
  employeeDirty: false,
  setEmployeeBusy: (employeeBusy) => set({ employeeBusy }),
  setEmployeeDirty: (employeeDirty) => set({ employeeDirty }),
  setReportBusy: (reportBusy) => set({ reportBusy }),
  setReportDirty: (reportDirty) => set({ reportDirty }),
  setLeaveBusy: (leaveBusy) => set({ leaveBusy }),
  setLeaveDirty: (leaveDirty) => set({ leaveDirty }),
  setAttendanceBusy: (attendanceBusy) => set({ attendanceBusy }),
  setProfileBusy: (profileBusy) => set({ profileBusy }),
  setProfileDirty: (profileDirty) => set({ profileDirty }),
  setSecurityBusy: (securityBusy) => set({ securityBusy }),
  setPasswordDirty: (passwordDirty) => set({ passwordDirty }),
  setNotice: (notice) => set({ notice }),
  setUser: (user) =>
    set((state) => ({
      user,
      phase: 'ready',
      sessionError: '',
      notice: user ? state.notice : '',
    })),
  setSessionError: (message) => set({ user: null, phase: 'error', sessionError: message }),
  requirePasswordChange: () =>
    set((state) => ({
      user: state.user ? { ...state.user, mustChangePassword: true } : null,
    })),
}))
