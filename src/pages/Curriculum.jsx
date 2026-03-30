import Layout from "../components/layout/Layout"
import { Heading, Text, Stack, Box, Flex, Grid, Card, Badge, Table, Button, Icon, Separator } from "@chakra-ui/react"
import { FaBook, FaPlus, FaEdit, FaTrash, FaSearch, FaLayerGroup } from "react-icons/fa"
import { useState, useEffect } from "react"

const StudentCurriculum = ({ user }) => {
  const currentCourses = [
    { code: "CS301", name: "Advanced Algorithms", credits: "3-1-0", type: "Core" },
    { code: "CS302", name: "Database Management", credits: "3-0-2", type: "Core" },
    { code: "CS305", name: "Machine Learning", credits: "3-0-0", type: "Elective" },
  ]

  return (
    <Stack gap={8}>
      <Box>
        <Heading size="lg">My Curriculum</Heading>
        <Text color="gray.500">View your current courses and program structure.</Text>
      </Box>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Heading size="md">Enrolled Courses - Semester 6</Heading>
        </Card.Header>
        <Card.Body p={6}>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Code</Table.ColumnHeader>
                <Table.ColumnHeader>Course Name</Table.ColumnHeader>
                <Table.ColumnHeader>Credits (L-T-P)</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {currentCourses.map((course, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell fontWeight="bold">{course.code}</Table.Cell>
                  <Table.Cell>{course.name}</Table.Cell>
                  <Table.Cell>{course.credits}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={course.type === "Core" ? "blue" : "purple"}>{course.type}</Badge>
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

const AdminCurriculum = ({ user }) => {
  const programs = [
    { name: "Computer Science & Engineering", code: "CSE", schools: "SOE", status: "Active" },
    { name: "Electronics & Communication", code: "ECE", schools: "SOE", status: "Active" },
    { name: "Information Technology", code: "IT", schools: "SOE", status: "Active" },
  ]

  return (
    <Stack gap={8}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">Curriculum Management</Heading>
          <Text color="gray.500">Configure programs, schools, and course offerings.</Text>
        </Box>
        <Button colorPalette="blue" leftIcon={<FaPlus />}>Add New Program</Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
        <Button h="120px" variant="outline" colorPalette="blue" flexDir="column">
          <Icon as={FaLayerGroup} mb={2} boxSize={6} />
          Manage Schools
        </Button>
        <Button h="120px" variant="outline" colorPalette="green" flexDir="column">
          <Icon as={FaBook} mb={2} boxSize={6} />
          Course Catalog
        </Button>
        <Button h="120px" variant="outline" colorPalette="purple" flexDir="column">
          <Icon as={FaPlus} mb={2} boxSize={6} />
          Course Offerings
        </Button>
      </Grid>

      <Card.Root border="1px solid" borderColor="gray.100">
        <Card.Header p={6} pb={0}>
          <Heading size="md">Active Programs</Heading>
        </Card.Header>
        <Card.Body p={6}>
          <Table.Root variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Program Name</Table.ColumnHeader>
                <Table.ColumnHeader>Code</Table.ColumnHeader>
                <Table.ColumnHeader>School</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {programs.map((p, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell fontWeight="bold">{p.name}</Table.Cell>
                  <Table.Cell>{p.code}</Table.Cell>
                  <Table.Cell>{p.schools}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette="green">{p.status}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button size="xs" variant="ghost" colorPalette="blue" mr={2}><FaEdit /></Button>
                    <Button size="xs" variant="ghost" colorPalette="red"><FaTrash /></Button>
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

const Curriculum = () => {
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
      {user.role_id === 1 && <StudentCurriculum user={user} />}
      {user.role_id === 2 && <StudentCurriculum user={user} />} {/* Faculty view similar to student for now */}
      {user.role_id === 3 && <AdminCurriculum user={user} />}
    </Layout>
  )
}

export default Curriculum
