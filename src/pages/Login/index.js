import React from "react";
import { Container, Typography } from "@mui/material";
import LoginForm from "../../components/Login/LoginForm"; // Your existing login form

const Login = () => {
  return (
    <Container maxWidth="sm">
      {" "}
      <Typography variant="h4" gutterBottom align="center"></Typography>
      <LoginForm />
    </Container>
  );
};

export default Login;
