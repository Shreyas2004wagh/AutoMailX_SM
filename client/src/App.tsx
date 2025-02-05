import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';  // Import the LandingPage component
import Content from './Pages/Content';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/content" element={<Content />} />
        <Route path="/Login" element={<Login/>} />
        <Route path="/SignUp" element={<SignUp/>} />
      </Routes>
    </Router>
  );
};

export default App;
