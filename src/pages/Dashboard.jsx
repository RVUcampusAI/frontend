import { Container, Heading, Text, Box, Tabs, SimpleGrid, Card, Button, Flex } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { FaSignOutAlt } from "react-icons/fa"

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Flex justifyContent="space-between" alignItems="center" mb={10}>
        <Box>
          <Heading as="h1" size="2xl" mb={2}>
            Campus ERP System
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Welcome to your dashboard
          </Text>
        </Box>
        <Button onClick={handleLogout} colorPalette="red" variant="outline">
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
        </Button>
      </Flex>

      <Tabs.Root defaultValue="attendance" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="attendance">Attendance</Tabs.Trigger>
          <Tabs.Trigger value="results">Results</Tabs.Trigger>
          <Tabs.Trigger value="curriculum">Course Curriculum</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="attendance" py={6}>
          <Heading size="md" mb={4}>Attendance Tracking</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Card.Root>
              <Card.Header><Heading size="sm">Today's Attendance</Heading></Card.Header>
              <Card.Body><Text>85% Students Present</Text></Card.Body>
            </Card.Root>
            <Card.Root>
              <Card.Header><Heading size="sm">Monthly Average</Heading></Card.Header>
              <Card.Body><Text>92% Attendance Rate</Text></Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        <Tabs.Content value="results" py={6}>
          <Heading size="md" mb={4}>Student Results</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Card.Root>
              <Card.Header><Heading size="sm">Semester 1</Heading></Card.Header>
              <Card.Body><Text>Average GPA: 3.8</Text></Card.Body>
            </Card.Root>
            <Card.Root>
              <Card.Header><Heading size="sm">Toppers List</Heading></Card.Header>
              <Card.Body><Text>View Top 10 Students</Text></Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Tabs.Content>

        <Tabs.Content value="curriculum" py={6}>
          <Heading size="md" mb={4}>Course Curriculum</Heading>
          <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
            <Text fontWeight="bold">Computer Science 101</Text>
            <Text>Status: In Progress (Week 4 of 12)</Text>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  )
}

export default Dashboard
