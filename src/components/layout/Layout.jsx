import { Box, Flex, Icon, Link as ChakraLink, Stack, Text, IconButton, Separator } from "@chakra-ui/react"
import { FaHome, FaCalendarCheck, FaFileAlt, FaBook, FaCalendarAlt, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

const NavItem = ({ icon, label, path, active }) => {
  return (
    <ChakraLink
      asChild
      p={3}
      borderRadius="md"
      bg={active ? "blue.50" : "transparent"}
      color={active ? "blue.600" : "gray.600"}
      _hover={{ bg: "blue.50", color: "blue.600" }}
      transition="all 0.2s"
    >
      <Link to={path}>
        <Flex align="center">
          <Icon as={icon} mr={3} />
          <Text fontWeight={active ? "bold" : "medium"}>{label}</Text>
        </Flex>
      </Link>
    </ChakraLink>
  )
}

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login", { replace: true })
  }

  const getMenuItems = (user) => {
    const baseItems = [
      { icon: FaHome, label: "Overview", path: "/dashboard" },
    ]

    if (!user) return baseItems

    const isFaculty = user.faculty_id !== null && user.faculty_id !== undefined
    const isStudent = user.student_id !== null && user.student_id !== undefined
    const rid = user.role_id ? Number(user.role_id) : null

    if (isStudent) {
      return [
        ...baseItems,
        { icon: FaCalendarCheck, label: "My Attendance", path: "/attendance" },
        { icon: FaFileAlt, label: "My Results", path: "/results" },
        { icon: FaBook, label: "Curriculum", path: "/curriculum" },
        { icon: FaCalendarAlt, label: "Timetable", path: "/timetable" },
      ]
    }

    if (isFaculty) {
      return [
        ...baseItems,
        { icon: FaBook, label: "My Courses", path: "/curriculum" },
        { icon: FaCalendarAlt, label: "Timetable", path: "/timetable" },
        { icon: FaUser, label: "Students", path: "/students" },
        { icon: FaCalendarCheck, label: "Attendance", path: "/attendance" },
        { icon: FaFileAlt, label: "Exams & Marks", path: "/results" },
      ]
    }

    if (rid === 3) {
      return [
        ...baseItems,
        { icon: FaUser, label: "User Management", path: "/users" },
        { icon: FaBook, label: "Manage Curriculum", path: "/curriculum" },
        { icon: FaCalendarCheck, label: "Global Attendance", path: "/attendance" },
        { icon: FaFileAlt, label: "Global Results", path: "/results" },
      ]
    }

    return baseItems
  }

  const menuItems = getMenuItems(user)

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Box
        w={isSidebarOpen ? "260px" : "0px"}
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        display={{ base: "none", md: "block" }}
        transition="all 0.3s"
        overflow="hidden"
        position="sticky"
        top="0"
        h="100vh"
      >
        <Stack p={6} h="full">
          <Flex align="center" mb={10}>
            <Box bg="blue.600" p={2} borderRadius="md" mr={2}>
              <Icon as={FaBook} color="white" />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="blue.700">CampusAI</Text>
          </Flex>

          <Stack gap={2} flex="1">
            {menuItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={location.pathname === item.path}
              />
            ))}
          </Stack>

          <Separator />
          
          <Box mt="auto" pt={4}>
            <Box
              onClick={handleLogout}
              p={3}
              borderRadius="md"
              color="red.600"
              _hover={{ bg: "red.50" }}
              cursor="pointer"
              w="full"
              display="block"
              transition="all 0.2s"
            >
              <Flex align="center">
                <Icon as={FaSignOutAlt} mr={3} />
                <Text fontWeight="medium">Logout</Text>
              </Flex>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box flex="1" overflow="auto">
        {/* Header */}
        <Flex
          bg="white"
          h="70px"
          align="center"
          px={8}
          borderBottom="1px solid"
          borderColor="gray.200"
          justifyContent="space-between"
          position="sticky"
          top="0"
          zIndex="docked"
        >
          <IconButton
            aria-label="Toggle Sidebar"
            variant="ghost"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            display={{ base: "none", md: "flex" }}
          >
            <FaBars />
          </IconButton>

          <Flex align="center">
            <Stack gap={0} textAlign="right" mr={4}>
              <Text fontSize="sm" fontWeight="bold">{user?.username || "Loading..."}</Text>
              <Text fontSize="xs" color="gray.500">
                {user?.email || "User Account"}
              </Text>
            </Stack>
            <Box w="40px" h="40px" borderRadius="full" bg="blue.100" border="2px solid" borderColor="blue.500" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FaUser} color="blue.500" />
            </Box>
          </Flex>
        </Flex>

        {/* Page Body */}
        <Box p={8}>
          {children}
        </Box>
      </Box>
    </Flex>
  )
}

export default Layout
