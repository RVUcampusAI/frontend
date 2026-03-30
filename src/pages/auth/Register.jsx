import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Input, 
  Stack, 
  Text, 
  Link as ChakraLink,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api/axios"

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role_id: ""
  })
  const [roles, setRoles] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/roles")
        setRoles(response.data)
      } catch (err) {
        console.error("Error fetching roles:", err)
      }
    }
    fetchRoles()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.role_id) {
      setError("Please select a role")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id
      })
      navigate("/login")
    } catch (err) {
      console.error("Registration Error:", err)
      setError(err.response?.data?.error || "Registration failed. Please try again.")
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
            <Heading size="xl">Create an account</Heading>
            <Text color="fg.muted">Start managing your campus life</Text>
          </Stack>

          {error && <Text color="red.500" textAlign="center">{error}</Text>}

          <form onSubmit={handleSubmit}>
            <Stack gap="5">
              <Box>
                <Text mb="2" fontWeight="medium">Username</Text>
                <Box position="relative">
                  <Input 
                    name="username"
                    placeholder="Enter your username" 
                    pl="10"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.400">
                    <FaUser />
                  </Box>
                </Box>
              </Box>

              <Box>
                <Text mb="2" fontWeight="medium">Email</Text>
                <Box position="relative">
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
              </Box>

              <Box>
                <Text mb="2" fontWeight="medium">Select Role</Text>
                <select 
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Choose your role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text mb="2" fontWeight="medium">Password</Text>
                <Box position="relative">
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
              </Box>

              <Box>
                <Text mb="2" fontWeight="medium">Confirm Password</Text>
                <Box position="relative">
                  <Input 
                    name="confirmPassword"
                    type="password" 
                    placeholder="********" 
                    pl="10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.400">
                    <FaLock />
                  </Box>
                </Box>
              </Box>

              <Button type="submit" colorPalette="blue" size="lg" fontSize="md">
                Sign up
              </Button>
            </Stack>
          </form>
          <Text textStyle="sm" color="fg.muted" textAlign="center">
            Already have an account?{" "}
            <ChakraLink asChild color="blue.500">
              <Link to="/login">Log in</Link>
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default Register
