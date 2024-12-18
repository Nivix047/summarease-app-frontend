import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Snackbar,
  CircularProgress,
  Divider,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const DashboardForm = () => {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [uploadedPDFs, setUploadedPDFs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

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

  useEffect(() => {
    fetchUploadedPDFs(); // Fetch PDFs when the component mounts
  }, []);

  const fetchUploadedPDFs = async () => {
    const authToken = localStorage.getItem("authToken");
    let userId = localStorage.getItem("userId");

    console.log("Auth Token:", authToken);
    console.log("User ID:", userId);
    console.log("Type of user ID:", typeof userId);
    if (!authToken || !userId) {
      console.error("User not logged in or auth token missing");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${userId}/user_info/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sortedPDFs = data.pdf_documents.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setUploadedPDFs(sortedPDFs);
        console.log("Fetched PDF Documents:", sortedPDFs);
      } else {
        console.error("Failed to fetch uploaded PDFs", response);
      }
    } catch (error) {
      console.error("Error fetching uploaded PDFs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !pdfFile) {
      setSnackbarMessage("Title and PDF file are required.");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
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

        const authToken = localStorage.getItem("authToken");
        console.log("Auth Token:", authToken);

        const uploadResponse = await fetch(
          "http://localhost:8000/api/v1/users/pdfs/",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: title,
              public_id: result.public_id,
              file_url: result.secure_url,
            }),
          }
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();

          // Update uploadedPDFs to include the new PDF without refreshing
          setUploadedPDFs((prevPDFs) => [uploadResult, ...prevPDFs]);

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
      setIsLoading(false);
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Uploading..." : "Submit"}{" "}
            {/* Toggle between "Uploading..." and "Submit" */}
          </Button>
        </form>
        {uploadedPDFs.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {/* <Typography variant="h6">Your Uploaded PDFs:</Typography> */}
            {uploadedPDFs.map((pdf) => {
              // Construct Cloudinary URL using public_id
              const fileUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/${pdf.public_id}.pdf`;

              return (
                <Box key={pdf.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", mr: 1 }}
                    >
                      <strong>Title: </strong>
                      {pdf.title}
                    </Typography>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1976d2",
                      }}
                    >
                      <PictureAsPdfIcon fontSize="large" />
                    </a>
                  </Box>

                  <Typography variant="body1">
                    <strong>Date: </strong>
                    {new Date(pdf.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Summary:</strong> {pdf.summary}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
              );
            })}
          </Box>
        )}
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
