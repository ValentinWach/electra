import { useState, useEffect, useRef } from "react";
import { useElection } from "../../../context/ElectionContext";
import { Berufsgruppen, Partei } from "../../../api";
import { fetchBerufsgruppen } from "../../../apiServices";
import { DropdownData } from "../../../models/DropDownData";
import ContentTileC from "../../UI-element-components/ContentTileC";
import * as d3 from 'd3';
import { useResizeDetector } from 'react-resize-detector';
import { GridData } from "../../../models/GridData";
import GridC from "../../UI-element-components/GridC";
import CheckboxC from "../../UI-element-components/CheckboxC";
import AlertC from "../../UI-element-components/AlertC";
import { AlertType } from "../../../models/AlertData";
interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    value: number;
    radius: number;
    color: string;
}

export default function BerufsgruppenC({ parteien }: { parteien: Partei[] }) {
    const { selectedElection } = useElection();
    const [selectedParteiId, setSelectedParteiId] = useState<number | null>(null);
    const [dataIsAvailable, setDataIsAvailable] = useState<boolean>(true);
    const [berufsgruppenGridData, setBerufsgruppenGridData] = useState<GridData>({ columns: [], rows: [] });
    const [showBundestagsabgeordneteOnly, setShowBundestagsabgeordneteOnly] = useState<boolean>(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const { width: containerWidth, ref } = useResizeDetector();
    const svgRef = useRef<SVGSVGElement>(null);
    const PADDING = 40;
    const CHART_HEIGHT = 500;
    
    // Create tooltip once
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(33, 33, 33, 0.85)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 4px 6px rgba(0,0,0,0.3)")
        .style("font-size", "13px")
        .style("line-height", "1.4")
        .style("pointer-events", "none")
        .style("border", "1px solid rgba(255,255,255,0.1)")
        .style("opacity", "0")
        .style("transition", "opacity 0.15s ease-in-out");

    // Create a larger color palette by combining multiple D3 color schemes
    const colorScale = d3.scaleOrdinal()
        .range([
            ...d3.schemeCategory10,
            ...d3.schemeTableau10,
            ...d3.schemePaired,
            ...d3.schemeSet3,
        ].filter((color, index, self) => self.indexOf(color) === index)); // Remove any duplicates

    // Effect for visualization updates
    useEffect(() => {
        async function fetchData() {
            const data = await fetchBerufsgruppen(selectedElection?.id ?? 0, selectedParteiId ?? 0, showBundestagsabgeordneteOnly);
            if (!data.berufsgruppen || data.berufsgruppen.length === 0) {
                console.log("No data available");
                setDataIsAvailable(false);
                return;
            }
            setDataIsAvailable(true);
            createVisualization(data);
            updateGridData(data);
        }
        fetchData();
    }, [selectedParteiId, selectedElection, parteien, containerWidth, showBundestagsabgeordneteOnly]);

    // Function to prepare nodes data
    const prepareNodes = (data: any, width: number, height: number) => {
        const baseRadius = Math.sqrt(width * height / (data.berufsgruppen.length * Math.PI)) / 8;

        return data.berufsgruppen.map((b: any, i: number) => ({
            id: b.name,
            name: b.name,
            value: b.share,
            radius: Math.sqrt(b.share) * baseRadius,
            color: colorScale(i.toString())
        }));
    };

    const updateGridData = (data: Berufsgruppen) => {
        if (!data.berufsgruppen) return;
        const berufsgruppen = data.berufsgruppen
        const berufsgruppenGridData: GridData = {
            columns: [
                { id: 1, label: 'Berufsgruppe', searchable: true },
                { id: 2, label: 'Anteil', searchable: false },
                { id: 3, label: 'Absolut', searchable: false }
            ],
            rows: berufsgruppen.map((b, index) => ({
                key: index,
                values: [
                    { column_id: 1, value: b.name },
                    { column_id: 2, value: b.share.toString() + '%' },
                    { column_id: 3, value: b.absolute?.toString() ?? '' }
                ]
            }))
        };
        setBerufsgruppenGridData(berufsgruppenGridData);
    }

    // Function to create/update visualization
    const createVisualization = async (data: Berufsgruppen) => {
        if (!svgRef.current || !containerWidth) return;

        const width = containerWidth;
        const height = CHART_HEIGHT;

        // Prepare new nodes
        const newNodes = prepareNodes(data, width, height);
        setNodes(newNodes);

        let svg = d3.select(svgRef.current);

        // Initialize SVG if it's empty
        if (svg.select("defs").empty()) {
            // Clear and initialize SVG
            svg.selectAll("*").remove();

            // Define clip path for the bubble container
            svg.append("defs")
                .append("clipPath")
                .attr("id", "bubble-container-clip")
                .append("rect")
                .attr("x", PADDING)
                .attr("y", PADDING)
                .attr("width", width - 2 * PADDING)
                .attr("height", height - 2 * PADDING)
                .attr("rx", 10);

            // Add container rect
            svg.append("rect")
                .attr("class", "container-border")
                .attr("x", PADDING)
                .attr("y", PADDING)
                .attr("width", width - 2 * PADDING)
                .attr("height", height - 2 * PADDING)
                .attr("rx", 5)
                .attr("fill", "none")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");

            // Create container group
            svg.append("g")
                .attr("class", "main-container")
                .attr("clip-path", "url(#bubble-container-clip)")
                .append("g")
                .attr("class", "bubble-container")
                .attr("transform", `translate(${PADDING},${PADDING})`);
        } else {
            // Update existing container rect and clip path on resize
            svg.select("rect.container-border")
                .attr("width", width - 2 * PADDING)
                .attr("height", height - 2 * PADDING);

            svg.select("clipPath rect")
                .attr("width", width - 2 * PADDING)
                .attr("height", height - 2 * PADDING);
        }

        // Get the bubble container
        const g = svg.select(".bubble-container");

        // Create force simulation with dynamic forces and make it instant
        const simulation = d3.forceSimulation(newNodes)
            .force("center", d3.forceCenter((width - 2 * PADDING) / 2, (height - 2 * PADDING) / 2))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("collide", d3.forceCollide().radius((node: d3.SimulationNodeDatum) => (node as Node).radius + 2).strength(1))
            .force("x", d3.forceX((width - 2 * PADDING) / 2).strength(0.02))
            .force("y", d3.forceY((height - 2 * PADDING) / 2).strength(0.1));

        // Run simulation synchronously with more ticks for initial stability
        simulation.stop();
        for (let i = 0; i < 300; i++) {
            simulation.tick();
            // Add boundary forces during simulation
            newNodes.forEach((node: Node) => {
                if (!node.x || !node.y) return;
                const r = node.radius;
                const maxX = width - 2 * PADDING;
                const maxY = height - 2 * PADDING;
                node.x = Math.max(r, Math.min(maxX - r, node.x));
                node.y = Math.max(r, Math.min(maxY - r, node.y));
            });
        }

        // Calculate zoom parameters first
        const calculateZoomParams = () => {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            newNodes.forEach((node: Node) => {
                if (!node.x || !node.y) return;
                minX = Math.min(minX, node.x - node.radius);
                minY = Math.min(minY, node.y - node.radius);
                maxX = Math.max(maxX, node.x + node.radius);
                maxY = Math.max(maxY, node.y + node.radius);
            });

            const dx = maxX - minX;
            const dy = maxY - minY;
            const x = minX;
            const y = minY;

            const scale = 0.9 / Math.max(dx / (width - 2 * PADDING), dy / (height - 2 * PADDING));
            const translateX = (width - 2 * PADDING) / 2 - scale * (x + dx / 2);
            const translateY = (height - 2 * PADDING) / 2 - scale * (y + dy / 2);

            return { translateX, translateY, scale };
        };

        const { translateX, translateY, scale } = calculateZoomParams();

        // Update bubbles with transitions
        const bubbles = g.selectAll<SVGGElement, Node>("g.bubble")
            .data(newNodes, (d: Node) => d.id);

        // Remove exiting bubbles
        bubbles.exit()
            .transition()
            .duration(750)
            .style("opacity", 0)
            .remove();

        // Create new bubbles
        const bubblesEnter = bubbles.enter()
            .append("g")
            .attr("class", "bubble")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .style("opacity", 0);

        bubblesEnter.append("circle")
            .attr("r", 0)
            .style("fill", d => d.color)
            .style("opacity", 0.7)
            .style("stroke", "#fff")
            .style("stroke-width", 1);

        bubblesEnter.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("font-size", "0px");

        // Merge enter and update selections
        const bubblesMerge = bubbles.merge(bubblesEnter);

        // Apply all transitions simultaneously
        g.transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("transform", `translate(${PADDING + translateX},${PADDING + translateY}) scale(${scale})`);

        bubblesMerge.transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .style("opacity", 1)
            .attr("transform", d => `translate(${d.x},${d.y})`);

        bubblesMerge.select("circle")
            .transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("r", d => d.radius);

        bubblesMerge.select("text")
            .text(d => `${d.value.toFixed(1)}%`)
            .transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .style("font-size", d => `${Math.min(d.radius / 2.5, 12)}px`);

        // Add tooltips
        bubblesMerge
            .on("mouseover", function (_event: MouseEvent, d: unknown) {
                const node = d as Node;
                tooltip
                    .style("visibility", "visible")
                    .style("opacity", "1")
                    .html(`<strong>${node.name}</strong><br>${node.value.toFixed(1)}%`);
            })
            .on("mousemove", (event: MouseEvent) => {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
                tooltip
                    .style("opacity", "0")
                    .style("visibility", "hidden");
            });
    };

    // Clean up tooltip when component unmounts
    useEffect(() => {
        return () => {
            tooltip.remove();
        };
    }, []);

    // Effect for initial creation and party/election changes
    useEffect(() => {
        if (parteien.length > 0) {
            setSelectedParteiId(parteien[0].id);
        }
    }, [parteien]);

    const dropdownData: DropdownData = {
        label: undefined,
        defaultChosenId: parteien[0]?.id ?? 0,
        items: parteien.map((partei: Partei) => ({ label: partei.shortname, id: partei.id })),
    }

    // Prepare legend data
    const legendData = nodes.map(node => ({
        color: node.color,
        name: node.name,
        value: node.value
    }));


    return (
        <ContentTileC
            containerRef={ref}
            dropDownContent={dropdownData}
            dropDownFunction={setSelectedParteiId}
            header={"Ergebnisse nach Berufsgruppe"}
        >
            {dataIsAvailable ? (<>
                <div className="flex mb-10 flex-col w-full">
                    <div style={{ height: CHART_HEIGHT, width: '100%', marginTop: '-12px' }}>
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="100%"
                            style={{ maxWidth: '100%' }}
                        />
                    </div>
                    <div className="flex flex-row justify-start w-full px-10 -mt-7 mb-5">
                        <CheckboxC setEnabledInputFunct={setShowBundestagsabgeordneteOnly} label={"Nur Bundestagsabgeordnete anzeigen"} defaultChecked={showBundestagsabgeordneteOnly} />
                    </div>
                    <div className="px-10 py-4">
                        <div className="font-bold mb-4">Berufsgruppen</div>
                        <div className="grid font-normal sm:grid-cols-1 xl:grid-cols-2 gap-3">
                            {legendData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: item.color,
                                            opacity: 0.7
                                        }}
                                    />
                                    <div className="text-sm truncate" title={`${item.name}`}>
                                        {item.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full px-6">
                    <GridC gridData={berufsgruppenGridData} usePagination={false}
                        defaultSortColumnId={3}
                        defaultSortDirection={"desc"} />
                </div>
            </>
            ) : (
                <AlertC alertData={{
                    message: "Es stehen leider keine vollständigen Berufsdaten für diese Wahl zur Verfügung.",
                    type: AlertType.warning
                }} />
            )}
        </ContentTileC>

    );
}