import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom";

export default function DashboardForm() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the authentication token or session data
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar Component */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Dashboard content area */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Dashboard
        </Typography>
        {/* Add your dashboard-specific content here */}
        <Box>
          {/* Example: This is where you can render your dashboard data */}
          <Typography variant="body1">
            This is your dashboard content area. You can add charts, stats, etc.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
