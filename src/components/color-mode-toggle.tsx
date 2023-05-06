import { Button } from 'flowbite-react'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useEffect, useState } from 'react'

type ColorMode = 'light' | 'dark'

export default function ColorModeToggle() {
  const [mode, setMode] = useState<ColorMode>('light')

  useEffect(() => {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) =>
        onSelectMode(e.matches ? 'dark' : 'light')
      )
    onSelectMode(
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    )

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', () => {})
    }
  }, [])

  function onSelectMode(mode: ColorMode) {
    setMode(mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (mode === 'dark') {
    return (
      <Button
        color="light"
        title="Select light mode"
        onClick={() => onSelectMode('light')}
      >
        <MdLightMode className="h-4 w-4" />
      </Button>
    )
  } else {
    return (
      <Button
        color="light"
        title="Select dark mode"
        onClick={() => onSelectMode('dark')}
      >
        <MdDarkMode className="h-4 w-4" />
      </Button>
    )
  }
}
