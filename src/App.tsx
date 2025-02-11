import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BettingCalculator from './components/BettingCalculator';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen dark bg-background">
        <Routes>
          <Route path="/" element={<BettingCalculator />} />
          <Route path="/bet/:id" element={<BettingCalculator />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;