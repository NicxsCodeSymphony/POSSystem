import Sidebar from './Components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <div className='w-full h-screen'>
      <div className='flex bg-white'>
      <Sidebar />
      <div className='flex-1 bg-[#f8f8f8] px-10'>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/history' element={<History />} />
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </div>
      </div>
    </div>
  );
}

export default App;
