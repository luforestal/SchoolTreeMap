/**
 * CSV Parser and Tree Data Processor
 * Dynamically loads tree data from CSV file
 */

// Color palette for different genera
const COLORS = [
  'red', 'blue', 'green', 'purple', 'orange',
  'darkred', 'darkblue', 'darkgreen', 'cadetblue',
  'pink', 'black', 'gray'
]

// Shape configurations
const SHAPES = [
  { sides: 3, rotation: 0 },    // triangle
  { sides: 4, rotation: 45 },   // diamond
  { sides: 5, rotation: 0 },    // pentagon
  { sides: 6, rotation: 0 },    // hexagon
  { sides: 8, rotation: 0 },    // octagon
  { sides: 3, rotation: 180 },  // inverted triangle
  { sides: 4, rotation: 0 }     // square
]

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
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
 * Load and process tree data from CSV
 */
export async function loadTreeData(csvPath = '/tree_data.csv', githubConfig = {}) {
  const { photosUrl = '' } = githubConfig
  
  try {
    const response = await fetch(csvPath)
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    const rawData = parseCSV(csvText)
    
    // Get unique genera and assign colors/shapes
    const genera = [...new Set(rawData.map(row => row.genus).filter(g => g))]
    const genusStyles = {}
    
    genera.forEach((genus, index) => {
      genusStyles[genus] = {
        color: COLORS[index % COLORS.length],
        shape: SHAPES[index % SHAPES.length]
      }
    })
    
    // Process tree data
    const trees = rawData.map(row => {
      const genus = row.genus || 'Unknown'
      const style = genusStyles[genus] || {
        color: 'gray',
        shape: { sides: 4, rotation: 0 }
      }
      
      // Calculate crown radius
      let crownRadius = null
      const crownNS = parseFloat(row.crownNSm || row.crownNS)
      const crownEW = parseFloat(row.crownEWm || row.crownEW)
      
      if (!isNaN(crownNS) && !isNaN(crownEW)) {
        crownRadius = ((crownNS + crownEW) / 4) * 5 // Convert meters to pixels at zoom 18
      } else if (!isNaN(crownNS)) {
        crownRadius = (crownNS / 2) * 5
      } else if (!isNaN(crownEW)) {
        crownRadius = (crownEW / 2) * 5
      }
      
      // Store tree code for on-demand photo loading
      const treeCode = row.treecode || row.treeCode || ''
      
      // Get photo path - either from CSV or construct from base URL
      let photoUrl = null
      if (row.photoPath) {
        // If photoPath starts with /, prepend base path for GitHub Pages
        photoUrl = row.photoPath.startsWith('/') ? `/SchoolTreeMap${row.photoPath}` : row.photoPath
      } else if (treeCode && photosUrl) {
        photoUrl = `${photosUrl}/${treeCode}.jpg`
      }
      
      const lat = parseFloat(row.lat)
      const lon = parseFloat(row.lon)
      
      return {
        treeCode: treeCode,
        lat,
        lon,
        genus: row.genus || '',
        species: row.species || '',
        dbh: row.dbh || '',
        height: row.height || '',
        crownNS: crownNS || null,
        crownEW: crownEW || null,
        crownRadius,
        color: style.color,
        shape: style.shape,
        photoUrl: photoUrl // Full photo URL
      }
    })
    
    // Filter out trees with invalid coordinates
    const validTrees = trees.filter(tree => {
      if (isNaN(tree.lat) || isNaN(tree.lon)) {
        console.warn(`Skipping tree ${tree.treeCode} with invalid coordinates: (${tree.lat}, ${tree.lon})`)
        return false
      }
      return true
    })
    
    return { trees: validTrees, genusStyles }
    
  } catch (error) {
    console.error('Error loading tree data:', error)
    throw error
  }
}

/**
 * Get genus legend data
 */
export function getGenusLegend(genusStyles) {
  return Object.entries(genusStyles).map(([genus, style]) => ({
    genus,
    color: style.color,
    shape: style.shape
  }))
}
