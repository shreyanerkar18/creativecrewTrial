import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import { jwtDecode } from 'jwt-decode';


export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useContext(AuthContext);

  // Check if the current path is either /login or /signup
  const hideHeaderOptions = ["/", "/signup", "/login"].includes(location.pathname);

  let decoded;
  if (token) {
    try {
      decoded = jwtDecode(token);
      //console.log(decoded); 
    } catch (error) {
      console.error("Invalid token specified:", error); // Handle token error (e.g., log out the user) 
    }
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    if (location.pathname !== "/profile") {
      navigate("/profile");
    }
  };

  const handleGraphs = () => {
    if (location.pathname !== "/graph") {
      navigate("/graph");
    }
  };

  const handlePlan = () => {
    if (location.pathname !== "/plan") {
      navigate("/plan");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="success" position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Creative Crew
          </Typography>
          {!hideHeaderOptions && (
            <>
              {token && decoded.role === "admin" && <Typography
                variant="subtitle1"
                component="div"
                onClick={handlePlan}
                sx={{ padding: "1%", cursor: "pointer", "&:hover": { color: "white" } }}
              >
                Plan
              </Typography>}
              <Typography
                variant="subtitle1"
                component="div"
                onClick={handleGraphs}
                sx={{ padding: "1%", cursor: "pointer", "&:hover": { color: "white" } }}
              >
                Graphs
              </Typography>
              <IconButton color="inherit" onClick={handleProfile}>
                <PersonIcon />
              </IconButton>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ padding: "1%", cursor: "pointer", "&:hover": { color: "white" } }}
                onClick={handleLogout}
              >
                Logout
              </Typography>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

