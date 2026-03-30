import { Box, Flex, Grid, GridItem, Heading, Icon, Stack, Text, Card, Progress, Badge, Separator, Button, Link as ChakraLink } from "@chakra-ui/react"
import { FaGraduationCap, FaCalendarCheck, FaClock, FaBookReader, FaChevronRight, FaTrophy } from "react-icons/fa"
import Layout from "../components/layout/Layout"

const Dashboard = () => {
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

  const semesterProgress = 65; // Percentage through current semester

  return (
    <Layout>
      <Stack gap={8}>
        {/* Header Section */}
        <Flex align="center" justify="space-between">
          <Box>
            <Heading size="lg" fontWeight="bold">Student Dashboard</Heading>
            <Text color="gray.500">Welcome back, John! Here's what's happening today.</Text>
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

              <Card.Root boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Card.Header p={6} pb={0}>
                  <Heading size="md">Quick Notifications</Heading>
                </Card.Header>
                <Card.Body p={6}>
                  <Stack gap={4}>
                    {recentActivity.map((activity, idx) => (
                      <Box key={idx}>
                        <Flex align="center">
                          <Box w="8px" h="8px" borderRadius="full" bg={`${activity.color}.500`} mr={3} />
                          <Box flex="1">
                            <Text fontSize="sm" fontWeight="bold">{activity.title}</Text>
                            <Flex justify="space-between">
                              <Text fontSize="xs" color="gray.500">{activity.type}</Text>
                              <Text fontSize="xs" color={`${activity.color}.600`} fontWeight="medium">{activity.status}</Text>
                            </Flex>
                          </Box>
                        </Flex>
                        {idx < recentActivity.length - 1 && <Separator mt={3} />}
                      </Box>
                    ))}
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
    </Layout>
  )
}

export default Dashboard
