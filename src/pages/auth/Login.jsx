import { 
  Box, 
  Button, 
  Container, 
  Field, 
  Heading, 
  Input, 
  Stack, 
  Text, 
  Link as ChakraLink 
} from "@chakra-ui/react"
import { useState } from "react"
import { FaEnvelope, FaLock } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api/axios"

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const response = await api.post("/auth/login", formData)
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      navigate("/dashboard")
    } catch (err) {
      console.error("Login Error:", err)
      setError(err.response?.data?.error || "Login failed. Please try again.")
    }
  }

  return (
    <Container maxW="md" py={{ base: "12", md: "24" }}>
      <Box
        py={{ base: "0", sm: "8" }}
        px={{ base: "4", sm: "10" }}
        bg={{ base: "transparent", sm: "bg.surface" }}
        boxShadow={{ base: "none", sm: "md" }}
        borderRadius={{ base: "none", sm: "xl" }}
        borderWidth="1px"
      >
        <Stack gap="6">
          <Stack gap="2" textAlign="center">
            <Heading size="xl">Log in to your account</Heading>
            <Text color="fg.muted">Welcome back to Campus ERP</Text>
          </Stack>

          {error && <Text color="red.500" textAlign="center">{error}</Text>}

          <form onSubmit={handleSubmit}>
            <Stack gap="5">
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Box position="relative" width="full">
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="Enter your email" 
                    pl="10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.400">
                    <FaEnvelope />
                  </Box>
                </Box>
              </Field.Root>

              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Box position="relative" width="full">
                  <Input 
                    name="password"
                    type="password" 
                    placeholder="********" 
                    pl="10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.400">
                    <FaLock />
                  </Box>
                </Box>
              </Field.Root>

              <Button type="submit" colorPalette="blue" size="lg" fontSize="md">
                Sign in
              </Button>
            </Stack>
          </form>
          <Text textStyle="sm" color="fg.muted" textAlign="center">
            Don't have an account?{" "}
            <ChakraLink asChild color="blue.500">
              <Link to="/register">Sign up</Link>
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default Login
