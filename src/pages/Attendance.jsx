import Layout from "../components/layout/Layout"
import { Heading, Text, Stack, Box, Flex, Grid, GridItem, Card, Badge, Table, Button, Icon, Progress, Separator } from "@chakra-ui/react"
import { FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaPlus, FaFileDownload } from "react-icons/fa"
import { useState, useEffect } from "react"

const StudentAttendance = ({ user }) => {
  const summary = { total: 45, present: 41, absent: 4, percentage: 91.1 }
  const records = [
    { date: "2026-03-30", subject: "Advanced Algorithms", time: "10:00 AM", status: "Present" },
    { date: "2026-03-29", subject: "Database Management", time: "11:30 AM", status: "Present" },
    { date: "2026-03-28", subject: "Operating Systems", time: "09:00 AM", status: "Absent" },
    { date: "2026-03-27", subject: "Machine Learning", time: "02:00 PM", status: "Present" },
  ]

  return (
    <Stack gap={8}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">My Attendance</Heading>
          <Text color="gray.500">View your attendance record for the current semester.</Text>
        </Box>
        <Button variant="outline" colorPalette="blue" leftIcon={<FaFileDownload />}>Download Report</Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
        <Card.Root border="1px solid" borderColor="gray.100">
          <Card.Body p={5}>
            <Text fontSize="sm" color="gray.500">Overall Attendance</Text>
            <Flex align="center" mt={2}>
              <Heading size="xl" mr={4}>{summary.percentage}%</Heading>
              <Progress.Root value={summary.percentage} colorPalette={summary.percentage > 75 ? "green" : "red"} size="sm" flex="1">
                <Progress.Track bg="gray.100">
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Flex>
          </Card.Body>
        </Card.Root>
        <Card.Root border="1px solid" borderColor="gray.100">
          <Card.Body p={5}>
            <Text fontSize="sm" color="gray.500">Classes Attended</Text>
            <Heading size="xl" mt={2}>{summary.present} / {summary.total}</Heading>
          </Card.Body>
        </Card.Root>
        <Card.Root border="1px solid" borderColor="gray.100">
          <Card.Body p={5}>
            <Text fontSize="sm" color="gray.500">Status</Text>
            <Badge mt={2} size="lg" colorPalette="green" variant="subtle">Good Standing</Badge>
          </Card.Body>
        </Card.Root>
      </Grid>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Flex justify="space-between" align="center">
            <Heading size="md">Recent Sessions</Heading>
            <Button size="sm" variant="ghost" leftIcon={<FaFilter />}>Filter</Button>
          </Flex>
        </Card.Header>
        <Card.Body p={6}>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader>Subject</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {records.map((rec, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>{rec.date}</Table.Cell>
                  <Table.Cell fontWeight="medium">{rec.subject}</Table.Cell>
                  <Table.Cell>{rec.time}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={rec.status === "Present" ? "green" : "red"}>
                      <Icon as={rec.status === "Present" ? FaCheckCircle : FaTimesCircle} mr={1} />
                      {rec.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

const FacultyAttendance = ({ user }) => {
  const classes = [
    { id: 1, name: "Advanced Algorithms", section: "A", students: 60, marked: true },
    { id: 2, name: "Database Management", section: "B", students: 55, marked: false },
  ]

  return (
    <Stack gap={8}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">Mark Attendance</Heading>
          <Text color="gray.500">Record attendance for your class sessions.</Text>
        </Box>
        <Button colorPalette="blue" leftIcon={<FaPlus />}>New Session</Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
        {classes.map((cls) => (
          <Card.Root key={cls.id} border="1px solid" borderColor="gray.100">
            <Card.Body p={6}>
              <Flex justify="space-between" align="top" mb={4}>
                <Box>
                  <Heading size="md">{cls.name}</Heading>
                  <Text color="gray.500" fontSize="sm">Section {cls.section} • {cls.students} Students</Text>
                </Box>
                <Badge colorPalette={cls.marked ? "green" : "orange"}>
                  {cls.marked ? "Updated Today" : "Pending Today"}
                </Badge>
              </Flex>
              <Separator mb={4} />
              <Flex gap={3}>
                <Button flex="1" colorPalette="blue" size="sm">Mark Attendance</Button>
                <Button flex="1" variant="outline" size="sm">View History</Button>
              </Flex>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Heading size="md">Recent Activity</Heading>
        </Card.Header>
        <Card.Body p={6}>
          <Stack gap={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontWeight="bold">Algorithms - Sec A</Text>
                <Text fontSize="xs" color="gray.500">Yesterday, 10:00 AM</Text>
              </Box>
              <Text fontSize="sm">58 Present / 2 Absent</Text>
              <Button size="xs" variant="ghost" colorPalette="blue">Edit</Button>
            </Flex>
            <Separator />
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontWeight="bold">OS Lab - Sec C</Text>
                <Text fontSize="xs" color="gray.500">28 Mar, 02:00 PM</Text>
              </Box>
              <Text fontSize="sm">25 Present / 5 Absent</Text>
              <Button size="xs" variant="ghost" colorPalette="blue">Edit</Button>
            </Flex>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

const Attendance = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return <Layout>Loading...</Layout>

  return (
    <Layout>
      {user.role_id === 1 && <StudentAttendance user={user} />}
      {(user.role_id === 2 || user.role_id === 3) && <FacultyAttendance user={user} />}
    </Layout>
  )
}

export default Attendance
