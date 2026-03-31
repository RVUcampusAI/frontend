import Layout from "../components/layout/Layout"
import { Heading, Text, Stack, Box, Flex, Grid, Card, Badge, Table, Icon, Spinner } from "@chakra-ui/react"
import { FaClock, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa"
import { useState, useEffect } from "react"
import api from "../api/axios"

const FacultyTimetable = ({ user }) => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get(`/faculty/${user.faculty_id}/timetable`)
        setSchedule(res.data)
      } catch (err) {
        console.error("Error fetching faculty timetable:", err)
      } finally {
        setLoading(false)
      }
    }
    if (user.faculty_id) fetchTimetable()
  }, [user.faculty_id])

  const timeSlots = ["09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const dayMap = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" }

  const getSlot = (dayName, timeStr) => {
    return schedule.find(s => dayMap[s.day_of_week] === dayName && s.start_time === timeStr)
  }

  if (loading) return <Flex justify="center" align="center" h="400px"><Spinner size="xl" color="blue.500" /></Flex>

  return (
    <Stack gap={8}>
      <Box>
        <Heading size="lg">My Schedule</Heading>
        <Text color="gray.500">Weekly teaching timetable and room assignments.</Text>
      </Box>

      <Card.Root border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root variant="line">
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader w="120px">Time</Table.ColumnHeader>
                {days.map(day => (
                  <Table.ColumnHeader key={day}>{day}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {timeSlots.map(time => (
                <Table.Row key={time}>
                  <Table.Cell fontWeight="bold" fontSize="xs" color="gray.500">
                    {time.split(':')[0]}:{time.split(':')[1]} {parseInt(time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                  </Table.Cell>
                  {days.map(day => {
                    const slot = getSlot(day, time)
                    return (
                      <Table.Cell key={`${day}-${time}`} p={2} h="120px" verticalAlign="top">
                        {slot ? (
                          <Box p={3} borderRadius="lg" bg="blue.50" borderLeft="4px solid" borderColor="blue.500" h="full">
                            <Text fontWeight="bold" fontSize="sm" mb={1}>{slot.course}</Text>
                            <Flex align="center" gap={2} mb={1}>
                              <Icon as={FaMapMarkerAlt} fontSize="xs" color="blue.600" />
                              <Text fontSize="xs" color="blue.700">{slot.room || 'TBA'}</Text>
                            </Flex>
                            <Badge size="xs" colorPalette="blue" variant="subtle">{slot.type || 'Lecture'}</Badge>
                          </Box>
                        ) : (
                          <Box h="full" border="1px dashed" borderColor="gray.100" borderRadius="md" />
                        )}
                      </Table.Cell>
                    )
                  })}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Stack>
  )
}

const StudentTimetable = ({ user }) => {
  return (
    <Stack gap={8}>
      <Box>
        <Heading size="lg">Class Timetable</Heading>
        <Text color="gray.500">Your weekly schedule for the current semester.</Text>
      </Box>
      <Card.Root p={10} textAlign="center">
        <Icon as={FaCalendarAlt} fontSize="4xl" color="gray.300" mb={4} mx="auto" />
        <Text color="gray.500">Student timetable view is coming soon.</Text>
      </Card.Root>
    </Stack>
  )
}

const Timetable = () => {
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
      {isStudent && <StudentTimetable user={user} />}
      {isFaculty && !isStudent && <FacultyTimetable user={user} />}
      {!isStudent && !isFaculty && rid === 3 && <FacultyTimetable user={user} />}
    </Layout>
  )
}

export default Timetable
