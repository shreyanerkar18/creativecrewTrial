import { Alert, Snackbar, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseurl } from "./utils";

import "./seatAllocationAdmin.css"; // Make sure you have the correct path and name



const initialBuState = {
  country: "",
  state: "",
  city: "",
  campus: "",
  floor: "",
  bu: "",
  maxSeats: 0,
};

const colorCodes = [
  "#ae7681",
  "#769184",
  "#3b6970",
  "#768391",
  "#a6bbeb",
  "#b587a9",
  "#b59c87",
];
const SeatAllocationAdmin = () => {
  const [seats, setSeats] = useState();
  const [oldSeats, setOldSeats] = useState(seats);
  const [values, setValues] = React.useState(initialBuState);
  const [allocationData, setData] = React.useState([]);
  const [allocateSeatSecFlag, setAllocateSeatSecFlag] = useState(false);
  const [errors, setErrors] = useState({});
  const [seatEnable, setSeatsEnable] = useState(false);
  const [allocatedSeatsByGlobal, setallocatedSeatsByGlobal] = useState([]);
  const [maxSeats, setMaxSeats] = useState(0);
  const [bus, setBus] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [floorList, setFloors] = useState([]);
  const [layoutView, setLayoutView] = useState(initialBuState);
  const [capacityData, setCapacityData] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSnackbar1, setOpenSnackbar1] = useState(false);
  const [showAllocateButton, setShowAllocateButton] = useState(true);
  const [showUnallocateButton, setShowUnallocateButton] = useState(true);
  const [workDoing, setWorkDoing] = useState(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const onClickingAllocateSeats = () => {
    setWorkDoing(workDoing === null ? 'allocation' : null);
    setSeats(oldSeats);
    values.bu = "";
    values.maxSeats = 0;

  }

  const onClickingUnallocateSeats = () => {
    setWorkDoing(workDoing === null ? 'unallocation' : null);
    values.bu = "";
    values.maxSeats = 0;

  }

  const handleUnallocation = async () => {
    try {
      const response = await axios.put(`${baseurl}/removeSeatsForHOE`, {
        country: values.country,
        state: values.state,
        city: values.city,
        campus: values.campus,
        floor: values.floor,
        businessId: values.bu
      }
      )
      //console.log(response.data);
      setOpen(false);
      setWorkDoing(null);
      setOpenSnackbar1(true);
      getAllocationData();
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  React.useEffect(() => {
    getBu();
    getAllocationData();
    getCapacityData();

  }, []);
  React.useEffect(() => {
    if (values.floor) {
      getAllocationData();
      getConfiguredDataByFilter(values.floor ? values.floor : "5");
    }
  }, [values.floor, values.bu]);
  React.useEffect(() => {
    if (
      (allocatedSeatsByGlobal && allocatedSeatsByGlobal.length > 0) ||
      maxSeats > 0
    ) {
      copyValues();
    }
  }, [maxSeats, allocatedSeatsByGlobal]);
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  const handleSnackbarClose1 = () => {
    setOpenSnackbar1(false);
  };
  const handleCountries = (data) => {
    let countryList = [];

    for (let i = 0; i < data.length; i++) {
      let findItem = countryList.findIndex(
        (coun) => data[i].country == coun.name
      );

      if (findItem == -1) {
        countryList.push({ name: data[i].country });
      }
    }
    setCountries(countryList);
  };
  const getBu = async () => {
    await axios
      .get(`${baseurl}/getBu`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          res.data.map((row, i) => {
            row.colorCode = colorCodes[i];
            //getRandomColor();
          });
          setBus(res.data);
          //console.log(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRandomColor = () => {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const getCapacityData = async () => {
    await axios
      .get(`${baseurl}/getSeatingCapacityAdmin`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCapacityData(res.data);
          setTimeout(() => {
            setValues({ ...values, country: res.data[0].country, state: res.data[0].state, city: res.data[0].city, campus: res.data[0].campus, floor: res.data[0].floor })
            setLayoutView({ ...layoutView, country: res.data[0].country, state: res.data[0].state, city: res.data[0].city, campus: res.data[0].campus, floor: res.data[0].floor })
            setStates(Array.from(new Set(res.data.filter(item => item.country === res.data[0].country).map(item => item.state))).sort().map(state => ({ name: state })))
            setCities(Array.from(new Set(res.data.filter(item => item.state === res.data[0].state).map(item => item.city))).sort().map(city => ({ name: city })))
            setCampuses(Array.from(new Set(res.data.filter(item => item.city === res.data[0].city).map(item => item.campus))).sort().map(campus => ({ name: campus })))
            setFloors(Array.from(new Set(res.data.filter(item => item.campus === res.data[0].campus).map(item => item.floor)))
              .sort((a, b) => {
                if (typeof a === 'number' && typeof b === 'number') { return a - b; }
                else { return a.toString().localeCompare(b.toString()); }
              })
              .map(floor => ({ name: floor })))
          }, 1000)
          handleCountries(res.data);
          handleStates(res.data, res.data[0].country);
          handleCities(res.data, res.data[0].state, "default");
          handleCampus(res.data, res.data[0].city, "default");
          handleFloor(res.data, res.data[0].campus, "default");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getAllocationData = async () => {
    await axios
      .get(`${baseurl}/getAllocatedSetsAdmin`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setallocatedSeatsByGlobal(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleStates = (data, country) => {
    let stateList = [];
    for (let i = 0; i < data.length; i++) {
      let findItem = stateList.findIndex((coun) => data[i].state == coun.name);
      if (findItem == -1 && data[i].country == country) {
        stateList.push({ name: data[i].state });
      }
    }
    setStates(stateList);
  };
  const handleCities = (data, state, type) => {
    let cityList = [];
    let country = (!type && values.country) ? values.country : (data.length > 0 ? data[0].country : "")
    for (let i = 0; i < data.length; i++) {
      let findItem = cityList.findIndex((coun) => data[i].city == coun.name);

      if (
        findItem == -1 &&
        data[i].country == country &&
        data[i].state == state
      ) {
        cityList.push({ name: data[i].city });
      }
    }

    setCities(cityList);
  };
  const handleCampus = (data, city, type) => {
    let campusList = [];
    let country = (!type && values.country) ? values.country : (data.length > 0 ? data[0].country : "")
    let state = (!type && values.state) ? values.state : (data.length > 0 ? data[0].state : "")

    for (let i = 0; i < data.length; i++) {
      let findItem = campusList.findIndex((coun) => data[i].campus == coun.name);

      if (
        findItem == -1 &&
        data[i].country == country &&
        data[i].state == state &&
        data[i].city == city
      ) {
        campusList.push({ name: data[i].campus });
      }
    }

    setCampuses(campusList);
  };
  const handleFloor = (data, campus, type) => {
    let floorList = [];
    let country = (!type && values.country) ? values.country : (data.length > 0 ? data[0].country : "")
    let state = (!type && values.state) ? values.state : (data.length > 0 ? data[0].state : "")
    let city = (!type && values.city) ? values.city : (data.length > 0 ? data[0].city : "")

    for (let i = 0; i < data.length; i++) {
      let findItem = floorList.findIndex((coun) => data[i].floor == coun.name);

      if (
        findItem == -1 &&
        data[i].country == country &&
        data[i].state == state &&
        data[i].city == city &&
        data[i].campus == campus
      ) {
        floorList.push({ name: data[i].floor });
      }
    }

    setFloors(floorList);
  };
  const copyValues = () => {
    let objs = [];
    //console.log("values", values);
    for (let i = 0; i < maxSeats; i++) {
      let sobj = {
        seatNo: i + 1,
        bu: "",
        country: "",
        floor: "",
        city: "",
        campus: "",
        state: "",
        selected: 0,
        status: 0,
      };
      if (allocatedSeatsByGlobal.length > 0) {
        allocatedSeatsByGlobal.map((obj, j) => {
          if (obj.seats && obj.seats.includes(i + 1) && obj.country === values.country
            && obj.state === values.state
            && obj.city === values.city && obj.campus === values.campus && obj.floor === values.floor) {
            sobj = {
              selected:
                !obj.selected && parseInt(obj.floor) == parseInt(values.floor)
                  ? 1
                  : 0,
              bu: obj.bu_id,
              floor: obj.floor,
              city: obj.city,
              campus: obj.campus,
              state: obj.state,
              seatNo: i + 1,
            };
          }
        });
      }
      objs.push(sobj);
    }
    setSeats(objs);
    setOldSeats(objs);
  };
  const getConfiguredDataByFilter = async (floor) => {
    let queryParams = { ...values, floor };
    await axios
      .get(`${baseurl}/getSeatingCapacityAdminByFilter`, {
        params: queryParams,
      })
      .then((res) => {
        if (res.data && res.data.length > 0 && res.data[0].sum) {
          setMaxSeats(res.data[0].sum);
        } else {
          setMaxSeats(100);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleChange = (event) => {
    if (event.target.name == "country") {
      handleStates(capacityData, event.target.value);
      setValues({
        ...values,
        [event.target.name]: event.target.value,
        state: "",
        city: "",
        campus: "",
        floor: "",
        bu: 0,
        maxSeats: 0,
      });
      setWorkDoing(null);
    } else if (event.target.name == "state") {
      handleCities(capacityData, event.target.value);
      setValues({
        ...values,
        [event.target.name]: event.target.value,
        city: "",
        campus: "",
        floor: "",
        bu: 0,
        maxSeats: 0,
      });
      setWorkDoing(null);
    } else if (event.target.name == "city") {
      handleCampus(capacityData, event.target.value);
      setValues({
        ...values,
        [event.target.name]: event.target.value,
        campus: "",
        floor: "",
        bu: 0,
        maxSeats: 0,
      });
      setWorkDoing(null);
    } else if (event.target.name == "campus") {
      handleFloor(capacityData, event.target.value);
      setValues({
        ...values,
        [event.target.name]: event.target.value,
        floor: "",
        bu: 0,
        maxSeats: 0,
      });
      setWorkDoing(null);
    } else if (event.target.name == "floor") {
      // setMaxSeats(0);
      getConfiguredDataByFilter(event.target.value);
      setLayoutView({
        ...values, floor
          : event.target.value
      })
      setValues({
        ...values,
        [event.target.name]: event.target.value,
        bu: 0,
        maxSeats: 0,
      });
      setWorkDoing(null);
    } else if (event.target.name == "bu") {
      // copyValues()
      setValues({
        ...values,
        [event.target.name]: event.target.value,
        maxSeats: 0,
      });
    } else {
      setValues({ ...values, [event.target.name]: event.target.value });
      setErrors({ ...errors, maxSeats: "" })
    }
  };
  const colorCodeF = (bu, selected) => {
    let buData = bus.find((buDta) => buDta.id == bu);
    let colorCode = "";
    if (buData) {
      colorCode = buData.colorCode;
    }
    colorCode = selected && colorCode ? colorCode : "#fff";
    return colorCode;
  };
  const validate = () => {
    const newErrors = {};
    if (!values.maxSeats || values.maxSeats > getBuCount("")) {
      if (values.maxSeats > getBuCount("")) {
        newErrors.maxSeats = "You have the capacity of " + getBuCount("")
      } else {
        newErrors.maxSeats = "required"
      }
    }
    return newErrors;
  };
  const handleSelectSeats = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSeatsEnable(false);
    } else {
      setErrors({});
      setSeatsEnable(true);
      setAllocateSeatSecFlag(false);
    }
  };
  const handleAllocateSets = (copySeats, getUnallocated) => {
    copySeats.map((copyseat, j) => {
      getUnallocated.map((getUnallocat, i) => {
        if (getUnallocat.seatNo == copyseat.seatNo) {
          copyseat.selected = 1;
          copyseat.status = 1;
          copyseat.bu = values.bu;
          copyseat.city = values.city;
          copyseat.campus = values.campus;
          copyseat.state = values.state;
          copyseat.country = values.country;
          copyseat.floor = parseInt(values.floor);
        }
      });
    });
    return copySeats;
  };
  const getDataFromIndex = (copySeats, index, maxSeats) => {
    let getUnallocated = copySeats.filter(
      (seat, seatIndex) =>
        index <= seatIndex &&
        seatIndex < index + parseInt(maxSeats) &&
        !seat.selected
    );
    let getBackUnallocated = copySeats.filter(
      (seat, seatIndex) =>
        seatIndex > index - parseInt(maxSeats) && !seat.selected
    );
    if (
      getUnallocated.length == 1 &&
      getBackUnallocated.length == values.maxSeats
    ) {
      getUnallocated = getBackUnallocated;
    }
    return getUnallocated;
  };
  const getDataFromIndexToBack = (copySeats, index, maxSeats) => {
    let getUnallocatedLessSeats = copySeats.filter(
      (seat, seatIndex) =>
        index <= seatIndex && seatIndex < index + parseInt(maxSeats)
    );
    let getBackUnallocated = copySeats.filter(
      (seat, seatIndex) => seatIndex > index - parseInt(maxSeats)
    );
    if (
      getUnallocatedLessSeats.length == 1 &&
      getBackUnallocated.length == values.maxSeats
    ) {
      getUnallocatedLessSeats = getBackUnallocated;
    }
    if (getUnallocatedLessSeats.length > 0) {
      let findSelectedIndex = getUnallocatedLessSeats.findIndex(
        (seat, seatIndex) => seat.selected == 1
      );
      if (findSelectedIndex > -1) {
        getUnallocatedLessSeats = getUnallocatedLessSeats.slice(
          0,
          findSelectedIndex
        );
      }
    }
    return getUnallocatedLessSeats;
  };
  const handleSeatAllocation = (e, index) => {
    let maxSeats = values.maxSeats;
    let copySeats = JSON.parse(JSON.stringify(seats));

    let selectedSeats = copySeats.filter(
      (seat) => seat.status == 1 && seat.selected == 1
    );
    if (selectedSeats.length == 0) {
      let getUnallocated = getDataFromIndex(copySeats, index, maxSeats);
      if (getUnallocated.length == parseInt(values.maxSeats)) {
        copySeats = handleAllocateSets(copySeats, getUnallocated);
      } else {
        let getUnallocatedLessSeats = getDataFromIndexToBack(
          copySeats,
          index,
          maxSeats
        );
        copySeats = handleAllocateSets(copySeats, getUnallocatedLessSeats);
      }
    } else if (selectedSeats.length == maxSeats) {
      copySeats.map((copyseat, j) => {
        if (copyseat.status == 1 && copyseat.selected == 1) {
          //console.log(copyseat);
          copyseat.selected = 0;
          copyseat.status = 0;
          copyseat.bu = "";
          copyseat.city = "";
          copyseat.campus = "";
          copyseat.state = "";
          copyseat.country = "";
          copyseat.floor = "";
        }
      });
      let getUnallocated = getDataFromIndex(copySeats, index, maxSeats);
      if (getUnallocated.length == values.maxSeats) {
        //console.log("A");
        copySeats = handleAllocateSets(copySeats, getUnallocated);
      } else {
        //console.log("B");
        let getUnallocatedLessSeats = getDataFromIndexToBack(
          copySeats,
          index,
          maxSeats
        );
        copySeats = handleAllocateSets(copySeats, getUnallocatedLessSeats);
      }
    } else if (selectedSeats.length > 0 && selectedSeats.length < maxSeats) {
      let getUnallocated = getDataFromIndex(
        copySeats,
        index,
        maxSeats - selectedSeats.length
      );
      if (getUnallocated.length == values.maxSeats) {
        copySeats = handleAllocateSets(copySeats, getUnallocated);
      } else {
        let getUnallocatedLessSeats = getDataFromIndexToBack(
          copySeats,
          index,
          maxSeats - selectedSeats.length
        );
        copySeats = handleAllocateSets(copySeats, getUnallocatedLessSeats);
      }
    }

    setSeats(copySeats);
  };
  const handleAllocation = () => {
    let result = {};
    seats.forEach((obj, index) => {
      if (obj.selected == 1 && obj.status == 1) {
        //console.log(values.country, obj.country);
        let key = `${obj.country}-${obj.state}-${obj.city}-${obj.campus}-${obj.floor}-${obj.bu}`;

        if (result[key]) {
          result[key].seats.push(obj.seatNo);
        } else {
          result[key] = {
            country: values.country,
            state: values.state,
            city: values.city,
            campus: values.campus,
            bu: values.bu,
            floor: parseInt(values.floor),
            seats: [obj.seatNo],
          };
        }
      }
    });
    let mergedArray = Object.values(result);

    //console.log(mergedArray);

    if (mergedArray.length > 0) {
      handleAllocationToHOE(mergedArray[0]);
    }
  };
  const handleAllocationToHOE = async (obj) => {
    //console.log(maxSeats);
    try {
      const response = await axios.get(`${baseurl}/getDetailsBeforeAllocation`, {
        params: {
          country: values.country,
          state: values.state,
          city: values.city,
          campus: values.campus,
          floor: values.floor,
          businessId: values.bu
        }
      })

      if (response.data.length > 0) {
        const combinedArray = response.data[0].seats.concat(obj.seats).sort((a, b) => a - b);

        await axios
          .put(`${baseurl}/updateToSameRow`, { ...obj, seats: combinedArray })
          .then((res) => {
            if (res.data) {
              setAllocateSeatSecFlag(false);
              setOpenSnackbar(true);
              setOldSeats(seats);
              setWorkDoing(null);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }

      else {
        await axios
          .post(`${baseurl}/createAllocatedSetsAdmin`, { ...obj, total: maxSeats })
          .then((res) => {
            if (res.data) {
              setAllocateSeatSecFlag(false);
              setOpenSnackbar(true);
              setWorkDoing(null);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  const handleSeatingCapacity = () => {
    navigate("/configureSeatAllocation");
  };
  const getBuCount = (id) => {
    if (seats && seats.length > 0 && id) {
      let records = seats && seats.filter((seat, i) => seat.bu == id && seat.selected)
      if (records.length > 0) {
        return records.length
      } else {
        return 0
      }
    } else {
      let records = seats && seats.filter((seat, i) => !seat.selected)
      if (records && records.length > 0) {
        return records.length
      } else {
        return 0
      }
    }
  }

  return (
    <div className="seatAllocationContainer">
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Seats Allocated Successfully!
        </Alert>
      </Snackbar>
      <Grid container spacing={2} justifyContent={"center"}>
        <Grid item md={12} sx={{ margin: "0% 3%" }}>
          <Box sx={{ textAlign: "right", margin: "1%" }}>
            <Button
              sx={{ marginRight: "10px" }}
              className="primaryBtnColors"
              onClick={handleAllocation}
            >
              Assign to HOE
            </Button>
            <Button
              sx={{ marginRight: "10px" }}
              className="primaryBtnColors"
              onClick={handleSeatingCapacity}
            >
              Configure Seating Capacity
            </Button>
          </Box>
        </Grid>

        <Grid
          container
          spacing={2}
          sx={{ margin: "0% 3%" }}
          justifyContent={"center"}
        >
          {/* {allocateSeatSecFlag ? ( */}
          <Grid item md={3}>
            <Grid
              sx={{
                boxShadow:
                  "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                padding: "20px 10px",
              }}
            >
              {countries.length > 0 && states.length > 0 && cities.length > 0 && campuses.length > 0 && floorList.length > 0 && (
                <Box sx={{ minWidth: 120 }}>
                  <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                    <InputLabel id="demo-simple-select-label">
                      Country
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={values.country}
                      label="Country"
                      name="country"
                      onChange={handleChange}
                    >
                      {countries.map((country, i) => (
                        <MenuItem key={country.name} value={country.name}>{country.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Box sx={{ minWidth: 120 }}>
                <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                  <InputLabel id="demo-simple-select-label">State</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={values.state}
                    label="State"
                    name="state"
                    onChange={handleChange}
                  >
                    {states.map((state, i) => (
                      <MenuItem key={state.name} value={state.name}>{state.name}</MenuItem>
                    ))}
                  </Select>
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
                    onChange={handleChange}
                  >
                    {cities.map((city, i) => (
                      <MenuItem key={city.name} value={city.name}>{city.name}</MenuItem>
                    ))}
                  </Select>
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
                    onChange={handleChange}
                  >
                    {campuses.map((campus, i) => (
                      <MenuItem key={campus.name} value={campus.name}>{campus.name}</MenuItem>
                    ))}
                  </Select>
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
                    onChange={handleChange}
                  >
                    {floorList.map((floor, i) => (
                      <MenuItem key={floor.name} value={floor.name}>{floor.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {/*<Box sx={{ minWidth: 120 }}>
                <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                  <InputLabel id="demo-simple-select-label">
                    Business Unit
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={values.bu}
                    label="Business Unit"
                    name="bu"
                    onChange={handleChange}
                  >
                    {bus.map((bu, i) => (
                      <MenuItem value={bu.id}>{bu.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 120 }}>
                <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium"> */}
              {/* <InputLabel id="demo-simple-select-label">No of seats</InputLabel> */}
              {/*<TextField
                    id="outlined-number"
                    label="Allocation seats"
                    type="number"
                    name="maxSeats"
                    value={values.maxSeats}
                    onChange={handleChange}
                  /> */}
              {/* <Input id="outlined-basic" variant="outlined"   name='maxSeats' value={values.maxSeats} onChange={handleChange} type="number"/> */}
              {/*{errors.maxSeats ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>{errors.maxSeats}</div> : ""}
                </FormControl>
              </Box>*/}
              {/*<Box sx={{ marginTop: "10px" }}>
                <Grid container justifyContent={"end"}>
                    <Button
                      sx={{ mr: 2 }}
                      className="primaryBtnColors"
                      onClick={handleSelectSeats}
                    >
                      Select Seats
                    </Button> */}
              {/* <Button   sx={{ mr: 2 }} className="secondaryBtnColors" onClick={clearAllocation}>
                  Clear
                </Button>
                <Button   sx={{ mr: 2 }}  className="primaryBtnColors" onClick={handleSubmitAllocation}>
                  Assign to HOE
                </Button> */}
              {/*</Grid>
              </Box> */}
              {workDoing === null && values.floor !== "" && <Box sx={{ minWidth: 120 }}>
                <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                  <Button
                    className="primaryBtnColors"
                    onClick={onClickingAllocateSeats}
                  >
                    Allocate Seats
                  </Button>
                </FormControl>
              </Box>}

              {workDoing === 'allocation' &&
                <>
                  <Box sx={{ minWidth: 120 }}>
                    <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                      <InputLabel id="demo-simple-select-label">
                        Business Unit
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={values.bu}
                        label="Business Unit"
                        name="bu"
                        onChange={handleChange}
                      >
                        {bus.map((bu, i) => (
                          <MenuItem key={bu.id} value={bu.id}>{bu.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                      {/* <InputLabel id="demo-simple-select-label">No of seats</InputLabel> */}
                      <TextField
                        id="outlined-number"
                        label="Allocation seats"
                        type="number"
                        name="maxSeats"
                        value={values.maxSeats}
                        onChange={handleChange}
                      />
                      {errors.maxSeats ? <div className="fontFamily" style={{ color: "red", paddingTop: "5px", fontSize: "12px" }}>{errors.maxSeats}</div> : ""}
                    </FormControl>
                  </Box>
                  <Box sx={{ marginTop: "10px", display: "flex", flexDirection: 'row' }}>
                    <Grid container justifyContent={"start"}>
                      <Button
                        sx={{ ml: 2 }}
                        className="primaryBtnColors"
                        onClick={onClickingAllocateSeats}
                      >
                        Cancel
                      </Button>
                    </Grid>
                    <Grid container justifyContent={"end"}>
                      {values.maxSeats > 0 && (
                        <Button
                          sx={{ mr: 2 }}
                          className="primaryBtnColors"
                          onClick={handleSelectSeats}
                        >
                          Select Seats
                        </Button>
                      )}
                    </Grid>
                  </Box>
                </>
              }

              {workDoing === null && values.floor !== '' && <Box sx={{ minWidth: 120 }}>
                <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                  <Button
                    className="primaryBtnColors"
                    onClick={onClickingUnallocateSeats}
                  >
                    Unallocate Seats
                  </Button>
                </FormControl>
              </Box>}

              {workDoing === 'unallocation' &&
                <>
                  <Box sx={{ minWidth: 120 }}>
                    <FormControl sx={{ m: 2, minWidth: "90%" }} size="medium">
                      <InputLabel id="demo-simple-select-label">
                        Business Unit
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={values.bu}
                        label="Business Unit"
                        name="bu"
                        onChange={handleChange}
                      >
                        {bus.map((bu, i) => {
                          const uniqueBus = [...new Set(seats.map(item => item.bu))];
                          if (uniqueBus.includes(bu.id)) {
                            return <MenuItem key={i} value={bu.id}>{bu.name}</MenuItem>;
                          }
                          return null;
                        })}

                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ marginTop: "10px", display: "flex", flexDirection: 'row' }}>
                    <Grid container justifyContent={"start"}>
                      <Button
                        sx={{ ml: 2 }}
                        className="primaryBtnColors"
                        onClick={onClickingAllocateSeats}
                      >
                        Cancel
                      </Button>
                    </Grid>
                    <Grid container justifyContent={"end"}>
                      {values.bu !== "" && (
                        <>
                          <Button
                            sx={{ mr: 2 }}
                            className="primaryBtnColors"
                            onClick={handleClickOpen}
                          >
                            Unassign
                          </Button>
                          <Dialog open={open}>
                            <DialogTitle style={{ color: 'red' }}>Caution!</DialogTitle>
                            <DialogContent>
                              <DialogContentText>
                                This will remove all seats currently reserved for {bus.find(item => item.id === values.bu).name} on this floor. Would you like to proceed?"
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleClose} color="primary" >
                                Cancel
                              </Button>
                              <Button onClick={handleUnallocation} color="warning">
                                Proceed
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </>
                      )}
                    </Grid>
                  </Box>
                </>
              }
            </Grid>
          </Grid>
          <Grid item md={9}>
            <Box className="seatAllocationClass">
              <h2 className="fontFamily" style={{ textTransform: "capitalize" }}>Layout view {layoutView.country && layoutView.state && layoutView.city && layoutView.campus && layoutView.floor && <>( {layoutView.country} &gt; {layoutView.state} &gt; {layoutView.city} &gt; {layoutView.campus} &gt; {layoutView.floor} )</>}</h2>
              {seats && seats.length > 0
                ? seats.map((row, rowIndex) => (
                    <div
                      key={rowIndex+1}
                      className={`seat fontFamily ${seatEnable ? "" : "disabled-div"
                        }`}
                      style={{ background: colorCodeF(row.bu, row.selected) }}
                      onClick={(e) => handleSeatAllocation(e, rowIndex)}
                    >
                      {values.floor} - {rowIndex + 1}
                    </div>
                ))
                : "No seats found "}
              {allocatedSeatsByGlobal &&
                allocatedSeatsByGlobal.length > 0 &&
                bus &&
                bus.length > 0 &&
                bus.map((bu, i) => (
                  <div className="legendsSeating fontFamily" key={bu.id}>
                    <div
                      className="seat"
                      style={{
                        background: bu.colorCode,
                        height: "15px",
                        width: "15px",
                      }}
                    >
                      {" "}
                    </div>
                    <div>{bu.name} (<b>{getBuCount(bu.id)}</b>)</div>
                  </div>
                ))}
              {seats && seats.length > 0
                && <div className="legendsSeating fontFamily">
                  <div
                    className="seat"
                    style={{
                      background: "#fff",
                      height: "15px",
                      width: "15px",
                    }}
                  >
                    {" "}
                  </div>
                  <div>Available (<b>{getBuCount("")}</b>)</div>
                </div>}
            </Box>
          </Grid>

        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar1}
        autoHideDuration={2000}
        onClose={handleSnackbarClose1}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose1} severity="success" sx={{ width: '100%' }}>
          Seats Removed Successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SeatAllocationAdmin;
