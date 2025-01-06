import {MapContainer, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {LatLngExpression} from 'leaflet';
import geoData from '../../../assets/Wahl.json';
import {GeoJsonObject, Feature} from 'geojson';
import L from 'leaflet';
import {useEffect, useState} from "react";
import {fetchWinningPartiesWahlkreise} from "../../../apiServices.ts";
import {WinningParties} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import {getPartyColor} from "../../../utils/utils.tsx";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import {DropdownData} from "../../../models/DropDownData.ts";
import './WahlkreisMapC.css';
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";
export default function WahlkreisMapC( {openDetails}: {openDetails: (id: number) => void} ) {
    let mapDD: DropdownData = {
        label: undefined,
        defaultChosenId: 2,
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
    const [stimmenType, setStimmenType] = useState(mapDD.defaultChosenId);
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getWinningParties = async () => {
            try {
                setLoading(true);
                const data = await fetchWinningPartiesWahlkreise(selectedElection?.id ?? 0);
                setWinningParties(data);
            } catch (error) {
                console.error('Error fetching Wahlkreis Overview:', error);
            } finally {
                setLoading(false);
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
            fillColor: getPartyColor(winningParty?.shortname ?? "gray", true),
            fillOpacity: 1
        };
    };

    //Tooltips
    const onEachFeature = (feature: Feature, layer: L.Layer) => {
        const winningParty = winningParties?.zweitstimme.find(w => w.regionId === feature.properties?.WKR_NR);
        const party = winningParty?.party;
        const regionId = winningParty?.regionId;
        const regionName = winningParty?.regionName;
        layer.bindTooltip(`WK ${regionId ?? "(unknown region id)"}: ${regionName ?? "(unknown region name)"}: <br> ${party?.shortname ?? "unknown party name"}`, {
            permanent: false,
            direction: 'top',
            className: 'tooltip',
        });
        layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e as any);
            if (regionId) {
                openDetails(regionId);
            }
        });
    };

    return (
        <ContentTileC dropDownContent={mapDD} dropDownFunction={setStimmenType} doubleSize={true}
                    header={"Wahlkreiskarte"} loading={showLoader}>
            <MapContainer center={center} zoomControl={true} doubleClickZoom={true} scrollWheelZoom={false} zoom={6.5}
                          style={{height: '90vh', width: '100%', zIndex: '10'}}>
                {typedGeoData && winningParties && (
                    <GeoJSON data={typedGeoData} style={getStyle} onEachFeature={onEachFeature}/>
                )}
            </MapContainer>
        </ContentTileC>
    );
}