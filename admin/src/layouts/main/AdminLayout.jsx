import { useEffect, useState } from 'react'
import Header from '../navigation/Header.jsx'
import Sidebar from '../navigation/Sidebar.jsx'
import Modal from '../../components/common/Modal.jsx'

export default function AdminLayout({
  children,
  search,
  onSearch,
  onNavigate,
  announcementCount,
  activePage = 'dashboard',
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    function closeOnDesktop(event) {
      if (event.matches) setDrawerOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    function focusSearch(event) {
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          document.activeElement?.tagName,
        ) &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault()
        document.querySelector('.search-box input')?.focus()
      }
    }
    document.addEventListener('keydown', focusSearch)
    return () => {
      desktop.removeEventListener('change', closeOnDesktop)
      document.removeEventListener('keydown', focusSearch)
    }
  }, [])

  function navigate(action) {
    setDrawerOpen(false)
    onNavigate(action)
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar onNavigate={navigate} activePage={activePage} />
      <div className="workspace">
        <Header
          search={search}
          onSearch={onSearch}
          onMenu={() => setDrawerOpen(true)}
          onNavigate={navigate}
          announcementCount={announcementCount}
          activePage={activePage}
        />
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      {drawerOpen && (
        <Modal
          title="Your workspace"
          onClose={() => setDrawerOpen(false)}
          drawer
        >
          <Sidebar mobile onNavigate={navigate} activePage={activePage} />
        </Modal>
      )}
    </div>
  )
}
