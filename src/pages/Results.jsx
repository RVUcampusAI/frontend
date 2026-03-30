import Layout from "../components/layout/Layout"
import { Heading, Text, Stack } from "@chakra-ui/react"

const Results = () => (
  <Layout>
    <Stack gap={4}>
      <Heading size="lg">Exam Results</Heading>
      <Text color="gray.500">Track your performance across semesters.</Text>
    </Stack>
  </Layout>
)

export default Results
