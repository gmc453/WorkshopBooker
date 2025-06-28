import { useState } from 'react'
import BookingList from './components/BookingList'
import './App.css'

function App() {
  const [workshopId] = useState('616c7175-d74e-4b40-91f5-7630b64ee801')

  return (
    <div className="App">
      <h1>Lista rezerwacji</h1>
      <BookingList workshopId={workshopId} />
    </div>
  )
}

export default App
