"use client";

import * as React from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapControls, MapMarker, type MapViewport } from "@/components/ui/map";
import type { ArtworkMetadataField } from "./artwork-info-card";

export interface ExhibitArtworkInfo {
  title: string;
  imageSrc: string;
  summary: string;
  metadata: ArtworkMetadataField[];
}

export interface ExhibitNavigationState {
  startId: string;
  destinationId: string;
  currentNodeId?: string | null;
}

interface ExhibitFloorMapViewProps {
  onSelectArtwork?: (artwork: ExhibitArtworkInfo) => void;
  navigationState?: ExhibitNavigationState;
  onNavigationStateChange?: (state: ExhibitNavigationState) => void;
  initialViewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
}

type Point = [number, number];
const toCoordinate = (x: number, y: number): Point => [(x - 600) * 0.00005, (340 - y) * 0.00005];
type ExhibitWork = {
  id: string; title: string; artist: string; year: string; room: string;
  image: string; x: number; y: number; description: string; accessNode: string;
};
type AmenityKind = "information" | "restroom" | "accessible" | "stairs" | "elevator" | "cafe" | "shop" | "seat" | "water" | "exit";
type Amenity = {
  id: string; label: string; kind: AmenityKind; x: number; y: number;
  accessNode: string; accessPath: Point[];
};
type Place = {
  id: string; label: string; x: number; y: number; accessNode: string;
  accessPath: Point[]; kind: "artwork" | AmenityKind;
};

const roomLabels = [
  { name: "Gallery 01", x: 220, y: 260 },
  { name: "Gallery 02", x: 420, y: 260 },
  { name: "Gallery 03", x: 600, y: 260 },
  { name: "Gallery 04", x: 785, y: 260 },
  { name: "Gallery 05", x: 995, y: 260 },
  { name: "Gallery 06", x: 245, y: 520 },
];
const nodes: Record<string, Point> = {
  entrance: [90,335], west: [250,335], midwest: [470,335], center: [680,335], east: [900,335], farEast: [1100,335],
  lowerWest: [260,375], lowerCenter: [620,375], lowerEast: [930,375],
};
const edges: [string,string][] = [
  ["entrance","west"],["west","midwest"],["midwest","center"],["center","east"],["east","farEast"],
  ["west","lowerWest"],["midwest","lowerCenter"],["center","lowerCenter"],["east","lowerEast"],["farEast","lowerEast"],
  ["lowerWest","lowerCenter"],["lowerCenter","lowerEast"],
];
const works: ExhibitWork[] = [
  { id:"starry",title:"The Starry Night",artist:"Vincent van Gogh",year:"1889",room:"Gallery 01",image:"/starry-night.jpg",x:220,y:205,accessNode:"west",description:"A vivid night sky of rolling blues, bright stars, and a quiet village, painted during van Gogh’s stay in Saint-Rémy." },
  { id:"lilies",title:"Water Lilies",artist:"Claude Monet",year:"1916",room:"Gallery 02",image:"/water-lilies.jpg",x:420,y:205,accessNode:"midwest",description:"Monet’s late garden paintings turn the pond at Giverny into a shifting study of color, light, and reflection." },
  { id:"sunflowers",title:"Sunflowers",artist:"Vincent van Gogh",year:"1888",room:"Gallery 03",image:"/sunflowers.jpg",x:600,y:205,accessNode:"center",description:"A brilliant still life from van Gogh’s Arles period, painted in anticipation of welcoming fellow artists to his Yellow House." },
  { id:"crows",title:"Wheatfield with Crows",artist:"Vincent van Gogh",year:"1890",room:"Gallery 04",image:"/assets/timeline/auvers.jpg",x:785,y:205,accessNode:"east",description:"A late-period landscape with crows crossing a restless sky above a golden field." },
  { id:"study",title:"The Starry Night (Study)",artist:"Vincent van Gogh",year:"1889",room:"Gallery 05",image:"/starry-night-sketch.jpg",x:995,y:205,accessNode:"farEast",description:"A preparatory study that offers a closer look at the flowing forms behind one of van Gogh’s best-known night scenes." },
  { id:"portrait",title:"Self-Portrait in a Grey Felt Hat",artist:"Vincent van Gogh",year:"1887",room:"Gallery 06",image:"/assets/timeline/paris.jpg",x:245,y:465,accessNode:"lowerWest",description:"A Paris-period self-portrait that shows van Gogh exploring short, directional brushstrokes and complementary color." },
];

