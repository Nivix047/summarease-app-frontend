import React from "react";
import { Container, Box } from "@mui/material";
import DashboardForm from "../../components/Dashboard/DashboardForm";
import DashboardAppBar from "../../components/Dashboard/DashboardAppBar";

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <DashboardAppBar />
        <DashboardForm />
      </Box>
    </Container>
  );
};

export default Dashboard;
