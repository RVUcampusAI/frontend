import Layout from "../components/layout/Layout"
import { Heading, Text, Stack, Box, Flex, Grid, GridItem, Card, Badge, Table, Button, Icon, Separator, Progress } from "@chakra-ui/react"
import { FaGraduationCap, FaFileExport, FaLock, FaEdit, FaChartBar, FaSearch } from "react-icons/fa"
import { useState, useEffect } from "react"

const StudentResults = ({ user }) => {
  const semesters = [
    { sem: 1, gpa: 3.75, status: "Published" },
    { sem: 2, gpa: 3.82, status: "Published" },
    { sem: 3, gpa: null, status: "In Progress" },
  ]

  const recentGrades = [
    { code: "CS101", subject: "Advanced Algorithms", internal: 28, external: 60, total: 88, grade: "A" },
    { code: "CS102", subject: "Database Management", internal: 29, external: 63, total: 92, grade: "A+" },
    { code: "CS103", subject: "Operating Systems", internal: 24, external: 52, total: 76, grade: "B+" },
  ]

  return (
    <Stack gap={8}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">My Academic Results</Heading>
          <Text color="gray.500">Track your grades and performance history.</Text>
        </Box>
        <Button variant="outline" colorPalette="blue" leftIcon={<FaFileExport />}>Export Transcript</Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
        {semesters.map((s, idx) => (
          <Card.Root key={idx} border="1px solid" borderColor="gray.100">
            <Card.Body p={5}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Semester {s.sem}</Text>
                <Badge colorPalette={s.status === "Published" ? "green" : "blue"}>{s.status}</Badge>
              </Flex>
              <Heading size="xl" mt={3}>{s.gpa || "N/A"}</Heading>
              <Text fontSize="xs" color="gray.500" mt={1}>Grade Point Average</Text>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Heading size="md">Current Semester Grades (Sem 2)</Heading>
        </Card.Header>
        <Card.Body p={6}>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Code</Table.ColumnHeader>
                <Table.ColumnHeader>Subject</Table.ColumnHeader>
                <Table.ColumnHeader>Internal</Table.ColumnHeader>
                <Table.ColumnHeader>External</Table.ColumnHeader>
                <Table.ColumnHeader>Total</Table.ColumnHeader>
                <Table.ColumnHeader>Grade</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {recentGrades.map((g, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell fontSize="sm">{g.code}</Table.Cell>
                  <Table.Cell fontWeight="medium">{g.subject}</Table.Cell>
                  <Table.Cell>{g.internal}/30</Table.Cell>
                  <Table.Cell>{g.external}/70</Table.Cell>
                  <Table.Cell fontWeight="bold">{g.total}/100</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={g.grade.startsWith('A') ? 'green' : 'blue'} variant="solid">
                      {g.grade}
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

const FacultyResults = ({ user }) => {
  const offerings = [
    { id: 1, name: "Operating Systems", section: "A", students: 120, components: ["Quiz 1", "Assignment 1", "Mid-Sem"] },
    { id: 2, name: "Database Lab", section: "C", students: 60, components: ["Record", "Viva", "Final"] },
  ]

  return (
    <Stack gap={8}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">Result Entry</Heading>
          <Text color="gray.500">Manage and enter marks for your courses.</Text>
        </Box>
        <Button colorPalette="blue" leftIcon={<FaChartBar />}>Performance Analytics</Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
        {offerings.map((off) => (
          <Card.Root key={off.id} border="1px solid" borderColor="gray.100">
            <Card.Body p={6}>
              <Heading size="md" mb={1}>{off.name}</Heading>
              <Text color="gray.500" fontSize="sm" mb={4}>Section {off.section} • {off.students} Students</Text>
              
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Active Components</Text>
              <Flex gap={2} mb={6} flexWrap="wrap">
                {off.components.map((comp, i) => (
                  <Badge key={i} variant="outline" colorPalette="blue">{comp}</Badge>
                ))}
              </Flex>

              <Separator mb={4} />
              <Flex gap={3}>
                <Button flex="1" colorPalette="blue" size="sm" leftIcon={<FaEdit />}>Enter Marks</Button>
                <Button flex="1" variant="outline" size="sm" leftIcon={<FaLock />}>Lock Results</Button>
              </Flex>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Heading size="md">Pending Grade Locking</Heading>
        </Card.Header>
        <Card.Body p={6}>
          <Stack gap={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontWeight="bold">Algorithms - Mid Sem</Text>
                <Text fontSize="xs" color="gray.500">All 60 marks entered</Text>
              </Box>
              <Button size="sm" variant="subtle" colorPalette="orange" leftIcon={<FaLock />}>Lock Now</Button>
            </Flex>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

const Results = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return <Layout>Loading...</Layout>

  const rid = user.role_id ? Number(user.role_id) : null
  const isFaculty = user.faculty_id !== null && user.faculty_id !== undefined
  const isStudent = user.student_id !== null && user.student_id !== undefined

  return (
    <Layout>
      {isStudent && <StudentResults user={user} />}
      {(isFaculty || rid === 3) && <FacultyResults user={user} />}
    </Layout>
  )
}

export default Results
