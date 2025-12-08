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
  const headers = parseCSVLine(lines[0])
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const obj = {}
    headers.forEach((header, i) => {
      obj[header] = values[i] || ''
    })
    return obj
  })
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  
  return values
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
      id: school.id,
      school_name: school.school_name,
      logo: school.logo,
      address: school.address,
      data_file: school.data_file || `trees/${school.id}.csv`,
      boundary_file: school.boundary_file || `boundaries/${school.id}.geojson`,
      photos_folder: school.photos_folder || `public/photos/${school.id}`,
      dataUrl: `${GITHUB_RAW_BASE}/public/${school.data_file || `trees/${school.id}.csv`}`,
      boundaryUrl: `${GITHUB_RAW_BASE}/public/${school.boundary_file || `boundaries/${school.id}.geojson`}`,
      photosUrl: `${GITHUB_RAW_BASE}/${school.photos_folder || `public/photos/${school.id}`}`
    }))
  } catch (error) {
    console.error('Error loading schools:', error)
    throw error
  }
}

/**
 * Get school ID from URL parameter
 * Format: ?school=wildav
 */
export function getSchoolIdFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('school') || 'wildav' // Default to wildav
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
