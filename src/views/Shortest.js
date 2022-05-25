import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import './Shortest.css'
import stores from './../assets/data/stores'
import routes from './../assets/data/routes'

mapboxgl.accessToken =
  'pk.eyJ1IjoicHJpbWFrdXJuaWF3YW4iLCJhIjoiY2wzamVrOHhvMDZyMzNqbzQ1cmt4anJ0ZCJ9.plWxz32egjvGNLpCZL9uVg'

stores.features.forEach(function (store, i) {
  store.properties.id = i
})

const Shortest = () => {
  const map = useRef(null)

  const [lng, setLng] = useState(5)
  const [lat, setLat] = useState(34)
  const [zoom, setZoom] = useState(1.5)

  const [activeStoreId, setActiveScoreId] = useState(null)

  // Initialize map when component mounts
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [98.61031335121537, 3.511993806470417],
      zoom: 13,
    })

    map.current.on('load', () => {
      map.current.addSource('places', {
        type: 'geojson',
        data: stores,
      })

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routes.routes[0].geometry.coordinates,
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

      buildLocationList(stores.features)
      addMarkers()
    })

    // Clean up on unmount
    return () => map.current.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function buildLocationList(stores) {
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
    })
  }

  function addMarkers() {
    /* For each feature in the GeoJSON object above: */
    for (const marker of stores.features) {
      /* Create a div element for the marker. */
      const el = document.createElement('div')
      /* Assign a unique `id` to the marker. */
      el.id = `marker-${marker.properties.id}`
      /* Assign the `marker` class to each marker for styling. */
      el.className = 'marker'

      /**
       * Create a marker using the div element
       * defined above and add it to the map.
       **/
      new mapboxgl.Marker(el, { offset: [0, -23] })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map.current)
      el.addEventListener('click', (e) => {
        /* Fly to the point */
        flyToStore(marker)
        /* Close all other popups and display popup for clicked store */
        createPopUp(marker)
        /* Highlight listing in sidebar */
        e.stopPropagation()
        setActiveScoreId(marker.properties.id)
      })
    }
  }

  function flyToStore(currentFeature) {
    map.current.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15,
    })
  }

  function createPopUp(currentFeature) {
    const popUps = document.getElementsByClassName('mapboxgl-popup')
    /** Check if there is already a popup on the map and if so, remove it */
    if (popUps[0]) popUps[0].remove()

    new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
        `<h3>${currentFeature.properties.title}</h3><h4>${currentFeature.properties.address}</h4>`,
      )
      .addTo(map.current)
  }

  return (
    <div>
      <div className="sidebarStyle">
        <div className="heading">
          <h1>Our locations</h1>
        </div>
        <div id="listings" className="listings">
          {stores.features.map((store) => {
            return (
              <div
                key={store.properties.id}
                id={`listing-${store.properties.id}`}
                className={`item ${store.properties.id === activeStoreId && 'active'}`}
              >
                <span
                  href="#"
                  id={`link-${store.properties.id}`}
                  className="title"
                  onClick={function () {
                    for (const feature of stores.features) {
                      if (store.properties.id === feature.properties.id) {
                        flyToStore(feature)
                        createPopUp(feature)
                      }
                    }
                    setActiveScoreId(store.properties.id)
                  }}
                >
                  {store.properties.address}
                </span>
                <div>
                  {store.properties.title}{' '}
                  {store.properties.contact ? ` · ${store.properties.contact}` : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div id="map" className="map"></div>

      <div id="instructions">
        <p>
          <strong>Trip duration: {Math.floor(routes.routes[0].duration / 60)} min 🚗 </strong>
        </p>
        <ol>
          {routes.routes[0].legs.map((leg, i) =>
            leg.steps.map((step, i) => <li key={i + i}>{step.maneuver.instruction}</li>),
          )}
        </ol>
      </div>
    </div>
  )
}

export default Shortest
