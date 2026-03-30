import Layout from "../components/layout/Layout"
import { Heading, Text, Stack } from "@chakra-ui/react"

const Attendance = () => (
  <Layout>
    <Stack gap={4}>
      <Heading size="lg">Attendance Tracking</Heading>
      <Text color="gray.500">Detailed attendance reports and summaries.</Text>
    </Stack>
  </Layout>
)

export default Attendance
