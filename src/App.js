import React, { useEffect, useState } from "react"
import GoogleMapReact from "google-map-react"
import useSupercluster from "use-supercluster"
import "./App.css"
import FilterBox from './FilterBox'

const Marker = ({ children }) => children;

export default function App() {
  const [bounds, setBounds] = useState(null)
  const [zoom, setZoom] = useState(10)
  const [fetchedAgencies, setFetchedAgencies] = useState([])
  const [fetchedVehicles, setFetchedVehicles] = useState([])


  useEffect(() => {
    fetchAgenciesAndVehicles()
  }, [])

  // used API https://rapidapi.com/transloc/api/openapi-1-2/
  async function fetchAgenciesAndVehicles() {
    const fetchOptions = {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
        "x-rapidapi-key": "e421d6bb00mshb47d9e872e3f44ap174df9jsnfc0aaeec5f7b"
      }
    }

    const url = 'https://transloc-api-1-2.p.rapidapi.com'
    const agenciesEndPoint = '/agencies.json'

    try{
      let { data: agenciesResponse } = await (await fetch(url + agenciesEndPoint, fetchOptions)).json()
      // console.log('AGENCIES:', agenciesResponse);
      setFetchedAgencies(agenciesResponse)

        // %2C is a comma ( , ) for URL address
        // agency IDs are required to fetch for vehicles
        // I fetched all agencies and grouped them as one big parameter to search all the available vehicles
      let combinedLinkWithAgencies = agenciesResponse.map(agency => agency.agency_id).join('%2C')

      // 12 is a default agency ID if something goes wrong with above fetch
      const vehiclesEndPoint = `/vehicles.json?agencies=${combinedLinkWithAgencies || 12}`
      let { data: vehiclesResponse } = await (await fetch(url + vehiclesEndPoint, fetchOptions)).json()

        // creating variable 'agency_id' in vehicle value from it's KEY - it will be required to match Agency name for vehicles in markers/pins on the map
        // flat was required to easier map through each vehicle object
      vehiclesResponse = Object.entries(vehiclesResponse).map(vehicle => vehicle[1].map(item => ({ agency_id: vehicle[0], ...item}))).flat()

      // creating extra parameters to Vehicles, because API is really poor with this
      vehiclesResponse = vehiclesResponse.map(vehicle => ({ 
          // matching above KEY to get agency name for every vehicle
          agency_name: agenciesResponse.find(agency => agency.agency_id === vehicle.agency_id)?.long_name,
          fuel: (Math.floor(Math.random() * 95)+5), // generates random fuel fill level
          seats: (Math.floor(Math.random()*7)+2),
          ...vehicle
      }))

      // console.log('VEHICLES:', vehiclesResponse)
      setFetchedVehicles(vehiclesResponse)
    } 
    catch(error) {console.error(error)}
  }

    // rebuilding structure to stick with 'use-supercluster' naming convention
  let points = Object.values(fetchedVehicles).map((vehicle) => ({
        properties: {
          id: vehicle.vehicle_id,
          agency_id: vehicle.agency_id,
          type: 'vehicle',
           // 'speed' simulates vehicle availability - IF speed is NOT 0 then vehicle is reserved/busy
          available: vehicle.speed > 0 ? false : true,
          name: vehicle.agency_name,
          code: vehicle.call_name,
          fuel: vehicle.fuel,
          seats: vehicle.seats
        },
        geometry: {
          coordinates: [
            parseFloat(vehicle.location?.lng),
            parseFloat(vehicle.location?.lat)
          ]
        }
      })
    )

      // agencies showed as PARKINGS for all these vehicles
    points.push(...Object.values(fetchedAgencies).map((agency) => ({
      properties: {
        id: agency.agency_id,
        type: 'parking',
        available: null,
        name: agency.long_name,
      },
      geometry: {
        coordinates: [
          parseFloat(agency.position?.lng),
          parseFloat(agency.position?.lat)
        ]
      }
    })
  ))
  // console.log(points);

  function setPopup() {
    Array.from(document.querySelectorAll('.popup')).map(popup => popup.classList.remove('active-popup'))
    document.querySelector(`#${document.activeElement.id}-popup`).classList.add('active-popup')
  }

  const { clusters } = useSupercluster({
    points, bounds, zoom,
    options: {
      radius: 100,
      maxZoom: 20
    }
  })
  
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <FilterBox toggleRefresh={() => fetchAgenciesAndVehicles()}/>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyCEFy8n9HJuBcfOmBxVEQ1NAW8zbfag3sg' }}
        defaultCenter={{ lat: 35.9695, lng: -83.9511 }}
        defaultZoom={5}
        // yesIWantToUseGoogleMapApiInternals
        onChange={({ zoom, bounds }) => {
          setZoom(zoom);
          setBounds([
            bounds.nw.lng,
            bounds.se.lat,
            bounds.se.lng,
            bounds.nw.lat
          ]);
        }}
      >
        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates
          const {
            cluster: isCluster,
            point_count,
            type: markerType,
            name: agencyName,
            code: vehicleCode,
            available, fuel, seats
          } = cluster.properties
          
          
          // When there are too many pins in the specific area then we need to group them in one cluster
          if (isCluster) {
            return (
              <Marker
              key={`cluster-${cluster.id}`}
              lat={latitude}
              lng={longitude}
              >
                <div className="cluster-marker"
                  style={{
                    width: `${25 + (point_count / points.length) * 30}px`,
                    height: `${25 + (point_count / points.length) * 30}px`
                  }}
                > {point_count} </div>
              </Marker>
            );
          }
          
          // individual pins/markers
          return (
            <Marker
              key={`${markerType}-${cluster.properties.id}`}
              lat={latitude}
              lng={longitude}
            >
              <div className='pin-container' onClick={() => setPopup(cluster.properties.id, true)}>
                <button id={`${markerType}-${cluster.properties.id}`} className={`pin pin__${markerType} ${available === true ? 'green' : 
                (available === false ? 'red' : '')}`}>
                  <i className={`fa-solid ${markerType === 'vehicle' ? 'fa-car' : 'fa-square-parking'}`}></i>
                </button>
              </div>
              <div id={`${markerType}-${cluster.properties.id}-popup`} className="popup" style={{width: '200px'}}>
                <div className="close-popup" onClick={(e) => e.target.parentElement.classList.remove('active-popup')}>&times;</div>
                <span style={{fontWeight: 'bold', fontSize: '0.75rem'}}> {agencyName && `Agency name: ${agencyName}`} </span>
                <span> {vehicleCode && `Vehicle Code: ${vehicleCode}`} </span>
                <span> {available !== null && `Available: ${String(available)}`} </span>
                <span> {fuel && `FUEL: ${fuel}%`} </span>
                <span> {seats && `${seats}-Passenger`} </span>
              </div>
            </Marker>
          );
        })}
      </GoogleMapReact>
    </div>
  );
}