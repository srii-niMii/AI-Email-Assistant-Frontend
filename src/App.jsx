import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"
import OAuth from "./pages/OAuth";
import PrivateRoute from './components/PrivateRoute';
import OAuth2Redirect from './pages/OAuth2Redirect';
import Register from "./pages/Register";

function App() {

  return (
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        <Route path="/oauth2/code/google" element={<OAuth />} />
            <Route path="/register" element={<Register />} />
      </Routes>
  );
}

export default App;
