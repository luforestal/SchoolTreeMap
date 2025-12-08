/**
 * School Configuration Loader
 * Loads school metadata and provides utilities for multi-school support
 */

const GITHUB_CONFIG = {
  username: 'luforestal',
  repo: 'WilletMap',
  branch: 'main'
}

const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/refs/heads/${GITHUB_CONFIG.branch}`

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((header, i) => {
      obj[header] = values[i] || ''
    })
    return obj
  })
}

/**
 * Load schools configuration from CSV
 */
export async function loadSchools() {
  try {
    const response = await fetch(`${GITHUB_RAW_BASE}/public/schools.csv`)
    if (!response.ok) {
      throw new Error(`Failed to load schools: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    const schools = parseCSV(csvText)
    
    return schools.map(school => ({
      ...school,
      dataUrl: `${GITHUB_RAW_BASE}/public/${school.dataFile}`,
      photosUrl: `${GITHUB_RAW_BASE}/${school.photosFolder}`
    }))
  } catch (error) {
    console.error('Error loading schools:', error)
    throw error
  }
}

/**
 * Get school ID from URL parameter
 * Format: ?school=willet
 */
export function getSchoolIdFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('school') || 'willet' // Default to willet
}

/**
 * Get school configuration by ID
 */
export async function getSchoolConfig(schoolId) {
  const schools = await loadSchools()
  const school = schools.find(s => s.schoolId === schoolId)
  
  if (!school) {
    throw new Error(`School not found: ${schoolId}`)
  }
  
  return school
}

/**
 * Load boundary data for a school
 */
export async function loadSchoolBoundary(boundaryFile) {
  try {
    const response = await fetch(`${GITHUB_RAW_BASE}/public/${boundaryFile}`)
    if (!response.ok) {
      console.warn(`No boundary file found: ${boundaryFile}`)
      return null
    }
    return await response.json()
  } catch (error) {
    console.warn(`Error loading boundary: ${boundaryFile}`, error)
    return null
  }
}

export { GITHUB_CONFIG }
