// LoginPage.js
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { loginAPI } from "../../utils/ApiRequest";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Remove sidebar padding for login page
    document.body.classList.add('login-auth');
    return () => {
      document.body.classList.remove('login-auth');
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { email, password } = values;

      if(!email || !password){
        toast.error("Please fill in all fields", toastOptions);
        return;
      }

      setLoading(true);

      try {
        // Try to get users from JSON-Server first
        const { data } = await axios.get(loginAPI);
        
        // Handle both array response and object with users property
        const users = Array.isArray(data) ? data : (data.users || []);
        console.log("Fetched users from API:", users);
        
        const user = users.find(u => {
          const emailMatch = (u.email || "").toLowerCase().trim() === (email || "").toLowerCase().trim();
          const passwordMatch = (u.password || "") === (password || "");
          return emailMatch && passwordMatch;
        });
        console.log("Looking for user:", { email, password });
        console.log("Available users:", users);
        console.log("Found user:", user);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          toast.success("Login successful!", toastOptions);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          console.log("User not found. Available emails:", users.map(u => u.email));
          toast.error("Invalid email or password", toastOptions);
          setLoading(false);
        }
      } catch (err) {
        console.error("JSON-Server error:", err);
        // Fallback: Check localStorage if JSON-Server fails
        let existingUsers = JSON.parse(localStorage.getItem("appUsers") || "[]");
        
        // Also add default users from db.json if localStorage is empty
        if (existingUsers.length === 0) {
          existingUsers = [
            {
              id: "1764855832763",
              name: "SRK",
              email: "srk@gmail.com",
              password: "55555"
            },
            {
              id: "1",
              name: "John Doe",
              email: "john@example.com",
              password: "password123"
            }
          ];
          localStorage.setItem("appUsers", JSON.stringify(existingUsers));
        }
        
        console.log("Checking localStorage users:", existingUsers);
        console.log("Searching for:", { email: email.toLowerCase().trim(), password });
        
        const user = existingUsers.find(u => {
          const uEmail = (u.email || "").toLowerCase().trim();
          const uPassword = (u.password || "");
          const emailMatch = uEmail === email.toLowerCase().trim();
          const passwordMatch = uPassword === password;
          console.log(`Checking user: ${uEmail} === ${email.toLowerCase().trim()}? ${emailMatch}, ${uPassword} === ${password}? ${passwordMatch}`);
          return emailMatch && passwordMatch;
        });
        
        console.log("Found user in localStorage:", user);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          toast.success("Login successful!", toastOptions);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          console.log("No matching user found. Available users:", existingUsers.map(u => ({ email: u.email, hasPassword: !!u.password })));
          toast.error("Invalid email or password. Please check your credentials.", toastOptions);
          setLoading(false);
        }
      }
    } catch(error) {
      toast.error("Login failed: " + (error.message || "Unknown error"), toastOptions);
      setLoading(false);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    // console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container);
  }, []);

  return (
    <div className="login-page" style={{ position: "relative", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#000",
            },
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: 200,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: "#ffcc00",
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.5,
              random: true,
            },
            size: {
              value: 3,
              random: { enable: true, minimumValue: 1 },
            },
            links: {
              enable: false,
            },
            move: {
              enable: true,
              speed: 2,
            },
            life: {
              duration: {
                sync: false,
                value: 3,
              },
              count: 0,
              delay: {
                random: {
                  enable: true,
                  minimumValue: 0.5,
                },
                value: 1,
              },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          zIndex: -1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <Container
        className="mt-5 d-flex justify-content-center"
        style={{ position: "relative", zIndex: "2 !important" }}
      >
        <Row className="justify-content-center w-100">
          <Col md={6} xs={12} className="text-center">
            <h1 className="mt-5">
              <AccountBalanceWalletIcon
                sx={{ fontSize: 40, color: "white" }}
              />
            </h1>
            <h2 className="text-white">Login</h2>
            <Form className="text-start">
              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label className="text-white">Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label className="text-white">Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                />
              </Form.Group>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
                className="mt-4"
              >
                <Link to="/forgotPassword" className="text-white lnk">
                  Forgot Password?
                </Link>

                <Button
                  type="submit"
                  className=" text-center mt-3 btnStyle"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Signin…" : "Login"}
                </Button>

                <p className="mt-3" style={{ color: "#9d9494" }}>
                  Don't Have an Account?{" "}
                  <Link to="/register" className="text-white lnk">
                    Register
                  </Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;
