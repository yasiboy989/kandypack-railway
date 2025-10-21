import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Branch = 'Kandy' | 'Colombo' | 'Galle' | string

interface WarehouseContextValue {
  branches: Branch[]
  selectedBranch: Branch
  setSelectedBranch: (b: Branch) => void
  isKandy: boolean
}

const WarehouseContext = createContext<WarehouseContextValue | undefined>(undefined)

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const branches: Branch[] = ['Kandy', 'Colombo', 'Galle']
  const [selectedBranch, setSelectedBranchState] = useState<Branch>(() => {
    const saved = localStorage.getItem('warehouse_branch')
    return (saved || 'Kandy') as Branch
  })

  const setSelectedBranch = (b: Branch) => {
    setSelectedBranchState(b)
    localStorage.setItem('warehouse_branch', b)
  }

  useEffect(() => {
    // ensure saved branch exists in list; if not, default
    if (!branches.includes(selectedBranch)) {
      setSelectedBranch('Kandy')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({
      branches,
      selectedBranch,
      setSelectedBranch,
      isKandy: selectedBranch === 'Kandy',
    }),
    [branches, selectedBranch]
  )

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>
}

export function useWarehouse() {
  const ctx = useContext(WarehouseContext)
  if (!ctx) throw new Error('useWarehouse must be used within WarehouseProvider')
  return ctx
}
