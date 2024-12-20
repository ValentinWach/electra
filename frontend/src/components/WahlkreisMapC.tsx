import {MapContainer, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {LatLngExpression} from 'leaflet';
import geoData from '../assets/Wahl.json';
import {GeoJsonObject, Feature} from 'geojson';
import L from 'leaflet';
import {useEffect, useState} from "react";
import {fetchWinningPartiesWahlkreise} from "../apiServices.ts";
import {WinningParties} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import {getPartyColor} from "../utils/utils.tsx";
import ChartTileC from "./ChartTileC.tsx";
import {DropdownType} from "../models/ChartData.ts";

export default function WahlkreisMapC() {
    let mapDD: DropdownType = {
        label: undefined,
        defaultChosen: 2,
        items: [{
            label: "Erststimmen",
            id: 1
        },
            {
                label: "Zweitstimmen",
                id: 2
            }
        ]
    }

    const {selectedElection} = useElection();
    const [winningParties, setWinningParties] = useState<WinningParties>()
    const [stimmenType, setStimmenType] = useState(mapDD.defaultChosen);
    useEffect(() => {
        const getWinningParties = async () => {
            try {
                const data = await fetchWinningPartiesWahlkreise(selectedElection?.id ?? 0);
                console.log(data)
                setWinningParties(data);
            } catch (error) {
                console.error('Error fetching Wahlkreis Overview:', error);
            }
        }
        getWinningParties()
    }, [selectedElection]);

    const center: LatLngExpression = [51.1657, 10.4515];


    // Ensure geoData is typed correctly
    const typedGeoData: GeoJsonObject = geoData as GeoJsonObject;

    // Function to set the style for each feature
    const getStyle = (feature: Feature | undefined) => {
        const winningParty =
            stimmenType === 1 ?
                winningParties?.erststimme.find(w => w.regionId === feature?.properties?.WKR_NR)?.party
                :
                winningParties?.zweitstimme.find(w => w.regionId === feature?.properties?.WKR_NR)?.party

        return {
            color: 'black',
            weight: 2,
            fillColor: getPartyColor(winningParty?.shortname ?? "gray"),
            fillOpacity: 0.7
        };
    };

    //Tooltips
    const onEachFeature = (feature: Feature, layer: L.Layer) => {
        console.log(feature.properties)
        console.log(winningParties)
        const winningParty = winningParties?.zweitstimme.find(w => w.regionId === feature.properties?.WKR_NR)?.party
        layer.bindTooltip(winningParty?.shortname ?? "Leider ist ein Fehler aufgetreten", {
            permanent: false,
            direction: 'top'
        });
    };

    return (
        <ChartTileC dropDownContent={mapDD} dropDownFunction={setStimmenType} doubleSize={true}
                    header={"Wahlkreiskarte"}>
            <MapContainer center={center} zoomControl={true} doubleClickZoom={true} scrollWheelZoom={false} zoom={6.5}
                          style={{height: '100vh', width: '100%'}}>
                {typedGeoData && winningParties && (
                    <GeoJSON data={typedGeoData} style={getStyle} onEachFeature={onEachFeature}/>
                )}
            </MapContainer>
        </ChartTileC>
    );
}