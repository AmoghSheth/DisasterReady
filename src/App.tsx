import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Register from "./pages/Register";
import Login from "./pages/Login";
import LocationSetup from "./pages/LocationSetup";
import HouseholdSetup from "./pages/HouseholdSetup";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Plan from "./pages/Plan";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/location-setup" element={<LocationSetup />} />
      <Route path="/household-setup" element={<HouseholdSetup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/plan" element={<Plan />} />
      <Route path="/map" element={<Map />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;