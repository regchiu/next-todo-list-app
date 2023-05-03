import { DarkThemeToggle, Navbar } from 'flowbite-react'

export default function AppNavbar() {
  return (
    <Navbar fluid={true} rounded={true}>
      <Navbar.Brand />
      <DarkThemeToggle />
    </Navbar>
  )
}
