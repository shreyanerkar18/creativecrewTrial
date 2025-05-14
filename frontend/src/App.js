import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Admin from "./Admin";
import "./App.css";
import  Employee  from "./Employee";
import Header from "./Header";
import Hoe from "./Hoe";
import Manager from './Manager';
import Login from "./Login";
import Signup from "./Signup";
// import AuthProvider from "./AuthProvider";
import ProtectedRoute from "./ProtectedRoute";
import ConfigureSeatAllocation from "./configureSeatAllocation";
import SeatAllocation from "./seatAllocation";
import SeatAllocationAdmin from "./seatAllocationAdmin";
import ConditionalExport from "./ConditionalExport";
import AllocationPlanning from "./AllocationPlanning";
import Profile from "./Profile";
import HoePlan from "./HOEplan";
import NoShowSeats from "./NoShowSeats";
import SeatPool from "./SeatPool";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>

          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
         
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/hoe" element={<Hoe />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/seatAllocation" element={<SeatAllocation />}></Route>
            <Route
              path="/seatAllocationAdmin"
              element={<SeatAllocationAdmin />}
            ></Route>
            <Route
              path="/configureSeatAllocation"
              element={<ConfigureSeatAllocation />}
            ></Route>
             { /* <Route path="/graph" element={<BUWiseChart />} />  */ }
             <Route path="/graph" element={<ConditionalExport />} />
             <Route path="/plan" element={<AllocationPlanning />} />
             <Route path="/hoeplan" element={<HoePlan />} />
             <Route path="/noShowSeats" element={<NoShowSeats />} />
             <Route path="/seatpool" element={<SeatPool />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;