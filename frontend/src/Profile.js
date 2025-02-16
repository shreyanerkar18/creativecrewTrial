import React, { useState, useContext } from 'react';
import { Box, Button, Typography, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { AuthContext } from "./AuthProvider";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { baseurl } from './utils';

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);

  let decoded;
  if (token) {
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token specified:", error);
    }
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    let error = "";
    if (name === "newPassword" && !validatePassword(value)) {
      error = "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a digit, and a special character.";
    } else if (name === "confirmNewPassword" && value !== newPassword) {
      error = "Passwords do not match.";
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage("New passwords do not match!");
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage("Password does not meet the requirements.");
      return;
    }

    if (oldPassword === confirmNewPassword) {
      setMessage("New password cannot be the same as the old password");
      return;
    }

    try {
      const response = await axios.post(`${baseurl}/changePassword`, {
        email: decoded.email,
        oldPassword,
        newPassword
      });
      setMessage('');
      setOpenSnackbar(true);
      setShowPasswordFields(false);
    } catch (error) {
      setMessage("Error changing password. Please try again.");
    }
  };

  const handleShowPasswordFields = () => {
    setOldPassword('');  // Clear old password state
    setNewPassword('');  // Clear new password state
    setConfirmNewPassword('');  // Clear confirm new password state
    setShowPasswordFields(!showPasswordFields);
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordFields(false);
    setErrors({});
    setMessage('');
  };

  const maskEmail = (email) => {
    const [user, domain] = email.split("@");
    const maskedUser = user.slice(0, 3) + "****" + user.slice(-3);
    return `${maskedUser}@${domain}`;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ p: 3, mt: 5, borderRadius: '8px', boxShadow: 3, backgroundColor: '#f9f9f9' }}>
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><Typography variant="h6">First Name:</Typography></TableCell>
                <TableCell><Typography variant="body1">{decoded.firstName}</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="h6">Last Name:</Typography></TableCell>
                <TableCell><Typography variant="body1">{decoded.lastName}</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="h6">Email:</Typography></TableCell>
                <TableCell><Typography variant="body1">{maskEmail(decoded.email)}</Typography></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleShowPasswordFields}>
            Change Password
          </Button>
        </Box>
      </Box>

      <Dialog open={showPasswordFields} onClose={handleClosePasswordDialog} sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: 3, padding: 2, minWidth: 300 } }}>
        <DialogTitle>
          <Typography variant="h5" color="primary" fontWeight="bold">Change Password</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Old Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Password"
            type="password"
            name="newPassword"
            value={newPassword}
            onBlur={handleBlur}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            name="confirmNewPassword"
            value={confirmNewPassword}
            onBlur={handleBlur}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={!!errors.confirmNewPassword}
            helperText={errors.confirmNewPassword}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          {message && <Typography variant="body1" color="error" sx={{ mt: 2 }}>{message}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleChangePassword} color="secondary" variant="contained" sx={{ textTransform: 'none' }}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Password Changed successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
