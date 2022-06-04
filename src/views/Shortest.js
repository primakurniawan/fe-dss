import React, { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import './Shortest.css'
import axios from 'axios'
import { useSelector } from 'react-redux'

mapboxgl.accessToken =
  'pk.eyJ1IjoicHJpbWFrdXJuaWF3YW4iLCJhIjoiY2wzamVrOHhvMDZyMzNqbzQ1cmt4anJ0ZCJ9.plWxz32egjvGNLpCZL9uVg'

const Shortest = () => {
  const [stores, setStores] = useState([])
  const [route, setRoute] = useState({})
  const map = useRef(null)
  const mapContainer = useRef(null)
  const point = useRef(null)
  const popUp = useRef(null)
  const markers = useRef([])

  const [currentCoordinates, setCurrentCoordinates] = useState([0, 0])

  const [activeStoreId, setActiveStoreId] = useState(null)

  const { selected } = useSelector((state) => state.categories)

  const getStores = async (category_id) => {
    const response = await axios.get(`http://localhost:3000/stores?category_id=${category_id}`)
    setStores((prevState) => response.data.data)
  }

  const getRoutes = useCallback(
    async (store_id) => {
      const response = await axios.get(
        `http://localhost:3000/stores/shortest?category_id=${selected}&current_location=[${currentCoordinates}]&store_id=${store_id}`,
      )
      setRoute((prevState) => response.data.data.routes[0])

      if (map.current.getLayer('route')) map.current.removeLayer('route')
      if (map.current.getSource('route')) map.current.removeSource('route')

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
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
    [currentCoordinates, selected],
  )

  // Initialize map when component mounts
  useEffect(() => {
    getStores(selected)
    navigator.geolocation.getCurrentPosition(function (position) {
      setCurrentCoordinates((prevState) => [position.coords.longitude, position.coords.latitude])
    })
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: currentCoordinates,
      zoom: 13,
    })

    // Clean up on unmount
    return () => map.current.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getStores(selected)
    if (map.current.getLayer('route')) map.current.removeLayer('route')
    if (map.current.getSource('route')) map.current.removeSource('route')
    if (popUp.current) popUp.current.remove()
    map.current.flyTo({ center: currentCoordinates })
    setActiveStoreId(null)
  }, [currentCoordinates, selected])

  useEffect(() => {
    if (point.current) {
      point.current.remove()
      if (map.current.getLayer('point')) map.current.removeLayer('point')
      if (map.current.getSource('point')) map.current.removeSource('point')
    }

    // Create a new marker.
    point.current = new mapboxgl.Marker().setLngLat(currentCoordinates).addTo(map.current)

    map.current.on('load', () => {
      map.current.addSource('point', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: currentCoordinates,
          },
        },
      })

      map.current.addLayer({
        id: 'point',
        type: 'symbol',
        source: 'point',
      })
    })

    map.current.flyTo({ center: currentCoordinates })
  }, [currentCoordinates])

  const addMarkers = useCallback(
    (stores) => {
      if (markers.current) {
        markers.current.forEach((e, i) => {
          markers.current[i].remove()
        })
      }
      /* For each feature in the GeoJSON object above: */
      stores.forEach((store, index) => {
        /* Create a div element for the marker. */
        const el = document.createElement('div')
        /* Assign a unique `id` to the marker. */
        el.id = `marker-${store.id}`
        /* Assign the `marker` class to each marker for styling. */
        el.className = 'marker'

        /**
         * Create a marker using the div element
         * defined above and add it to the map.
         **/
        markers.current[index] = new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat([store.lon, store.lat])
          .addTo(map.current)
        el.addEventListener('click', (e) => {
          if (store.id !== activeStoreId) {
            setActiveStoreId(store.id)
            flyToStore(store)
            createPopUp(store)
            getRoutes(store.id)
          } else {
            setActiveStoreId(null)
            flyToPoint(currentCoordinates)
            popUp.current.remove()
            if (map.current.getLayer('route')) map.current.removeLayer('route')
            if (map.current.getSource('route')) map.current.removeSource('route')
          }

          e.stopPropagation()
        })
      })
    },
    [activeStoreId, currentCoordinates, getRoutes],
  )

  useEffect(() => {
    addMarkers(stores)
  }, [addMarkers, stores])

  function flyToStore(currentFeature) {
    map.current.flyTo({
      center: [currentFeature.lon, currentFeature.lat],
      zoom: 13,
    })
  }

  function flyToPoint(currentPosition) {
    map.current.flyTo({
      center: currentPosition,
      zoom: 13,
    })
  }

  function createPopUp(currentFeature) {
    if (popUp.current) popUp.current.remove()

    popUp.current = new mapboxgl.Popup({ closeOnClick: false })
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
                        if (e.id !== activeStoreId) {
                          setActiveStoreId(store.id)
                          flyToStore(e)
                          createPopUp(e)
                          getRoutes(e.id)
                        } else {
                          setActiveStoreId(null)
                          flyToPoint(currentCoordinates)
                          popUp.current.remove()
                          if (map.current.getLayer('route')) map.current.removeLayer('route')
                          if (map.current.getSource('route')) map.current.removeSource('route')
                        }
                      }
                    }
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
      <div id="map" className="map" ref={mapContainer}></div>
      {route?.legs?.length > 0 && activeStoreId && (
        <div id="instructions">
          <p>
            <strong>Trip duration: {Math.floor(route.duration / 60)} min 🕰️ </strong>
            <br />
            <strong>Trip distance: {Math.floor(route.distance / 1000)} km 🚗 </strong>
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
