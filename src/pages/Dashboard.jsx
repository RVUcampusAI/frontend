import { Box, Flex, Grid, GridItem, Heading, Icon, Stack, Text, Card, Progress, Badge, Separator, Button, Link as ChakraLink } from "@chakra-ui/react"
import { FaGraduationCap, FaCalendarCheck, FaClock, FaBookReader, FaChevronRight, FaTrophy, FaChalkboardTeacher, FaUserCheck, FaClipboardList, FaChartLine, FaTasks, FaUniversity, FaBuilding, FaUsersCog, FaShieldAlt, FaDatabase } from "react-icons/fa"
import Layout from "../components/layout/Layout"
import { useState, useEffect } from "react"

const StudentDashboard = ({ user }) => {
  const stats = [
    { label: "Overall GPA", value: "3.82", icon: FaGraduationCap, color: "blue.500", trend: "+0.1" },
    { label: "Attendance", value: "92%", icon: FaCalendarCheck, color: "green.500", trend: "Normal" },
    { label: "Credits Earned", value: "124", icon: FaBookReader, color: "purple.500", trend: "Goal: 160" },
    { label: "Remaining Classes", value: "4", icon: FaClock, color: "orange.500", trend: "Today" },
  ]

  const recentResults = [
    { subject: "Advanced Algorithms", score: "88/100", grade: "A", date: "24 Mar" },
    { subject: "Database Management", score: "92/100", grade: "A+", date: "20 Mar" },
    { subject: "Operating Systems", score: "76/100", grade: "B+", date: "15 Mar" },
  ]

  const upcomingClasses = [
    { subject: "Machine Learning", time: "10:00 AM", room: "L-201", type: "Lecture" },
    { subject: "Web Development Lab", time: "1:30 PM", room: "Lab-4", type: "Practical" },
    { subject: "Cloud Computing", time: "3:30 PM", room: "L-105", type: "Seminar" },
  ]

  const recentActivity = [
    { type: "Assignment", title: "ML Quiz 2", date: "Today, 11:59 PM", status: "Due soon", color: "orange" },
    { type: "System", title: "Attendance Updated", date: "Yesterday", status: "85% Present", color: "blue" },
    { type: "Library", title: "Book Due: OS Internals", date: "Tomorrow", status: "Renew now", color: "red" },
  ]

  const semesterProgress = 65;

  return (
    <Stack gap={8}>
      {/* Header Section */}
      <Flex align="center" justify="space-between">
        <Box>
          <Heading size="lg" fontWeight="bold">Student Dashboard</Heading>
          <Text color="gray.500">Welcome back, {user?.username}! Here's what's happening today.</Text>
        </Box>
        <Box w="300px">
          <Text fontSize="xs" color="gray.500" mb={1} textAlign="right">Semester Progress: {semesterProgress}%</Text>
          <Progress.Root value={semesterProgress} colorPalette="blue" size="sm" borderRadius="full">
            <Progress.Track bg="gray.200">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      </Flex>

      {/* Stats Grid */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
        {stats.map((stat, idx) => (
          <GridItem key={idx}>
            <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Card.Body p={5}>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box p={2} borderRadius="md" bg={`${stat.color.split('.')[0]}.50`}>
                    <Icon as={stat.icon} color={stat.color} fontSize="xl" />
                  </Box>
                  <Badge colorPalette={stat.color.split('.')[0]} variant="subtle">
                    {stat.trend}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{stat.label}</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>{stat.value}</Text>
              </Card.Body>
            </Card.Root>
          </GridItem>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
        {/* Today's Schedule */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Card.Header p={6} pb={0}>
              <Flex align="center" justify="space-between">
                <Heading size="md">Today's Schedule</Heading>
                <ChakraLink color="blue.600" fontSize="sm" fontWeight="bold">View Full Timetable <Icon as={FaChevronRight} ml={1} /></ChakraLink>
              </Flex>
            </Card.Header>
            <Card.Body p={6}>
              <Stack gap={4}>
                {upcomingClasses.map((cls, idx) => (
                  <Box key={idx} p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" _hover={{ bg: "gray.50", cursor: "pointer" }} transition="all 0.2s">
                    <Flex align="center">
                      <Box w="60px" textAlign="center" borderRight="2px solid" borderColor="blue.100" mr={4}>
                        <Text fontWeight="bold" fontSize="sm">{cls.time.split(' ')[0]}</Text>
                        <Text fontSize="xs" color="gray.500">{cls.time.split(' ')[1]}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontWeight="bold">{cls.subject}</Text>
                        <Flex align="center" mt={1}>
                          <Badge size="xs" colorPalette="blue" mr={2}>{cls.type}</Badge>
                          <Text fontSize="xs" color="gray.500">Room: {cls.room}</Text>
                        </Flex>
                      </Box>
                      <Icon as={FaChevronRight} color="gray.300" />
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </GridItem>

        {/* Recent Performance & Results */}
        <GridItem>
          <Stack gap={8}>
            <Card.Root boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Card.Header p={6} pb={0}>
                <Heading size="md">Recent Results</Heading>
              </Card.Header>
              <Card.Body p={6}>
                <Stack gap={5}>
                  {recentResults.map((res, idx) => (
                    <Box key={idx}>
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">{res.subject}</Text>
                          <Text fontSize="xs" color="gray.500">{res.date}</Text>
                        </Box>
                        <Badge colorPalette={res.grade.startsWith('A') ? 'green' : 'blue'} variant="solid" px={3} borderRadius="full">
                          {res.grade}
                        </Badge>
                      </Flex>
                      <Separator mt={4} />
                    </Box>
                  ))}
                  <Button variant="ghost" size="sm" colorPalette="blue" w="full">View Performance Analytics</Button>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="blue.600" color="white" border="none">
              <Card.Body p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FaTrophy} fontSize="2xl" mr={3} color="yellow.400" />
                  <Heading size="sm">Achievement Unlocked!</Heading>
                </Flex>
                <Text fontSize="sm" opacity="0.9">You've maintained over 90% attendance this month. Keep it up!</Text>
              </Card.Body>
            </Card.Root>
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  )
}

const FacultyDashboard = ({ user }) => {
  const stats = [
    { label: "Active Courses", value: "4", icon: FaChalkboardTeacher, color: "blue.500", trend: "2026 Spr" },
    { label: "Student Reach", value: "450", icon: FaUserCheck, color: "green.500", trend: "Total" },
    { label: "Pending Marks", value: "12", icon: FaClipboardList, color: "orange.500", trend: "Due Fri" },
    { label: "Avg Attendance", value: "88%", icon: FaChartLine, color: "purple.500", trend: "+2%" },
  ]

  const teachingSchedule = [
    { subject: "Operating Systems", time: "09:00 AM", room: "Room 102", type: "Lecture", students: 120 },
    { subject: "Database Lab", time: "01:30 PM", room: "Lab 3", type: "Practical", students: 60 },
  ]

  const facultyTasks = [
    { title: "Upload Mid-Sem Results", due: "2 days", status: "High Priority", color: "red" },
    { title: "Approve Attendance Excuses", due: "Tomorrow", status: "Action Required", color: "orange" },
    { title: "Review Curriculum Update", due: "Next week", status: "Pending", color: "blue" },
  ]

  return (
    <Stack gap={8}>
      <Flex align="center" justify="space-between">
        <Box>
          <Heading size="lg" fontWeight="bold">Faculty Dashboard</Heading>
          <Text color="gray.500">Welcome, Professor {user?.username}. Here's your teaching schedule.</Text>
        </Box>
        <Button colorPalette="blue" leftIcon={<FaTasks />}>Create Class Session</Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
        {stats.map((stat, idx) => (
          <GridItem key={idx}>
            <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Card.Body p={5}>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box p={2} borderRadius="md" bg={`${stat.color.split('.')[0]}.50`}>
                    <Icon as={stat.icon} color={stat.color} fontSize="xl" />
                  </Box>
                  <Badge colorPalette={stat.color.split('.')[0]} variant="subtle">
                    {stat.trend}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{stat.label}</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>{stat.value}</Text>
              </Card.Body>
            </Card.Root>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Card.Header p={6} pb={0}>
              <Heading size="md">Today's Teaching Schedule</Heading>
            </Card.Header>
            <Card.Body p={6}>
              <Stack gap={4}>
                {teachingSchedule.map((cls, idx) => (
                  <Box key={idx} p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
                    <Flex align="center">
                      <Box w="60px" textAlign="center" borderRight="2px solid" borderColor="blue.100" mr={4}>
                        <Text fontWeight="bold" fontSize="sm">{cls.time.split(' ')[0]}</Text>
                        <Text fontSize="xs" color="gray.500">{cls.time.split(' ')[1]}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontWeight="bold">{cls.subject}</Text>
                        <Flex align="center" mt={1}>
                          <Badge size="xs" colorPalette="blue" mr={2}>{cls.type}</Badge>
                          <Text fontSize="xs" color="gray.500">{cls.room} • {cls.students} Students</Text>
                        </Flex>
                      </Box>
                      <Button size="sm" variant="subtle" colorPalette="green" ml={4}>Mark Attendance</Button>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </GridItem>

        <GridItem>
          <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Card.Header p={6} pb={0}>
              <Heading size="md">Pending Actions</Heading>
            </Card.Header>
            <Card.Body p={6}>
              <Stack gap={4}>
                {facultyTasks.map((task, idx) => (
                  <Box key={idx}>
                    <Flex align="center">
                      <Box w="8px" h="8px" borderRadius="full" bg={`${task.color}.500`} mr={3} />
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="bold">{task.title}</Text>
                        <Flex justify="space-between">
                          <Text fontSize="xs" color="gray.500">Due {task.due}</Text>
                          <Text fontSize="xs" color={`${task.color}.600`} fontWeight="medium">{task.status}</Text>
                        </Flex>
                      </Box>
                    </Flex>
                    {idx < facultyTasks.length - 1 && <Separator mt={3} />}
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </GridItem>
      </Grid>
    </Stack>
  )
}

const AdminDashboard = ({ user }) => {
  const stats = [
    { label: "Total Students", value: "12,450", icon: FaUsersCog, color: "blue.500", trend: "+240" },
    { label: "Active Campuses", value: "3", icon: FaUniversity, color: "green.500", trend: "Online" },
    { label: "Open Sessions", value: "42", icon: FaShieldAlt, color: "orange.500", trend: "Normal" },
    { label: "System Uptime", value: "99.9%", icon: FaDatabase, color: "purple.500", trend: "Stable" },
  ]

  const entities = [
    { name: "Main Campus", type: "Campus", status: "Active", schools: 5 },
    { name: "City Center", type: "Campus", status: "Active", schools: 3 },
    { name: "School of Engineering", type: "School", status: "Active", programs: 8 },
  ]

  return (
    <Stack gap={8}>
      <Flex align="center" justify="space-between">
        <Box>
          <Heading size="lg" fontWeight="bold">Admin Dashboard</Heading>
          <Text color="gray.500">System Overview and Configuration Control Panel.</Text>
        </Box>
        <Flex gap={3}>
          <Button variant="outline" colorPalette="blue">System Logs</Button>
          <Button colorPalette="blue">New Registration</Button>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
        {stats.map((stat, idx) => (
          <GridItem key={idx}>
            <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Card.Body p={5}>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box p={2} borderRadius="md" bg={`${stat.color.split('.')[0]}.50`}>
                    <Icon as={stat.icon} color={stat.color} fontSize="xl" />
                  </Box>
                  <Badge colorPalette={stat.color.split('.')[0]} variant="subtle">
                    {stat.trend}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{stat.label}</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>{stat.value}</Text>
              </Card.Body>
            </Card.Root>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Card.Header p={6} pb={0}>
              <Heading size="md">Quick Management</Heading>
            </Card.Header>
            <Card.Body p={6}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Button h="100px" variant="outline" colorPalette="blue" flexDir="column">
                  <Icon as={FaUniversity} mb={2} boxSize={6} />
                  Manage Campuses
                </Button>
                <Button h="100px" variant="outline" colorPalette="green" flexDir="column">
                  <Icon as={FaBuilding} mb={2} boxSize={6} />
                  Manage Schools
                </Button>
                <Button h="100px" variant="outline" colorPalette="purple" flexDir="column">
                  <Icon as={FaUsersCog} mb={2} boxSize={6} />
                  Manage Users
                </Button>
                <Button h="100px" variant="outline" colorPalette="orange" flexDir="column">
                  <Icon as={FaDatabase} mb={2} boxSize={6} />
                  System Backups
                </Button>
              </Grid>
            </Card.Body>
          </Card.Root>
        </GridItem>

        <GridItem>
          <Card.Root h="full" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Card.Header p={6} pb={0}>
              <Heading size="md">Entity Status</Heading>
            </Card.Header>
            <Card.Body p={6}>
              <Stack gap={5}>
                {entities.map((entity, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">{entity.name}</Text>
                        <Text fontSize="xs" color="gray.500">{entity.type}</Text>
                      </Box>
                      <Badge colorPalette="green" variant="solid" px={2} borderRadius="full">
                        {entity.status}
                      </Badge>
                    </Flex>
                    <Separator mt={4} />
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </GridItem>
      </Grid>
    </Stack>
  )
}

const Dashboard = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return <Layout>Loading...</Layout>

  const rid = user.role_id ? Number(user.role_id) : null

  return (
    <Layout>
      {rid === 1 && <StudentDashboard user={user} />}
      {rid === 2 && <FacultyDashboard user={user} />}
      {rid === 3 && <AdminDashboard user={user} />}
      {!rid && <Text>No role assigned. Please contact support.</Text>}
      {rid && ![1, 2, 3].includes(rid) && <Text>Unknown role ID: {rid}. Please contact support.</Text>}
    </Layout>
  )
}

export default Dashboard
