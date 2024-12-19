import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Snackbar, Alert } from '@mui/material';
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./capacitySeatingAllocation.css";
import "./seatAllocation.css"; // Make sure you have the correct path and name
import { baseurl } from './utils';
const initialState = {
  country: "",
  state: "",
  city: "",
  campus: "",
  floor: "",
  capacity: "",
};
const capacity = 100;
const ConfigureSeatAllocation = () => {
  const initialSeats = Array(capacity).fill({ status: 0 });
  const [seats, setSeats] = useState(initialSeats);
  const [values, setValues] = React.useState(initialState);
  const [allocationData, setData] = React.useState([]);
  const [allocateSeatSecFlag, setAllocateSeatSecFlag] = useState(false);
  const [capacityList, setCapacityList] = React.useState([]);
  const [configFlag, setConfigFlag] = React.useState("Add");
  const [currentId, setCurrentId] = React.useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [errors, setErrors] = React.useState({
    country: '',
    state: '',
    city: '',
    campus: '',
    floor: ''
  });
  const navigate = useNavigate();

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const snackbarStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto',
  };

  React.useEffect(() => {
    getConfiguredData();
  }, []);
  const getConfiguredData = async () => {
    await axios
      .get(`${baseurl}/getSeatingCapacityAdmin`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCapacityList(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" })
    // }
  };

  const handleAllocation = () => {
    setConfigFlag("Add")
    setAllocateSeatSecFlag(true);
    clearAllocation();
  };
  const validate = () => {
    const newErrors = {};

    if (!values.country) {
      newErrors.country = "required"
    }
    if (!values.state) {
      newErrors.state = "required"
    }
    if (!values.city) {
      newErrors.city = "required"
    }
    if (!values.campus) {
      newErrors.campus = "required"
    }
    if (!values.floor) {
      newErrors.floor = "required"
    }
    if (!values.capacity) {
      newErrors.capacity = "required"
    }
    return newErrors;
  };

  const validatingDataWhileSeatConfiguration = async () => {
    const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
        } else {
          setErrors({});
        }
        if (!values.country || !values.state || !values.city || !values.floor || !values.capacity || !values.campus) {

          return;

        }
        if (configFlag == "Edit") {
          editCapacity();
        } else {
          createCapacity();
        }
        setAllocateSeatSecFlag(false);
        setIsEditingCapacity(false);
  }

  const handleSubmitAllocation = async () => {
    if (!isEditingCapacity) {
    try {

      const response = await axios.get(`${baseurl}/getFloorConfiguration`, {
        params: {
          campus: values.campus,
          floor: values.floor,
          country: values.country,
          state: values.state,
          city: values.city
        }
      });
      // console.log(response.data);
      // console.log(response.data.length);

      if (response.data.length === 0) {
        validatingDataWhileSeatConfiguration();
      }
      else {
        setOpenSnackbar(true);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  } else {
    validatingDataWhileSeatConfiguration();
  }

  };
  const createCapacity = async () => {
    await axios
      .post(`${baseurl}/createSeatingCapacityAdmin`, values)
      .then((res) => {
        if (res.data) {
          setCapacityList(res.data);
          getConfiguredData();
          clearAllocation();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const editCapacity = async () => {
    await axios
      .put(
        `${baseurl}/updateSeatingCapacityAdmin/${currentId}`,
        values
      )
      .then((res) => {
        if (res.data) {
          getConfiguredData();
          clearAllocation();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const clearAllocation = () => {
    let copyInitialState = JSON.parse(JSON.stringify(initialState));
    setValues(copyInitialState);
    setCurrentId(0);
    setErrors({})
  };
  const handleBack = () => {
    setAllocateSeatSecFlag(false);
    clearAllocation();
  };
  const handleSeatAllocation = () => {
    navigate("/seatAllocationAdmin");
  };
  const handleEdit = (row, i) => {
    setCurrentId(row.id);
    setValues(row);
    setConfigFlag("Edit");
    setAllocateSeatSecFlag(true);
    setErrors({});
    setIsEditingCapacity(true);

  };
  const handleDelete = async (row, id) => {
    await axios
      .delete(`${baseurl}/deleteSeatingCapacityAdmin/${row.id}`)
      .then((res) => {
        if (res.data) {
          getConfiguredData();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="seatAllocationContainer">
      <Grid container spacing={2} justifyContent={"center"}>
        {allocateSeatSecFlag ? (
          <Grid
            item
            md={3}
            sx={{ maxWidth: 130, margin: "4%" }}
            className="allocateContainer"
          >
            <Box
              sx={{
                minWidth: 120,
                alignItems: "center",
                display: "flex",
                justifyContent: "start",
                margin: "10px",
                cursor: "pointer",
              }}
            >
              <ChevronLeftRoundedIcon
                className="backIconCls"
                onClick={handleBack}
              />{" "}
              <h2 className="fontFamily">{configFlag} new seating capacity</h2>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                <InputLabel id="demo-simple-select-label">Country</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={values.country}
                  label="Country"
                  name="country"
                  disabled={configFlag == "Edit"}
                  onChange={(e) => {
                    setValues({ ...values, country: e.target.value, state: "", city: "", campus: "", floor: "" });
                    setErrors({ ...errors, [e.target.name]: "" });
                  }}
                >
                  <MenuItem value={"India"}>India</MenuItem>
                  <MenuItem value={"UK"}>UK</MenuItem>
                </Select>
                {errors.country ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "14px" }}>Country is required</div> : ""}

              </FormControl>

            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                <InputLabel id="demo-simple-select-label">State</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={values.state}
                  label="State"
                  name="state"
                  disabled={configFlag == "Edit"}
                  onChange={(e) => {
                    setValues({ ...values, state: e.target.value, city: "", campus: "", floor: "" });
                    setErrors({ ...errors, [e.target.name]: "" });
                  }}
                >
                  {values.country === "India" && <MenuItem value={"Telangana"}>Telangana</MenuItem>}
                  {values.country === "India" && <MenuItem value={"Karnataka"}>Karnataka</MenuItem>}
                  {values.country === "UK" && <MenuItem value={"England"}>England</MenuItem>}

                </Select>
                {errors.state ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>State is required</div> : ""}
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                <InputLabel id="demo-simple-select-label">City</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={values.city}
                  label="City"
                  name="city"
                  disabled={configFlag == "Edit"}
                  onChange={(e) => {
                    setValues({ ...values, city: e.target.value, campus: "", floor: "" });
                    setErrors({ ...errors, [e.target.name]: "" });
                  }}
                >
                  {values.state === "Telangana" && <MenuItem value={"Hyderabad"}>Hyderabad</MenuItem>}
                  {values.state === "Karnataka" && <MenuItem value={"Bengaluru"}>Bengaluru</MenuItem>}
                  {values.state === "England" && <MenuItem value={"London"}>London</MenuItem>}

                </Select>
                {errors.city ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>City is required</div> : ""}

              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                <InputLabel id="demo-simple-select-label">Location</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={values.campus}
                  label="Location"
                  name="campus"
                  disabled={configFlag == "Edit"}
                  onChange={(e) => {
                    setValues({ ...values, campus: e.target.value, floor: "" });
                    setErrors({ ...errors, [e.target.name]: "" });
                  }}
                >
                  {values.city === "Hyderabad" && <MenuItem value={"Knowledge City"}>Knowledge City</MenuItem>}
                  {values.city === "Hyderabad" && <MenuItem value={"Mindspace"}>Mindspace</MenuItem>}
                  {values.city === "Bengaluru" && <MenuItem value={"M E Business Park"}>M E Business Park</MenuItem>}
                  {values.city === "Bengaluru" && <MenuItem value={"Manyata Tech Park"}>Manyata Tech Park</MenuItem>}
                  {values.city === "London" && <MenuItem value={"Gresham Street"}>Gresham Street</MenuItem>}


                </Select>
                {errors.campus ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>Location is required</div> : ""}

              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                <InputLabel id="demo-simple-select-label">Floor</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={values.floor}
                  label="Floor"
                  name="floor"
                  disabled={configFlag == "Edit"}
                  onChange={(e) => {
                    setValues({ ...values, floor: e.target.value });
                    setErrors({ ...errors, [e.target.name]: "" });
                  }}
                  MenuProps={{
                    style: { border: "none", maxHeight: "200px" }, // Adjust the maxHeight as needed
                  }}
                >
                  {/* Generate menu items for floor numbers 1 to 100 */}
                  {Array.from({ length: 200 }, (_, index) => (
                    <MenuItem key={index + 1} value={(index + 1).toString()}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </Select>
                {errors.floor ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>Floor is required</div> : ""}

              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                {/* <InputLabel id="demo-simple-select-label">No of seats</InputLabel> */}
                <TextField
                  id="outlined-number"
                  label="Allocation seats"
                  type="number"
                  name="capacity"
                  value={values.capacity}
                  onChange={(e) => {
                    setValues({ ...values, capacity: e.target.value });
                    setErrors({ ...errors, [e.target.name]: "" });
                  }}
                />
                {errors.capacity ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>Add capacity</div> : ""}

                {/* <Input id="outlined-basic" variant="outlined"   name='maxSeats' value={values.maxSeats} onChange={handleChange} type="number"/> */}
              </FormControl>
            </Box>
            <Box sx={{ marginTop: "10px" }}>
              <Grid container justifyContent={"end"}>
                <Button
                  sx={{ mr: 2 }}
                  className="secondaryBtnColors"
                  onClick={clearAllocation}
                >
                  Clear
                </Button>
                <Button
                  sx={{ mr: 2 }}
                  className="primaryBtnColors"
                  onClick={handleSubmitAllocation}
                >
                  Submit
                </Button>
              </Grid>
            </Box>
          </Grid>
        ) : (
          <Grid item md={7}>
            <Box
              sx={{
                display: "flex",
                margin: "2%",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 className="fontFamily">Seating Capacity</h3>
              <Grid>
                <Button
                  className="primaryBtnColors"
                  onClick={handleAllocation}
                  sx={{ textTransform: "capitalize", margin: "6px" }}
                >
                  Add new seating capacity
                </Button>
                <Button
                  className="primaryBtnColors"
                  onClick={handleSeatAllocation}
                  sx={{ textTransform: "capitalize" }}
                >
                  Allocate seats
                </Button>
              </Grid>
            </Box>
            <Box className="seatAllocationClass">
              <TableContainer className="capacityTableContainer">
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Country&nbsp;</TableCell>
                      <TableCell align="left">State&nbsp;</TableCell>
                      <TableCell align="left">City&nbsp;</TableCell>
                      <TableCell align="left">Location&nbsp;</TableCell>
                      <TableCell align="left">Floor&nbsp;</TableCell>
                      <TableCell align="left">Capacity&nbsp;</TableCell>
                      <TableCell align="left">Edit&nbsp;</TableCell>
                      <TableCell align="left">Delete&nbsp;</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {capacityList.length > 0 &&
                      capacityList.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell align="left">{row.country}</TableCell>
                          <TableCell align="left">{row.state}</TableCell>
                          <TableCell align="left">{row.city}</TableCell>
                          <TableCell align="left">{row.campus}</TableCell>
                          <TableCell align="left">{row.floor}</TableCell>
                          <TableCell align="left">{row.capacity}</TableCell>
                          <TableCell
                            align="center"
                            onClick={(index) => handleEdit(row, index)}
                          >
                            <EditOutlinedIcon />
                          </TableCell>
                          <TableCell
                            align="center"
                            onClick={(index) => handleDelete(row, index)}
                          >
                            <DeleteOutlineOutlinedIcon />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {/* {seats.map((seat,i)=>(
          <div className='seat' key={i}></div>
        ))} */}
          </Grid>
        )}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          style={snackbarStyle}
        >
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            Already floor plan created with this data.
            Please change data and try again.
          </Alert>
        </Snackbar>
      </Grid>
    </div>
  );
};

export default ConfigureSeatAllocation;