const amenities: Amenity[] = [
  { id:"information",label:"Information",kind:"information",x:350,y:335,accessNode:"west",accessPath:[[250,335],[350,335]] },
  { id:"restrooms",label:"Restrooms",kind:"restroom",x:455,y:335,accessNode:"midwest",accessPath:[[470,335],[455,335]] },
  { id:"accessible-restroom",label:"Accessible Restroom",kind:"accessible",x:560,y:335,accessNode:"midwest",accessPath:[[470,335],[535,335],[560,335]] },
  { id:"stairs",label:"Stairs",kind:"stairs",x:135,y:405,accessNode:"west",accessPath:[[250,335],[220,335],[170,370],[135,405]] },
  { id:"elevator",label:"Elevator",kind:"elevator",x:1040,y:405,accessNode:"farEast",accessPath:[[1100,335],[1080,370],[1040,405]] },
  { id:"seating",label:"Seating",kind:"seat",x:700,y:335,accessNode:"center",accessPath:[[680,335]] },
  { id:"water",label:"Drinking Water",kind:"water",x:815,y:335,accessNode:"center",accessPath:[[680,335],[760,335],[815,335]] },
  { id:"cafe",label:"Café",kind:"cafe",x:560,y:500,accessNode:"lowerCenter",accessPath:[[620,375],[600,420],[560,500]] },
  { id:"shop",label:"Museum Shop",kind:"shop",x:900,y:500,accessNode:"lowerEast",accessPath:[[930,375],[930,435],[900,500]] },
  { id:"main-entrance",label:"Main Entrance",kind:"exit",x:90,y:335,accessNode:"entrance",accessPath:[[90,335]] },
  { id:"exit-east",label:"East Exit",kind:"exit",x:1125,y:335,accessNode:"farEast",accessPath:[[1100,335],[1125,335]] },
];
const places: Place[] = [
  { id:"entrance",label:"Main Entrance",x:90,y:335,accessNode:"entrance",accessPath:[[90,335]],kind:"exit" },
  ...works.map((work): Place => ({
    id:"art:"+work.id,label:work.title,x:work.x,y:work.y,accessNode:work.accessNode,
    accessPath:work.accessNode==="lowerWest"
      ? [[260,375],[250,390],[work.x,work.y]]
      : [[nodes[work.accessNode][0],nodes[work.accessNode][1]],[work.x,300],[work.x,270],[work.x,work.y]],
    kind:"artwork",
  })),
  ...amenities.map((amenity): Place => ({ id:`facility:${amenity.id}`,label:amenity.label,x:amenity.x,y:amenity.y,accessNode:amenity.accessNode,accessPath:amenity.accessPath,kind:amenity.kind })),
];

const mapStyle: MapLibreGL.StyleSpecification = {
  version:8,
  sources:{},
  layers:[{ id:"exhibit-background",type:"background",paint:{"background-color":"#f4f5f7"} }],
};

function addFloorLayers(map: MapLibreGL.Map) {
  if (map.getSource("exhibit-floorplan-image")) return;
  map.addSource("exhibit-floorplan-image", {
    type: "image",
    url: "/museum-floorplan-transparent.png",
    coordinates: [
      toCoordinate(40,40),
      toCoordinate(1180,40),
      toCoordinate(1180,660),
      toCoordinate(40,660),
    ],
  });
  map.addLayer({
    id: "exhibit-floorplan-image-layer",
    type: "raster",
    source: "exhibit-floorplan-image",
    paint: { "raster-fade-duration": 0 },
  });
  map.addSource("exhibit-route",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
  map.addLayer({id:"exhibit-route-casing",type:"line",source:"exhibit-route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#ffffff","line-width":9,"line-opacity":0.95}});
  map.addLayer({id:"exhibit-route-line",type:"line",source:"exhibit-route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#2458a6","line-width":5,"line-dasharray":[1.2,0.7]}});
}
function shortestPath(start:string,end:string): string[] {
  const distance:Record<string,number>={};
  const previous:Record<string,string|undefined>={};
  const remaining=new Set(Object.keys(nodes));
  for(const id of remaining) distance[id]=Infinity;
  distance[start]=0;
  while(remaining.size){
    let current:string|undefined;
    for(const id of remaining) if(current===undefined||distance[id]<distance[current]) current=id;
    if(current===undefined||distance[current]===Infinity) break;
    remaining.delete(current);
    if(current===end) break;
    for(const [a,b] of edges){
      const next=a===current?b:b===current?a:undefined;
      if(!next||!remaining.has(next)) continue;
      const from=nodes[current],to=nodes[next];
      const candidate=distance[current]+Math.hypot(to[0]-from[0],to[1]-from[1]);
      if(candidate<distance[next]){distance[next]=candidate;previous[next]=current;}
    }
  }
  if(start!==end&&!previous[end]) return [];
  const route=[end];
  let cursor=end;
  while(cursor!==start){const parent=previous[cursor];if(!parent)return [];route.unshift(parent);cursor=parent;}
  return route;
}

