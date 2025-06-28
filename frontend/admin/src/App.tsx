import { useState } from 'react'
import BookingList from './components/BookingList'
import './App.css'

function App() {
  const [workshopId] = useState('00000000-0000-0000-0000-000000000000')

  return (
    <div className="App">
      <h1>Lista rezerwacji</h1>
      <BookingList workshopId={workshopId} />
    </div>
  )
}

export default App
