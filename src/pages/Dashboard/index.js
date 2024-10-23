import React from "react";
import { Container, Box } from "@mui/material";
import DashboardForm from "../../components/Dashboard/DashboardForm";

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <DashboardForm />
      </Box>
    </Container>
  );
};

export default Dashboard;
