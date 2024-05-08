import './App.css';
import FileManagement from './FileManagement';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/:nodeName" element={<FileManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

