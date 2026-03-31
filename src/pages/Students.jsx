import Layout from "../components/layout/Layout"
import { Heading, Text, Stack, Box, Flex, Grid, Card, Badge, Table, Button, Icon, Input, Group, Separator, Spinner } from "@chakra-ui/react"
import { FaSearch, FaFilter, FaUserGraduate, FaEnvelope, FaFileDownload } from "react-icons/fa"
import { useState, useEffect } from "react"
import api from "../api/axios"

const FacultyStudents = ({ user }) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/faculty/${user.faculty_id}/students`)
        setStudents(res.data)
      } catch (err) {
        console.error("Error fetching faculty students:", err)
      } finally {
        setLoading(false)
      }
    }
    if (user.faculty_id) fetchStudents()
  }, [user.faculty_id])

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.usn.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Flex justify="center" align="center" h="400px"><Spinner size="xl" color="blue.500" /></Flex>

  return (
    <Stack gap={8}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">Students Overview</Heading>
          <Text color="gray.500">View and manage students enrolled in your courses.</Text>
        </Box>
        <Button variant="outline" colorPalette="blue" leftIcon={<FaFileDownload />}>Export List</Button>
      </Flex>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Flex gap={4}>
            <Group attached flex="1">
              <Input 
                placeholder="Search by name or USN..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="ghost"><Icon as={FaSearch} /></Button>
            </Group>
            <Button variant="outline" leftIcon={<FaFilter />}>Filter</Button>
          </Flex>
        </Card.Header>
        <Card.Body p={6}>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Student Name</Table.ColumnHeader>
                <Table.ColumnHeader>USN</Table.ColumnHeader>
                <Table.ColumnHeader>Course</Table.ColumnHeader>
                <Table.ColumnHeader>Section</Table.ColumnHeader>
                <Table.ColumnHeader>Attendance</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <Flex align="center" gap={3}>
                      <Box w="32px" h="32px" borderRadius="full" bg="blue.50" color="blue.500" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={FaUserGraduate} fontSize="sm" />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">{s.name}</Text>
                        <Text fontSize="xs" color="gray.500">{s.email}</Text>
                      </Box>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="sm">{s.usn}</Table.Cell>
                  <Table.Cell fontSize="sm">{s.course}</Table.Cell>
                  <Table.Cell fontSize="sm">{s.section}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={parseFloat(s.attendance) > 85 ? "green" : "orange"} variant="subtle">
                      {s.attendance}%
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button size="xs" variant="ghost" colorPalette="blue" title="Email Student">
                      <Icon as={FaEnvelope} />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )) : (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py={10}>
                    <Text color="gray.500">No students found.</Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

const Students = () => {
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
      {(isFaculty || rid === 3) && <FacultyStudents user={user} />}
      {isStudent && <Text>Access Denied. Only Faculty can view student lists.</Text>}
    </Layout>
  )
}

export default Students
