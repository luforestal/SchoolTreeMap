import React, { useState, useEffect } from 'react'
import { loadSchools } from '../utils/schoolLoader'
import './HomePage.css'

const HomePage = () => {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsList = await loadSchools()
        setSchools(schoolsList)
        setLoading(false)
      } catch (error) {
        console.error('Error loading schools:', error)
        setLoading(false)
      }
    }
    fetchSchools()
  }, [])

  const handleSchoolSelect = (schoolId) => {
    if (schoolId) {
      window.location.href = `?school=${schoolId}`
    }
  }

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🌳 School Tree Inventory Maps</h1>
          <p className="hero-subtitle">
            Interactive tree mapping for educational institutions
          </p>
          
          <div className="school-selector">
            <label htmlFor="school-select">Select a School:</label>
            <select 
              id="school-select"
              onChange={(e) => handleSchoolSelect(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Choose a school...</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.schoolName}
                </option>
              ))}
            </select>
          </div>

          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Interactive Maps</h3>
              <p>Explore tree locations on detailed campus maps</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Tree Photos</h3>
              <p>View high-quality photos of each tree</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Tree Data</h3>
              <p>Access detailed information about species, size, and health</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Search & Filter</h3>
              <p>Find trees by code, genus, or species</p>
            </div>
          </div>

          <div className="school-grid">
            <h2>Our Schools</h2>
            <div className="school-cards">
              {loading ? (
                <p>Loading schools...</p>
              ) : (
                schools.map(school => (
                  <div 
                    key={school.id} 
                    className="school-card"
                    onClick={() => handleSchoolSelect(school.id)}
                  >
                    <div className="school-card-content">
                      <h3>{school.schoolName}</h3>
                      {school.address && <p className="school-address">{school.address}</p>}
                      <button className="view-map-btn">View Map →</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
