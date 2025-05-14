import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  Box,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { baseurl } from "./utils";
import { AuthContext } from "./AuthProvider";
import { jwtDecode } from "jwt-decode";

export default function Employee() {
  const [seatData, setSeatData] = useState([]);
  const { token } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const decoded = jwtDecode(token);

  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        if (token) {
          const decoded = jwtDecode(token);
          const response = await axios.get(`${baseurl}/getSeatData`, {
            params: {
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              bu: decoded.bu,
            },
          });
          console.log("Fetched seat data:", response.data);
          setSeatData(
            response.data.map((item) => ({ ...item, seat_data: [item.seat_data] }))
          );
        }
      } catch (error) {
        console.error(
          "Error fetching seat data:",
          error.response ? error.response.data : error.message
        );
      }
    };

    if (token) {
      fetchSeatData();
    }
  }, [token]);

  return (
    <Container sx={{ mt: 4, px: isMobile ? 2 : 4 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          mb: 3,
          color: "#2c3e50",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Welcome, {decoded.firstName} {decoded.lastName}!
      </Typography>

      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper} elevation={5} sx={{ borderRadius: "12px" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#2980b9" }}>
                {[
                  "Manager Name",
                  "Floor",
                  "Business Unit",
                  "Campus",
                  "Seat Allocation",
                ].map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{ color: "white", fontWeight: "bold", py: 1 }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {seatData.length > 0 ? (
                seatData.map((seat, index) => (
                  <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#ecf0f1" } }}>
                    <TableCell align="center" sx={{ fontWeight: "500", color: "#34495e" }}>
                      {seat.first_name} {seat.last_name}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "500", color: "#34495e" }}>{seat.floor}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "500", color: "#34495e" }}>{seat.business_unit}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "500", color: "#34495e" }}>{seat.campus}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "500", color: "#34495e" }}>
                      {Array.isArray(seat.seat_data) && seat.seat_data.length > 0 ? (
                        <List sx={{
                          p: 1,
                          backgroundColor: "#dff9fb",
                          borderRadius: "8px",
                          display: "inline-block",
                          textAlign: "left",
                        }}>
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                            <ListItem
                              key={day}
                              sx={{
                                p: "4px",
                                fontSize: "0.9rem",
                                fontWeight: "bold",
                                color: seat.seat_data[0][day] === "WFH" ? "#e74c3c" : "#27ae60",
                                backgroundColor: seat.seat_data[0][day] === "WFH" ? "#fdecea" : "#eafaf1",
                                borderRadius: "6px",
                                mb: "4px",
                              }}
                            >
                              {day}: {seat.seat_data[0][day] || "No data"}
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" sx={{ color: "#e74c3c", fontWeight: "bold" }}>No data available</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "#e74c3c", fontWeight: "bold" }}>
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}