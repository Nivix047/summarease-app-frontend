import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const DashboardForm = () => {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const fileInputRef = useRef(null); // Reference for the file input

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !pdfFile) {
      setSnackbarMessage("Title and PDF file are required.");
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET // Unsigned preset
    );

    try {
      console.log("Uploading to Cloudinary...");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful:", result);

        const authToken = localStorage.getItem("authToken"); // Retrieve the token
        console.log("Auth Token:", authToken); // Log the token for debugging

        const uploadResponse = await fetch(
          "http://localhost:8000/api/v1/users/pdfs/",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${authToken}`, // Use the retrieved token
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: title,
              public_id: result.public_id, // Use public_id after upload
              file_url: result.secure_url, // Use secure_url after upload
            }),
          }
        );

        if (uploadResponse.ok) {
          setSnackbarMessage("PDF uploaded and summarized successfully!");
        } else {
          const error = await uploadResponse.json();
          setSnackbarMessage(
            `Error uploading PDF to server: ${error.detail || error.error}`
          );
          console.error("Server upload error:", error);
        }
      } else {
        const error = await response.json();
        setSnackbarMessage(`Error uploading PDF to Cloudinary: ${error.error}`);
        console.error("Cloudinary upload error:", error);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setSnackbarMessage("An error occurred while uploading the PDF.");
    } finally {
      setOpenSnackbar(true);
      setTitle("");
      setPdfFile(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload PDF for Summarization
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: "4px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "20px",
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Typography variant="body1">
              {pdfFile
                ? pdfFile.name
                : "Drag and drop a PDF file here, or click to select a file."}
            </Typography>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
              ref={fileInputRef}
            />
            <label htmlFor="pdf-upload">
              <Button
                variant="contained"
                component="span"
                onClick={() => fileInputRef.current.click()}
                sx={{ marginBottom: "10px" }}
              >
                Select PDF
              </Button>
            </label>
          </Box>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </form>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default DashboardForm;
