import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AppList from './components/AppList'
import AppForm from './components/AppForm'
import AppDetail from './components/AppDetail'
import ReviewForm from './components/ReviewForm'
import DecisionForm from './components/DecisionForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<AppList />} />
          <Route path="/applications/new" element={<AppForm />} />
          <Route path="/applications/:tracking_number" element={<AppDetail />} />
          <Route path="/applications/:tracking_number/edit" element={<AppForm />} />
          <Route path="/applications/:tracking_number/review" element={<ReviewForm />} />
          <Route path="/applications/:tracking_number/decision" element={<DecisionForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
