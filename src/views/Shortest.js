import React, { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import './Shortest.css'
import axios from 'axios'

mapboxgl.accessToken =
  'pk.eyJ1IjoicHJpbWFrdXJuaWF3YW4iLCJhIjoiY2wzamVrOHhvMDZyMzNqbzQ1cmt4anJ0ZCJ9.plWxz32egjvGNLpCZL9uVg'

// stores.features.forEach(function (store, i) {
//   store.properties.id = i
// })

const Shortest = () => {
  const [stores, setStores] = useState([])
  const [route, setRoute] = useState({})
  const [storesFeatures, setStoresFeatures] = useState({})
  const map = useRef(null)

  const [currentCoordinates, setCurrentCoordinates] = useState([0, 0])

  const [activeStoreId, setActiveScoreId] = useState(null)
  const [firstClick, setFirstClick] = useState(true)

  const getStores = async () => {
    const response = await axios.get('http://localhost:3000/stores')
    setStores((prevState) => response.data.data)
  }

  const getRoutes = useCallback(
    async (store_id) => {
      const response = await axios.post('http://localhost:3000/stores/shortest', {
        current_location: currentCoordinates,
        store_id: store_id ?? activeStoreId,
      })
      setRoute((prevState) => response.data.data.routes[0])

      if (!firstClick) {
        map.current.removeLayer('route')
        map.current.removeSource('route')
      }
      setFirstClick(false)
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: response.data.data.routes[0].geometry.coordinates,
          },
        },
      })

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#888',
          'line-width': 8,
        },
      })
    },
    [activeStoreId, currentCoordinates, firstClick],
  )

  // Initialize map when component mounts
  useEffect(() => {
    getStores()
    navigator.geolocation.getCurrentPosition(function (position) {
      setCurrentCoordinates((prevState) => [position.coords.longitude, position.coords.latitude])
    })
    map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: currentCoordinates,
      zoom: 13,
    })

    map.current.on('load', () => {
      map.current.addSource('places', {
        type: 'geojson',
        data: storesFeatures,
      })
    })

    buildLocationList()
    addMarkers()

    // Clean up on unmount
    return () => map.current.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setStoresFeatures((prevState) =>
      stores.map((e) => {
        return {
          type: 'Feature',
          properties: {
            name: e.name,
            address: e.name,
            contact: e?.contact,
          },
          geometry: {
            coordinates: [e.lon, e.lat],
            type: 'Point',
          },
        }
      }),
    )
  }, [stores])

  useEffect(() => {
    // Create a new marker.
    new mapboxgl.Marker().setLngLat(currentCoordinates).addTo(map.current)
    map.current.loadImage(
      'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      (error, image) => {
        if (error) throw error
        map.current.addImage('custom-marker', image)
        // Add a GeoJSON source with 2 points
        map.current.addSource('point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                // feature for Mapbox SF
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: currentCoordinates,
                },
                properties: {
                  title: 'Start Position',
                },
              },
            ],
          },
        })

        // Add a symbol layer
        map.current.addLayer({
          id: 'point',
          type: 'symbol',
          source: 'point',
          layout: {
            'icon-image': 'custom-marker',
            // get the title name from the source's "title" property
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 1.25],
            'text-anchor': 'top',
          },
        })
      },
    )

    map.current.flyTo({ center: currentCoordinates })
  }, [currentCoordinates])

  function buildLocationList() {
    map.current.on('click', (event) => {
      /* Determine if a feature in the "locations" layer exists at that point. */
      const features = map.current.queryRenderedFeatures(event.point, {
        layers: ['locations'],
      })

      /* If it does not exist, return */
      if (!features.length) return

      const clickedPoint = features[0]

      /* Fly to the point */
      flyToStore(clickedPoint)

      /* Close all other popups and display popup for clicked store */
      createPopUp(clickedPoint)

      getRoutes(clickedPoint.id)
    })
  }

  const addMarkers = useCallback(() => {
    /* For each feature in the GeoJSON object above: */
    for (const marker of stores) {
      /* Create a div element for the marker. */
      const el = document.createElement('div')
      /* Assign a unique `id` to the marker. */
      el.id = `marker-${marker.id}`
      /* Assign the `marker` class to each marker for styling. */
      el.className = 'marker'

      /**
       * Create a marker using the div element
       * defined above and add it to the map.
       **/
      new mapboxgl.Marker(el, { offset: [0, -23] })
        .setLngLat([marker.lon, marker.lat])
        .addTo(map.current)
      el.addEventListener('click', (e) => {
        /* Fly to the point */
        flyToStore(marker)
        /* Close all other popups and display popup for clicked store */
        createPopUp(marker)

        getRoutes(marker.id)
        e.stopPropagation()
        setActiveScoreId(marker.id)
      })
    }
  }, [getRoutes, stores])

  useEffect(() => {
    addMarkers()
  }, [addMarkers, stores])

  function flyToStore(currentFeature) {
    map.current.flyTo({
      center: [currentFeature.lon, currentFeature.lat],
      zoom: 15,
    })
  }

  function createPopUp(currentFeature) {
    const popUps = document.getElementsByClassName('mapboxgl-popup')
    /** Check if there is already a popup on the map and if so, remove it */
    if (popUps[0]) popUps[0].remove()

    new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat([currentFeature.lon, currentFeature.lat])
      .setHTML(`<h3>${currentFeature.name}</h3><h4>${currentFeature.address}</h4>`)
      .addTo(map.current)
  }

  return (
    <div>
      <div className="sidebarStyle">
        <div className="heading">
          <h1>Our locations</h1>
        </div>
        <div id="listings" className="listings">
          {stores.length > 0 &&
            stores.map((store) => {
              return (
                <div
                  key={store.id}
                  id={`listing-${store.id}`}
                  className={`item ${store.id === activeStoreId ? 'active' : ''}`}
                  onClick={function () {
                    for (const e of stores) {
                      if (store.id === e.id) {
                        flyToStore(e)
                        createPopUp(e)
                        getRoutes(e.id)
                      }
                    }
                    setActiveScoreId(store.id)
                  }}
                >
                  <span
                    id={`link-${store.id}`}
                    className={`title ${store.id === activeStoreId ? 'active' : ''}`}
                  >
                    {store.name}
                  </span>
                  <div>
                    <small>{store.address}</small>
                    <br />
                    <small>{store?.contact}</small>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <div id="map" className="map"></div>
      {route?.legs?.length > 0 && (
        <div id="instructions">
          <p>
            <strong>Trip duration: {Math.floor(route.duration / 60)} min 🚗 </strong>
            <strong>Trip distance: {Math.floor(route.distance / 100)} km 🚗 </strong>
          </p>
          <ol>
            {route.legs.map((leg, i) =>
              leg.steps.map((step, j) => <li key={`${i}${j}`}>{step.maneuver.instruction}</li>),
            )}
          </ol>
        </div>
      )}
    </div>
  )
}

export default Shortest
