import Layout from "../components/layout/Layout"
import { Heading, Text, Stack } from "@chakra-ui/react"

const Curriculum = () => (
  <Layout>
    <Stack gap={4}>
      <Heading size="lg">Course Curriculum</Heading>
      <Text color="gray.500">Explore programs, schools, and courses.</Text>
    </Stack>
  </Layout>
)

export default Curriculum