function buildRoute(state:ExhibitNavigationState): Point[] {
  if(!state.destinationId) return [];
  const destination=places.find((place)=>place.id===state.destinationId);
  const origin=state.startId==="current"
    ? state.currentNodeId ? {accessNode:state.currentNodeId,accessPath:[nodes[state.currentNodeId]]} : null
    : places.find((place)=>place.id===state.startId);
  if(!origin||!destination) return [];
  const nodeRoute=shortestPath(origin.accessNode,destination.accessNode);
  if(!nodeRoute.length) return [];
  const points=[...origin.accessPath].reverse();
  for(const id of nodeRoute.slice(1)) points.push(nodes[id]);
  points.push(...destination.accessPath.slice(1));
  return points.filter((point,index)=>index===0||point[0]!==points[index-1][0]||point[1]!==points[index-1][1]);
}

function artworkInfo(work:ExhibitWork): ExhibitArtworkInfo {
  return {
    title:work.title,imageSrc:work.image,summary:work.description,
    metadata:[{label:"Artist",value:work.artist},{label:"Date",value:work.year},{label:"Gallery",value:work.room}],
  };
}

function AmenityIcon({kind,className=""}:{kind:AmenityKind;className?:string}) {
  const common={fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...common}>
    {kind==="information"&&<><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>}
    {kind==="restroom"&&<><circle cx="7" cy="4" r="1.6"/><circle cx="17" cy="4" r="1.6"/><path d="M5 8v5h4v8M19 8v5h-4v8M3 8h8m2 0h8"/></>}
    {kind==="accessible"&&<><circle cx="10" cy="4" r="1.6"/><path d="M9 8h4l2 4h4m-9-4-1 5 4 2 2 5m-6-8a5 5 0 1 0 5 5"/></>}
    {kind==="stairs"&&<path d="M3 19h5v-4h4v-4h4V7h5M3 22h18"/>}
    {kind==="elevator"&&<><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="m9 9 3-3 3 3m-6 6 3 3 3-3"/></>}
    {kind==="cafe"&&<><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Zm13 1h2a2.5 2.5 0 0 1 0 5h-2M3 22h16M8 5c-1-1 1-2 0-3m5 3c-1-1 1-2 0-3"/></>}
    {kind==="shop"&&<><path d="M4 8h16l1 13H3L4 8Zm4 0V6a4 4 0 1 1 8 0v2"/></>}
    {kind==="seat"&&<path d="M5 12V7h3v5h9V7h3v8H5v5m-2 0h18"/>}
    {kind==="water"&&<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>}
    {kind==="exit"&&<><path d="M14 3h6v18h-6M4 12h12m-5-5 5 5-5 5"/><path d="M4 5v14"/></>}
  </svg>;
}

export function ExhibitFloorMapView({
  onSelectArtwork,
  navigationState: controlledNavigationState,
  onNavigationStateChange: controlledNavigationChange,
  initialViewport,
  onViewportChange,
}:ExhibitFloorMapViewProps) {
  const [mapInstance,setMapInstance]=React.useState<MapLibreGL.Map|null>(null);
  const [internalNavigation,setInternalNavigation]=React.useState<ExhibitNavigationState>({startId:"entrance",destinationId:"",currentNodeId:null});
  const navigationState=controlledNavigationState??internalNavigation;
  const onNavigationStateChange=controlledNavigationChange??setInternalNavigation;
  const mapViewport=initialViewport??{center:[-0.002,-0.001] as [number,number],zoom:14.1,pitch:0,bearing:0};


  const handleMapReady=React.useCallback((map:MapLibreGL.Map)=>{
    addFloorLayers(map);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    if (!initialViewport) {
      map.fitBounds(
        [toCoordinate(40,660),toCoordinate(1180,40)],
        {padding:map.getContainer().clientWidth<640?18:36,maxZoom:14.6,duration:0},
      );
    }
    setMapInstance(map);
  },[initialViewport]);
  const routePoints=React.useMemo(()=>buildRoute(navigationState),[navigationState]);
  React.useEffect(()=>{
    if(!mapInstance) return;
    const source=mapInstance.getSource("exhibit-route") as MapLibreGL.GeoJSONSource|undefined;
    if(!source) return;
    const coordinates=routePoints.map(([x,y])=>toCoordinate(x,y));
    source.setData(coordinates.length>1
      ? {type:"Feature",properties:{},geometry:{type:"LineString",coordinates}}
      : {type:"FeatureCollection",features:[]});
    if(routePoints.length>1){
      const minX=Math.min(...routePoints.map(([x])=>x)),maxX=Math.max(...routePoints.map(([x])=>x));
      const minY=Math.min(...routePoints.map(([,y])=>y)),maxY=Math.max(...routePoints.map(([,y])=>y));
      const compact=mapInstance.getContainer().clientWidth<640;
      mapInstance.fitBounds([toCoordinate(minX,maxY),toCoordinate(maxX,minY)],{
        padding:compact?{top:112,right:28,bottom:48,left:28}:{top:70,right:40,bottom:42,left:40},
        maxZoom:14.3,duration:550,
      });
    }
  },[mapInstance,navigationState.destinationId,routePoints]);

  const routeDestination=places.find((place)=>place.id===navigationState.destinationId);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-[#f4f5f7]">
      <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-[#f4f5f7]">
      <Map
        style={mapStyle}
        initialCenter={mapViewport.center}
        initialZoom={mapViewport.zoom}
        initialPitch={0}
        initialBearing={0}
        minZoom={10.5}
        maxPitch={0}
        onMapReady={handleMapReady}
        onViewportChange={onViewportChange??(()=>{})}
        className="h-full w-full"
      >
        {works.map((work)=>{
          const [longitude,latitude]=toCoordinate(work.x,work.y);
          return <MapMarker key={work.id} longitude={longitude} latitude={latitude} anchor="center">
            <button type="button" aria-label={`Open ${work.title} by ${work.artist}, ${work.year}`} title={work.title} onClick={()=>onSelectArtwork?.(artworkInfo(work))} className="group flex size-[62px] items-center justify-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20211f]">
              <span className="block size-[58px] overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] ring-1 ring-[#333a37] transition-transform group-hover:scale-110 group-focus-visible:scale-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}<img src={work.image} alt="" className="h-full w-full object-cover" />
              </span>
            </button>
          </MapMarker>;
        })}

        {roomLabels.map((room)=>{
          const [longitude,latitude]=toCoordinate(room.x,room.y);
          return <MapMarker key={room.name} longitude={longitude} latitude={latitude} anchor="center"><span aria-hidden="true" className="whitespace-nowrap text-xs font-semibold tracking-[0.02em] text-[#172027] [text-shadow:0_1px_2px_white,0_-1px_2px_white,1px_0_2px_white,-1px_0_2px_white]">{room.name}</span></MapMarker>;
        })}

        {amenities
          .filter((amenity) => !["information", "restrooms", "accessible-restroom", "seating", "water", "main-entrance", "exit-east"].includes(amenity.id))
          .map((amenity) => {
            const [longitude, latitude] = toCoordinate(amenity.x, amenity.y);
            return (
              <MapMarker key={amenity.id} longitude={longitude} latitude={latitude} anchor="center">
                <div aria-label={amenity.label} title={amenity.label} className="flex items-center gap-1.5 px-1 py-0.5 text-left text-[#172027]">
                  <AmenityIcon kind={amenity.kind} className="size-[21px] shrink-0 stroke-[2.1px]" />
                  <span className="whitespace-nowrap bg-[#f4f5f7]/95 px-0.5 text-[10px] font-medium leading-tight">{amenity.label}</span>
                </div>
              </MapMarker>
            );
          })}
        {routePoints.length>1&&<>
          {(() => {const [longitude,latitude]=toCoordinate(routePoints[0][0],routePoints[0][1]);return <MapMarker longitude={longitude} latitude={latitude} anchor="center"><span aria-label="Route starts here" className="block size-4 rounded-full border-[3px] border-white bg-[#2458a6] shadow-md"/></MapMarker>;})()}
          {routeDestination&&(()=>{const [longitude,latitude]=toCoordinate(routeDestination.x,routeDestination.y);return <MapMarker longitude={longitude} latitude={latitude} anchor="center"><span aria-label="Destination" className="block size-4 rounded-full border-[3px] border-white bg-[#db4b3f] shadow-md"/></MapMarker>;})()}
        </>}

        <MapControls show3D={false} showCompass={false} className="right-4 bottom-4" />
      </Map>

      </div>
    </div>
  );
}